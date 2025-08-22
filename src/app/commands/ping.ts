import { ChatInputCommand } from 'commandkit';
import { ApplicationIntegrationType, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';

export const command = new SlashCommandBuilder()
  .setName("latency")
  .setDescription("Check bot latency")
  .setContexts(InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
  .setIntegrationTypes(ApplicationIntegrationType.UserInstall)

export const chatInput: ChatInputCommand = async (ctx) => {
  const latency = (ctx.client.ws.ping ?? -1).toString();
  const response = `latency: ${latency}ms`;

  await ctx.interaction.reply({content: response, flags: MessageFlags.Ephemeral});
};
