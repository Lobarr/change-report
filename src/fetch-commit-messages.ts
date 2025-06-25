import {exec} from 'child_process'
import {promisify} from 'util'
import * as core from '@actions/core'

const execAsync = promisify(exec)

export const fetchCommitMessages = async (
  daysCount: number
): Promise<string[]> => {
  core.debug(`Fetching commit messages for the last ${daysCount} days.`)
  const {stdout} = await execAsync(
    `git log --since="${daysCount} days ago" --pretty=format:"%s"`
  )
  const commitMessages = stdout.split('\n').filter(message => message !== '')
  core.debug(`Found ${commitMessages.length} commit messages.`)
  return commitMessages
}
