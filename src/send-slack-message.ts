import {App} from '@slack/bolt'
import * as core from '@actions/core'

export const sendSlackMessage = async (
  channel: string,
  message: string
): Promise<void> => {
  core.debug(`Sending Slack message to channel: ${channel}`)
  core.debug(`Message content: ${message}`)
  const app = new App({
    token: process.env.SLACK_BOT_TOKEN!,
    signingSecret: process.env.SLACK_SIGNING_SECRET!
  })

  await app.client.chat.postMessage({
    channel,
    mrkdwn: true,
    text: 'Codebase changes summary',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: message
        }
      }
    ]
  })
  core.debug('Slack message sent.')
}
