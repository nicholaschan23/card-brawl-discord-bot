const mongoose = require("mongoose");
const matchSchema = require("./brawlMatchSchema");

// Define a schema for storing bracket data
const bracketSchema = new mongoose.Schema({
    name: String,
    competitors: [String],
    matches: [matchSchema],
    completedMatches: [matchSchema],
    startIndex: {
        type: Number,
        default: 0,
    },
    currentRound: {
        type: Number,
        default: 1,
    },
    currentMatch: {
        type: Number,
        default: 1,
    },
    leastVotes: {
        type: [Number, String], // An array with two elements: number and string
        default: [9999, ""], // Default values
    },
    mostVotes: {
        type: [Number, String],
        default: [-1, ""],
    },
});

const BrawlBracketModel = mongoose.model("brawl bracket", bracketSchema);

module.exports = BrawlBracketModel;
