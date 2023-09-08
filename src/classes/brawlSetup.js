class BrawlSetup {
    /**
     *
     * @param {String} name
     * @param {String} theme
     * @param {Integer} rounds
     */
    constructor(name, theme, rounds) {
        this.name = name;
        this.theme = theme;
        this.rounds = rounds;

        this.entries = new Map(); // (user ID, array [card codes])
        this.cards = new Map(); // (card code, {card {NG}, user ID})
    }

    /**
     *
     * @param {String} cardCode
     * @param {String} cardPNG
     * @param {String} userID
     * @returns Status of the command.
     */
    enter(cardCode, cardPNG, userID) {
        if (this.cards.size === Math.pow(2, rounds)) {
            return "This card brawl is full!";
        }

        if (this.cards.get(cardCode)) {
            return "This card is already in this brawl.";
        }

        // TODO: Check if user is eligible for multiple entries
        if (this.entries.has(userID)) {
            // const cards = entries.get(userID);
            return "You already entered a card for this brawl.";
        }

        const cardInfo = {
            cardPNG: cardPNG,
            userID: userID,
        };
        this.cards.set(cardCode, cardInfo);
        this.entries.set(userID, [cardCode]);
        return "Successfully added `cardCode` into the ";
    }

    swap(cardCode, cardPNG, userID) {
        if (!this.entries.has(userID)) {
            return "You have not entered a card in this brawl yet.";
        }

        const currentEntry = this.entries.get(userID)[0];
        this.cards.delete(currentEntry);

        const cardInfo = {
            cardPNG: cardPNG,
            userID: userID,
        };
        this.cards.set(cardCode, cardInfo);
        this.entries.set(userID, [cardCode]);
    }
}

module.exports = BrawlSetup;
