import { ChatInputCommand } from 'commandkit';
import { ApplicationIntegrationType, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';

export const command = new SlashCommandBuilder()
  .setName('help')
  .setDescription('How do I use you!??')
  .setContexts(InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
  .setIntegrationTypes(ApplicationIntegrationType.UserInstall);

export const chatInput: ChatInputCommand = async (ctx) => {
  const response = `hey, i'm TwaatterMnotifier. all you gotta do is open my dm, paste in a twitter account and ill start monitoring them for you. Any changes will be seen and I will shoot you a message.`;
  await ctx.interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
};
