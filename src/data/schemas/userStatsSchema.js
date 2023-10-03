const mongoose = require("mongoose");

// Define a schema for storing player stats
const statsSchema = new mongoose.Schema({
    userID: String,
    totalVotesReceived: Number,
    highestEverVotes: Number,
    cardMatchesPlayed: Number,
    matchesWon: Number,
    tiesWon: Number,
    wins: Number,
    voteMatchesPlayed: Number,
    totalVotesGiven: Number,
});

module.exports = statsSchema;