const fs = require("node:fs");
const path = require("node:path");

async function loadFiles(dirPath) {
    const jsFiles = [];

    function scanDirectory(currentDirPath) {
        const items = fs.readdirSync(currentDirPath);

        for (const item of items) {
            const itemPath = path.join(currentDirPath, item);
            const itemStat = fs.statSync(itemPath);

            try {
                if (itemStat.isDirectory()) {
                    // If it's a directory, recursively scan it
                    scanDirectory(itemPath);
                } else if (item.endsWith(".js")) {
                    // If it's a .js file, add its path to the files array
                    jsFiles.push(itemPath);
                }
            } catch (error) {
                console.error(
                    `[ERROR] [fileLoader] Error load files from directory ${itemPath}`
                );
                throw error;
            }
        }
    }

    // Start scanning the specified directory
    const filePath = path.join(process.cwd(), dirPath);
    scanDirectory(filePath);

    return jsFiles;
}

module.exports = loadFiles;
