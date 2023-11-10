const { EmbedBuilder } = require("discord.js");
const bconfig = require("../brawl-config.json")
const config = require("../../../config.json");

function getAnnouncementEmbed(setupModel) {
    const name = setupModel.name;
    const theme = setupModel.theme;
    const series = setupModel.series;
    const sketch = setupModel.sketch;
    const size = setupModel.cards.size;
    const unixStartTime = setupModel.unixStartTime;

    let sketchText;
    switch (sketch) {
        case "prohibited": {
            sketchText = "\n🩸 Not Sketched";
            break;
        }
        case "optional": {
            sketchText = "\n🩸 Sketched";
            break;
        }
    }

    // Description
    const headers = `Size: **${size}** card${
        size === 1 ? "" : "s"
    } submitted\nTheme: **${theme}**\nSeries: **${series ?? "Any"}**\nDate: <t:${unixStartTime}:f>`;

    const requirements = `\n\n**Requirements**:${
        series ? "\n🏷️ Match series" : ""
    }\n🖼️ Framed\n🎨 Morphed${
        sketch === "prohibited" ? sketchText : ""
    }\n\n**Optional**:\n💧 Dyed\n✂️ Trimmed${sketch === "optional" ? sketchText : ""}`;

    const bonuses = `\n\n**Bonus Entries**:\n<@&${config.serverSubscriberRole}> **+1** entry\n\n**Bonus Votes**: *(Does not stack)*\n<@&${bconfig.activeBoosterRole}> **+${bconfig.activeBoosterBonus}** vote\n<@&${config.serverSubscriberRole}> **+${config.serverSubscriberBonus}** vote`;
    // `Size: **${size}** cards\nStatus: **${size - competitors}/${size}** spots available\nTheme: **${theme}**\nDate: <t:${unixStartTime}:f>\n\n**Bonus Entries**: *(1x = 1 extra)*\n<@&${config.serverSubscriberRole}> **1x** entry\n\n**Bonus Votes**:\n<@&${config.serverBoosterRole}> **${config.serverBoosterBonus}x** vote\n<@&${config.activeBoosterRole}> **${config.activeBoosterBonus}x** votes\n<@&${config.serverSubscriberRole}> **${config.serverSubscriberBonus}x** votes\n\n**Requirements**:\n🖼️ Framed\n🎨 Morphed\n🩸 Not Sketched\n\n**Optional**:\n💧 Dyed\n✂️ Trimmed`

    const embed = new EmbedBuilder()
        .setColor(config.blue)
        .setTitle(`${name}`)
        .setDescription(headers + requirements + bonuses);
    return embed;
}

module.exports = getAnnouncementEmbed;
