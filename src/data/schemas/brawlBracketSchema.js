const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
    competitor1: String,
    competitor2: String,
    winner: String
})

// Define a schema for storing card images
const bracketSchema = new mongoose.Schema({
    competitors: [String],
    matches: [matchSchema],
    completedMatches: [matchSchema],
    startIndex: Number,
    currentRound: Number,
    currentMatch: Number
});

const BrawlBracketModel = mongoose.model("Brawl Bracket", bracketSchema);

module.exports = BrawlBracketModel;
