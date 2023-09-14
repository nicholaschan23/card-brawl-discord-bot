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
        shuffledArray[currentIndex] = shuffledArray[randomIndex];
        shuffledArray[randomIndex] = temp;
    }

    return shuffledArray;
}

module.exports = { shuffleArray };
