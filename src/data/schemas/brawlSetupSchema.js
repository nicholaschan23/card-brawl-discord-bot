const imageSchema = require("../schemas/cardImageSchema");
const mongoose = require("mongoose");

// Define a schema for storing brawl setups
const setupSchema = new mongoose.Schema({
    name: String,
    theme: String,
    series: {
        type: String,
        default: null,
    },
    entries: {
        type: Map,
        of: [String],
        default: new Map(),
    },
    cards: {
        type: Map,
        of: imageSchema,
        default: new Map(),
    },
    messageID: String,
    open: {
        type: Boolean,
        default: true,
    },
    unixStartTime: String,
});

const BrawlSetupModel = mongoose.model("brawl setup", setupSchema);

module.exports = BrawlSetupModel;
