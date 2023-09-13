const ImageSchema = require("../schemas/cardImageSchema");
const mongoose = require("mongoose");

// Define a schema for storing brawl setups
const setupSchema = new mongoose.Schema({
    name: String,
    theme: String,
    size: Number,
    entries: {
        type: Map,
        of: [String],
        default: new Map(),
    },
    cards: {
        type: Map,
        of: ImageSchema,
        default: new Map(),
    },
    // entries: {
    //     type: Map,
    //     of: [
    //         {
    //             type: String,
    //         },
    //     ],
    //     default: new Map(),
    // },
    // cards: {
    //     type: Map,
    //     of: {
    //         type: new mongoose.Schema({
    //             imageLink: String,
    //             userID: String,
    //         })
    //     },
    //     default: new Map(),
    // },
});

const BrawlSetupModel = mongoose.model("brawl setup", setupSchema);

module.exports = BrawlSetupModel;
