const mongoose = require("mongoose");

// Define a schema for storing player inventory
const inventorySchema = new mongoose.Schema({
    userID: String,
    lastUnixTime: Number,
    numTokens: {
        type: Number,
        default: 0,
    },
    tokenCounter: Number,
    private: {
        type: Boolean,
        default: false,
    }
});

const UserInventoryModel = mongoose.model("user inventory", inventorySchema);

module.exports = UserInventoryModel;
