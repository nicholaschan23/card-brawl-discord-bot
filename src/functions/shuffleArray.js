// Fisher-Yates shuffle algorithm
function shuffleArray(array) {
    // Clone array
    const shuffledArray = [...array];

    let currentIndex = shuffleArray.length;
    while (currentIndex !== 0) {
        // Pick random element
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // Swap with current element
        const temp = shuffledArray[currentIndex];
        shuffleArray[currentIndex] = shuffledArray[randomIndex];
        shuffleArray[randomIndex] = temp;
    }

    return shuffleArray;
}

module.exports = { shuffleArray };
