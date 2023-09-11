const CardImageModel = require("../schemas/cardImageSchema");
const mongoose = require("mongoose");

// Define a schema for storing brawl setups
const setupSchema = new mongoose.Schema({
    name: String,
    theme: String,
    size: Number,
    entries: {
        type: Map,
        of: [
            {
                type: String,
            },
        ],
    },
    cards: {
        type: Map,
        of: {
            type: CardImageModel
        },
    },
});

const BrawlSetupModel = mongoose.model("Brawl Setup", setupSchema);

module.exports = BrawlSetupModel;
