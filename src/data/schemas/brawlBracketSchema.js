const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
    competitor1: String,
    competitor2: String,
    winner: String
})

// Define a schema for storing bracket data
const bracketSchema = new mongoose.Schema({
    name: String,
    competitors: [String],
    matches: [matchSchema],
    completedMatches: [matchSchema],
    startIndex: {
        type: Number,
        default: 0
    },
    currentRound: {
        type: Number,
        default: 1
    },
    currentMatch: {
        type: Number,
        default: 1
    },
});

const BrawlBracketModel = mongoose.model("brawl bracket", bracketSchema);

module.exports = BrawlBracketModel;
