const mongoose = require("mongoose");

// Define a schema for storing card images
const imageSchema = new mongoose.Schema({
    cardCode: {
        type: String,
        required: true,
    },
    imageLink: {
        type: String,
        required: true,
    }
    // image: Buffer, // This field stores the binary image data
});

const CardImageModel = mongoose.model("Card Image", imageSchema);

module.exports = CardImageModel;
