const mongoose = require("mongoose");

// Define a schema for storing player stats
const statsSchema = new mongoose.Schema({
    userID: String,
    totalVotes: Number,
    matchesPlayed: Number,
    matchesWon: Number,
    roundsPlayed: Number,
    tiesWon: Number,
});

module.exports = statsSchema;