import type {
  ClientEvents,
  CommandInteractionOptionResolver,
  GuildMember,
  Interaction,
} from "discord.js";
import type { Event, ExtendedInteraction } from "../core/typings";
import { app } from "..";
import { int } from "drizzle-orm/mysql-core";

export default {
  name: "interactionCreate",
  run: (interaction: Interaction) => {
    if (interaction.isCommand()) {
      const cmdName = interaction.commandName
        ? interaction.commandName.toLowerCase()
        : null;
      if (!cmdName) {
        return interaction.reply({
          content: `Unable to find command: \`/${cmdName}\``,
          flags: ["Ephemeral"],
        });
      }

      const command = app.commands.get(cmdName);
      if (!command) {
        return interaction.reply({
          content: `Unable to find command: \`/${cmdName}\``,
          flags: ["Ephemeral"],
        });
      }

      interaction.member = interaction.guild?.members.cache.find(
        (f) => f.id === interaction.user.id
      ) as GuildMember;

      if (
        command.adminOnly &&
        !interaction.member.permissions.has("Administrator")
      ) {
        return interaction.reply({
          ephemeral: true,
          content:
            "You are missing the required permissions to use this command.",
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
