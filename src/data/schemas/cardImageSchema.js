const mongoose = require("mongoose");

// Define a schema for storing card images
const imageSchema = new mongoose.Schema({
    imageLink: String,
    userID: String,
});

module.exports = imageSchema;