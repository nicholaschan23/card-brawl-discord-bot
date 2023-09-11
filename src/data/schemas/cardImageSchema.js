const mongoose = require("mongoose");

// Define a schema for storing card images
const imageSchema = new mongoose.Schema({
    // cardCode: String,
    cardData: [
        {
            imageLink: String,
            userID: String
        }
    ]
    // image: Buffer, // This field stores the binary image data
});

const CardImageModel = mongoose.model("Card Image", imageSchema);

module.exports = CardImageModel;
