const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const { client } = require("../../index");
const config = require("../../../config.json")
const create = require("./brawl/create");
const enter = require("./brawl/enter");
const start = require("./brawl/start");
const instructions = require("./brawl/instructions");
const stats = require("./brawl/stats");
const winner = require("./brawl/winner");

module.exports = {
    category: "public",
    data: new SlashCommandBuilder()
        .setName("brawl")
        .setDescription("Brawl main command.")
        .addSubcommand(create.data)
        .addSubcommand(enter.data)
        .addSubcommand(start.data)
        .addSubcommand(instructions.data)
        .addSubcommand(stats.data)
        .addSubcommand(winner.data),
    async execute(interaction) {
        // // Keep slash commands in designated channels
        // const guild = client.guilds.cache.get(config.guildID);
        // const hasSendMessagePermission = interaction.channel
        //     .permissionsFor(guild.members.me)
        //     .has(PermissionsBitField.Flags.EmbedLinks);
        // if (!hasSendMessagePermission) {
        //     // Bot doesn't have 'SEND_MESSAGES' permission in this channel
        //     await interaction.reply({
        //         content: "I am missing the `Embed Links` permission.",
        //         ephemeral: true,
        //     });
        //     return;
        // }

        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case "create": {
                await create.execute(interaction);
                break;
            }
            case "enter": {
                await enter.execute(interaction);
                break;
            }
            case "start": {
                await start.execute(interaction);
                break;
            }
            case "instructions": {
                await instructions.execute(interaction);
                break;
            }
            case "stats": {
                await stats.execute(interaction);
                break;
            }
            case "winner": {
                await winner.execute(interaction);
                break;
            }
            default: {
                await interaction.reply(
                    "There was no case for the subcommand. Go fix the code."
                );
            }
        }
    },
};
