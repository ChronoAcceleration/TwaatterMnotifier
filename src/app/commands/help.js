import { ApplicationIntegrationType, InteractionContextType, MessageFlags, SlashCommandBuilder } from 'discord.js';

/**
 * @type {import('commandkit').CommandData}
 */
export const command = new SlashCommandBuilder()
  .setName("help")
  .setDescription("How do I use you!??")
  .setContexts(InteractionContextType.BotDM, InteractionContextType.PrivateChannel)
  .setIntegrationTypes(ApplicationIntegrationType.UserInstall)

/**
 * @param {import('commandkit').MessageCommandContext} ctx
 */
export const message = async (ctx) => {
  const response = `hey, i'm TwaatterMnotifier. all you gotta do is open my dm, paste in a twitter account and ill start monitoring them for you. Any changes will be seen and I will shoot you a message.`
  await ctx.message.reply({content: response, flags: MessageFlags.Ephemeral});
};
