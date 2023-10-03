const mongoose = require("mongoose");

// Define a schema for storing player stats
const statsSchema = new mongoose.Schema({
    userID: String,
    votesGiven: Number,
    votesGivenCorrect: Number,
    votesReceived: Number,
    matchesPlayed: Number,
    matchesWon: Number,
    tiesWon: Number,
    wins: Number,
});

module.exports = statsSchema;