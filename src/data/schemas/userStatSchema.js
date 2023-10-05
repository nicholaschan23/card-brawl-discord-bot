const mongoose = require("mongoose");

// Define a schema for storing player stats
const statsSchema = new mongoose.Schema({
    userID: String,

    // Competitor
    cardsEntered: Number,
    matchesCompeted: Number,
    matchesWon: Number,
    tiesLost: Number,
    tiesWon: Number,
    wins: Number,

    // Votes
    matchesJudged: Number,
    votesGiven: Number,
    votesReceived: Number,
    votesHighest: Number,

    chatPoints: Number,
});

const UserStatModel = mongoose.model("user stats", statsSchema);

module.exports = UserStatModel;
