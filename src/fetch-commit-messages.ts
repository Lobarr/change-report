import {exec} from 'child_process'
import {promisify} from 'util'
import * as core from '@actions/core'

const execAsync = promisify(exec)

/**
 * A structured representation of a git commit.
 */
interface Commit {
  hash: string
  author: string
  date: string
  message: string
}

/**
 * Parses a raw commit entry string into a structured Commit object.
 * @param entry The raw string for a single commit from git log.
 * @returns A structured Commit object or null if parsing fails.
 */
const parseCommit = (entry: string): Commit | null => {
  const hashMatch = entry.match(/^COMMIT_HASH: (.*)$/m)
  const authorMatch = entry.match(/^COMMIT_AUTHOR: (.*)$/m)
  const dateMatch = entry.match(/^COMMIT_DATE: (.*)$/m)
  // Use 's' flag (dotAll) to make '.' match newlines for the message body
  const messageMatch = entry.match(
    /COMMIT_MESSAGE_START\n([\s\S]*?)\nCOMMIT_MESSAGE_END/
  )

  if (hashMatch && authorMatch && dateMatch && messageMatch) {
    return {
      hash: hashMatch[1],
      author: authorMatch[1],
      date: dateMatch[1],
      message: messageMatch[1].trim()
    }
  }
  return null
}

/**
 * Fetches commit messages from the last N days and logs them in a clean,
 * readable format for debugging.
 * @param daysCount The number of days to look back for commits.
 * @returns A promise that resolves to an array of raw commit entry strings.
 */
export const fetchCommitMessages = async (
  daysCount: number
): Promise<string[]> => {
  core.debug(
    `Fetching detailed commit messages for the last ${daysCount} days.`
  )

  // A unique, multi-character delimiter is more robust for splitting.
  const commitDelimiter = '---GIT_COMMIT_DELIMITER---'
  const format = `COMMIT_HASH: %H%nCOMMIT_AUTHOR: %an%nCOMMIT_DATE: %ar%nCOMMIT_MESSAGE_START%n%B%nCOMMIT_MESSAGE_END`

  const {stdout} = await execAsync(
    `git log --since="${daysCount} days ago" --pretty=format:"${format}${commitDelimiter}"`
  )

  // Split by the delimiter, trim whitespace, and filter out any empty strings
  // that might result from the final delimiter.
  const commitEntries = stdout
    .split(commitDelimiter)
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0)

  core.debug(`Found ${commitEntries.length} detailed commit entries.`)

  // Log parsed commits for clean, readable debug output.
  commitEntries.forEach((entry, index) => {
    const commit = parseCommit(entry)
    if (commit) {
      core.debug(`--- Commit ${index + 1} ---`)
      core.debug(`  Hash: ${commit.hash}`)
      core.debug(`  Author: ${commit.author}`)
      core.debug(`  Date: ${commit.date}`)
      core.debug(`  Message:`)
      // **THE FIX**: Split the message by newlines and log each line
      // separately. This prevents passing a multiline string to core.debug,
      // which avoids the URL-encoding issue.
      commit.message.split('\n').forEach(line => {
        core.debug(`    ${line}`)
      })
    } else {
      core.debug(`Could not parse commit entry ${index + 1}:\n${entry}`)
    }
  })

  // The function still returns the raw entries as its public contract requires.
  return commitEntries
}
