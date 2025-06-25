import {Client, GatewayIntentBits, TextChannel} from 'discord.js'
import * as core from '@actions/core'

export const sendDiscordMessage = async (
  channelId: string,
  message: string
): Promise<void> => {
  core.debug(`Sending Discord message to channel ID: ${channelId}`)
  core.debug(`Message content: ${message}`)
  const discord = new Client({
    intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages]
  })
  await discord.login(process.env.DISCORD_BOT_TOKEN)
  core.debug('Logged into Discord.')

  const discordChannel = await discord.channels.fetch(channelId)
  core.debug(`Fetched Discord channel: ${discordChannel?.id}`)

  if (!discordChannel) {
    throw new Error(`Discord channel ${channelId} not found`)
  }

  if (!discordChannel.isTextBased()) {
    throw new Error(`Discord channel ${channelId} is not text-based`)
  }

  const textChannel = discordChannel as TextChannel
  await textChannel.send({
    content: message
  })
  core.debug('Discord message sent.')

  discord.destroy()
  core.debug('Discord client destroyed.')
}
