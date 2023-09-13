const mongoose = require("mongoose");

// Define a schema for storing card images
const imageSchema = new mongoose.Schema({
    imageLink: String,
    userID: String,
});

const CardImageModel = mongoose.model("card image", imageSchema);

module.exports = imageSchema;
// module.exports = CardImageModel;
