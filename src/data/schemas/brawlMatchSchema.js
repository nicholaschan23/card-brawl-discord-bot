const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
    card1: String,
    card2: String,
    winner: String,
});

module.exports = matchSchema;
