const mongoose = require("mongoose");

// Define a schema for storing player stats
const statsSchema = new mongoose.Schema({
    userID: String,

    // Competitor
    cardsEntered: {
        type: Number,
        default: 0,
    },
    matchesCompeted: {
        type: Number,
        default: 0,
    },
    matchesWon: {
        type: Number,
        default: 0,
    },
    tiesLost: {
        type: Number,
        default: 0,
    },
    tiesWon: {
        type: Number,
        default: 0,
    },
    honorableMentions: {
        type: Number,
        default: 0,
    },
    wins: {
        type: Number,
        default: 0,
    },

    // Votes
    votesGiven: {
        type: Number,
        default: 0,
    },
    votesReceived: {
        type: Number,
        default: 0,
    },
    votesHighest: {
        type: Number,
        default: 0,
    },
});

const UserStatModel = mongoose.model("user stats", statsSchema);

module.exports = UserStatModel;
