const mongoose = require("mongoose");

const giveawaySchema = new mongoose.Schema({
    messageID: String, // Giveaway embed

    prize: String, // Card name for giveaway
    winners: Number, // Number of winners
    unixEndTime: String, // Cron

    host: String, 
    sponsor: String,

    entries: { // Key: userID, Value: weight
        type: Map,
        of: Number,
        default: new Map(),
    },
    drawn: {
        type: [String], // Set of users to avoid duplicate winners
        default: [],
    },
    open: {
        type: Boolean,
        default: true,
    }
});

const GiveawayModel = mongoose.model("giveaway", giveawaySchema);

module.exports = GiveawayModel;
