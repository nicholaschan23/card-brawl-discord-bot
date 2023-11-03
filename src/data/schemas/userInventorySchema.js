const mongoose = require("mongoose");

// Define a schema for storing player inventory
const inventorySchema = new mongoose.Schema({
    userID: String,
    numTokens: {
        type: Number,
        default: 0,
    },
    counter: {
        type: Number,
        default: 0,
    },
    unixLastTime: {
        type: Number,
        default: 0,
    },
    private: {
        type: Boolean,
        default: false,
    }
});

const UserInventoryModel = mongoose.model("user inventory", inventorySchema);

module.exports = UserInventoryModel;
