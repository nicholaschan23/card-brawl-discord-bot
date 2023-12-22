const { createCanvas, loadImage } = require("canvas");

async function mergeImages(image1Path, image2Path) {
    try {
        // Load the two images
        const image1 = await loadImage(image1Path);
        const image2 = await loadImage(image2Path);

        const canvas = createCanvas(image1.width * 2, image2.height); // Set canvas size

        const ctx = canvas.getContext("2d");

        // Draw the first image on the canvas
        ctx.drawImage(image1, 0, 0);

        // Draw the second image next to the first one
        ctx.drawImage(image2, image1.width, 0);

        // Convert the merged image to an image buffer
        const imageBuffer = canvas.toBuffer("image/png");

        return imageBuffer;
    } catch (error) {
        console.error(`[MERGE IMAGE] Something went wrong processing the images:`, error);
        return null;
    }
}

module.exports = mergeImages;
