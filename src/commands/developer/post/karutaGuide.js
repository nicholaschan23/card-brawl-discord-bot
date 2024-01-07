const { SlashCommandSubcommandBuilder } = require("discord.js");
const config = require("../../../../config.json");

const section1 =
    `# How To Play\n` +
    `Karuta is a collectible card game with anime characters. It turns these characters into unique collectibles that you can earn, customize, upgrade, trade, and more!\n` +
    `### Drop and grab\n` +
    `- Use \`kd\` in <#${config.channelID.karutaDrop}> to drop a random set of cards\n` +
    `- Use the :one:, :two:, or :three: reaction that corresponds to the card you want to grab\n` +
    ` - Tip: Be quick to grab! Other players can grab your cards too\n` +
    `### View a card\n` +
    `- Use \`kv\` to view the card you just grabbed\n` +
    `- Use \`kci\` to see the card info with detailed stats\n` +
    `- Use \`klu\` to look up more info about the featured character\n` +
    `### Currency\n` +
    `There are several currencies used in Karuta.\n` +
    `- Use \`kb\` to burn cards of no value for :sparkles:(dust) and :moneybag:(gold)\n` +
    `- Use \`kvote\` to get :tickets:(tickets) every 12 hours\n` +
    ` - Tip: This is the most useful currency in the game\n` +
    `- Use \`kgems\` to buy :gem:(gems) with real money\n` +
    `### Trade\n` +
    `All cards in your collection and items in your inventory are tradeable with other players\n` +
    `- Use \`kc\` to view a full list of the cards you own\n` +
    `- Use \`ki\` to view your inventory\n` +
    `### Want to learn more?\n` +
    `- Use \`khelp\` for a full list of commands\n` +
    `- Use \`khelp <command>\` to get more details about a particular command\n` +
    `For additional help, ask the community in <#${config.channelID.cardDiscussion}>.`;

const section2 =
    `# Collection Tags\n` +
    `You can organize and label cards in your collection with tags.\n` +
    `- Use \`ktagcreate\` to create a tag\n` +
    `- Use \`kt <tag name> <card code>\` to tag a card (leave \`<card code>\` blank to tag the most recent card)\n` +
    `- Use \`ktl <@user | user ID>\` to view a player's tags\n` +
    `### Common tags\n` +
    `- **trade**: cards that are for trade\n` +
    `- **keep**: cards that are not for trade\n` +
    `- **burn**: cards to turn into :moneybag: and dust (\`kmb t=burn\`)\n` +
    `- **<series name>**: cards of series you're collecting\n`;

const section3 =
    `# Working\n` +
    `To get bits for frames and morphing your cards, you need to setup a job board to work on nodes.\n` +
    `### Acquire a work permit\n` +
    `- Use \`kbuy work permit\` (2000:moneybag: and last for 30 days)\n` +
    `- Use \`kuse work permit\` to activate it\n` +
    `### Find your highest effort cards\n` +
    `Maximize your total effort to maximize total bits generated (1 effort = 1 bit).\n` +
    `- Use \`kc o=ef\ to find the 5 highest effort cards\n` +
    `- Use \`kwi <card code>\` to check a card's effort\n` +
    `### Assign cards to your job board\n` +
    `- Use \`kjw <slot> <card code>\` to add a card to your job board\n` +
    ` - For example \`kjw a c0de99\`\n` +
    ` - Do this for A-E\n` +
    `- Use \`kjb\` to check your job board\n` +
    `### Assign workers to a node\n` +
    `- Use \`kn\` to see the node taxes\n` +
    ` - Tip: The tax % set at each node will be deducted from your earning\b\n` +
    `- Use \`kjn <slot(s)> <node>\` to assign workers to a node\n` +
    ` - For example \`kjn a zinc\` to assign 1 or \`kjn abcde zinc\` to assign all\n` +
    `### Send out workers\n` +
    `- Use \`kw\` to send your workers out to collect bits immediately`;

const section4 =
    `# Worker Injury\n` +
    `Whenever you work, workers have a chance of being injured and are out of commission for a period between **1 and 30 days**. It's vital that you have backup workers when this eventually happens, since injured workers only have **20% of their original effort**.\n\n` +
    `Below are the injury rates when conducting a single work session:\n` +
    `**0** injuries: \`67.72%\`\n` +
    `**1** injury: \`27.45%\`\n` +
    `**2** injuries: \`4.45%\`\n` +
    `**3** injuries: \`0.37%\`\n` +
    `**4** injuries: \`0.015%\`\n` +
    `**5** injuries: \`0.00024%\`\n\n` +
    `Buying a :adhesive_bandage:(bandage) for **5:tickets:** will allow a worker to instantly recover from any injury. Visit your card (\`kvi <card code>\`) to "Cheer Up" for 10 Affection Points that **reduces injury by 5 days** (only available at 20+ Affection Rating). Koibito can **grant immunity** to next injury on a card for 10 Affection Points.`;

const section5 =
    `# Card Effort\n` +
    `Confused as to whether a card is worth upgrading and/or will have a good effort once upgraded to mint?\n` +
    `### Calculating\n` +
    `- Use \`kwi <card code>\` and a :1234: emoji should pop up\n` +
    `- Click on it and the potential max effort is shown\n` +
    `- Any card with "Mystic Dyed & Framed:" \`400+\` is a really good candidate for upgrading, framing, and dyeing for maximum effort\n` +
    `### What to look for\n` +
    `- Your card needs to be \`220-230\` effort at mint (no frame or dye)\n` +
    `- This most likely means your card's base value is between \`90-95\` with good effort modifiers`;

const section6 =
    `# Dyeing Cards\n` +
    `Dyes are one of the ways you can customize cards and increase effort (in style). To dye a card, a dye must have at least __1 charge__. A charge will be consumed after dyeing a card.\n` +
    `### Dye\n` +
    `- Use \`kbuy dye\` to buy a dye using **50** :gem:\n` +
    `- Use \`ku dye\` to receive a random colored dye with __1 charge__\n` +
    `- Use \`kv <dye code>\` to view a dye\n` +
    `- Use \`kb <dye code>\` to burn a dye to receive *1 glass* and *1 :droplet:* (droplet) for every charge it has\n` +
    `### Bottle\n` +
    `- Buy a bottle with \`kbuy bottle\` using 3 glass\n` +
    `- Using a bottle with \`ku bottle\` will give you a dye without a charge\n` +
    `- Droplets are used to recharge dyes with \`kdyerefill <dye code>\`\n` +
    `- Spend 3 droplets to recharge a regular dye and 30 for a *mystic dye*\n` +
    `### Mystic\n` +
    `- A mystic dye is a special dye that adds a glow around a card. They also add about *triple* the effort of a normal dye. They are extremely rare (~1% chance of rolling a mystic dye). Mystic dyes give *10 droplets* and *10 glass* when they are burned. This is never advised because they can often be sold for much more.`;

const section7 =
    `# Affection\n` +
    `Affection is a Karuta system similar to dating simulator games that rewards both your knowledge of a character and luck.\n\n` +
    `To start, you can "visit" any character with a card that **has grabber** (\`kc grabber=true\`) every **2 hours** with \`kvisit <card code>\`. Visiting allows you to interact with this character in a number of different ways. Many of these actions are meant to increase both your **Affection Rating** and **Affection Points**.\n` +
    `### Affection Rating (AR)\n` +
    `This stat represents your overall progress in your relationship with a character. Actions (talking, hugging, etc.) can either increase or decrease this score.\n` +
    `### Affection Points (AP)\n` +
    `These are points accumulated from **talking** that can be used for other actions at **0 energy cost**, which includes activities like telling jokes, hugging, etc.`;

module.exports = {
    data: new SlashCommandSubcommandBuilder()
        .setName("karuta-guide")
        .setDescription("Post Karuta guide."),
    category: "developer/post",
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const sections = [
            section1,
            section2,
            section3,
            section4,
            section5,
            section6,
            section7,
        ];

        for (const section of sections) {
            await interaction.channel.send({
                content: section,
                allowedMentions: { parse: [] },
            });
        }
        await interaction.editReply({ content: "Done!" });
    },
};
