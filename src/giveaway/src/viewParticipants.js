const { EmbedBuilder } = require("discord.js");
const GiveawayModel = require("../schemas/giveawaySchema");
const buttonPages = require("../../support/src/pagination");
const config = require("../../../config.json");

async function viewParticipants(interaction) {
    const messageID = interaction.message.id;

    const giveawayModel = await GiveawayModel.findOne({ messageID }).exec();
    if (!giveawayModel) {
        console.error("Couldn't retrieve Giveaway Model");
        return;
    }

    // Format competitors into lines
    let lines = [];
    const mapArray = Array.from(giveawayModel.entries.entries());
    mapArray.forEach(([key, value]) => {
        const entries =
            value == 1
                ? `(**1** ${config.emoji.token} entry)`
                : `(**${value}** ${config.emoji.token} entries)`;
        lines.push(`${lines.length + 1}. <@${key}> ${entries}`);
    });

    // Create page embeds
    let pages = [];
    let description = "";
    for (let i = 0, lineNum = 0, pageNum = 1; i < lines.length; i++) {
        description += lines[i] + "\n";
        lineNum++;

        if (lineNum === 10 || i === lines.length - 1) {
            const embed = new EmbedBuilder()
                .setTitle(`Giveaway`)
                .setDescription("**Participants**:\n" + description)
                .setFooter({ text: `Page ${pageNum}` });
            pages.push(embed);

            lineNum = 0;
            pageNum++;
            description = "";
        }
    }
    buttonPages(interaction, pages, true);
}

module.exports = viewParticipants;
