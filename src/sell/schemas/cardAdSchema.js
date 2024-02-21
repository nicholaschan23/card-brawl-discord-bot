const mongoose = require("mongoose");

// Define a schema for a card ad post
const cardAdSchema = new mongoose.Schema({
    code: String,
    messageID: String,
    ownerID: String,
    timestamp: Number, // unix time in seconds
});

const CardAdModel = mongoose.model("card ads", cardAdSchema);

module.exports = CardAdModel;
