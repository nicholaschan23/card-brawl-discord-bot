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
        count: {
            type: Number,
            default: 9999, // Default number value
        },
        card: {
            type: String,
            default: "", // Default string value
        },
    },
    mostVotes: {
        count: {
            type: Number,
            default: -1, // Default number value
        },
        card: {
            type: String,
            default: "", // Default string value
        },
    },
});

const BrawlBracketModel = mongoose.model("brawl bracket", bracketSchema);

module.exports = BrawlBracketModel;
