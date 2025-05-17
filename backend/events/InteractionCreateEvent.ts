import type {
  ClientEvents,
  CommandInteractionOptionResolver,
  GuildMember,
  Interaction,
} from "discord.js";
import type { Event, ExtendedInteraction } from "../core/typings";
import { app } from "..";
import { int } from "drizzle-orm/mysql-core";
import { disabledCommand } from "../utils/misc";
import config from "../config";

export default {
  name: "interactionCreate",
  run: async (interaction: Interaction) => {
    if (interaction.isCommand() && interaction.guild) {
      const cmdName = interaction.commandName
        ? interaction.commandName.toLowerCase()
        : null;
      if (!cmdName) {
        return interaction.reply({
          content: `${config.emojis.cross} Unable to find command: \`/${cmdName}\``,
          flags: ["Ephemeral"],
        });
      }

      const command = app.commands.get(cmdName);
      if (!command) {
        return interaction.reply({
          content: `${config.emojis.cross} Unable to find command: \`/${cmdName}\``,
          flags: ["Ephemeral"],
        });
      }

      interaction.member = interaction.guild?.members.cache.find(
        (f) => f.id === interaction.user.id
      ) as GuildMember;

      if (
        await disabledCommand(command.name.toLowerCase(), interaction.guild.id)
      ) {
        return interaction.reply({
          ephemeral: true,
          content: `${config.emojis.cross} This command is disabled.`
        });
      }

      if (
        command.adminOnly &&
        !interaction.member.permissions.has("Administrator")
      ) {
        return interaction.reply({
          ephemeral: true,
          content:
            `${config.emojis.admin} You are missing the required permissions to use this command.`,
        });
      }

      
      command.run({
        args: interaction.options as CommandInteractionOptionResolver,
        client: app,
        ctx: interaction as ExtendedInteraction,
      });
    }
  },
} as Event<keyof ClientEvents>;
