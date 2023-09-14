async function delay(seconds) {
    return new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000); // Convert seconds to milliseconds
    });
}

module.exports = { delay };
