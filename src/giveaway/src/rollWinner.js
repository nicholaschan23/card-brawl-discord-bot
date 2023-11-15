const client = require("../../index");

async function rollWinner(giveawayModel, numWinners) {
    const entries = new Map(giveawayModel.entries);

    // Remove already drawn winners
    giveawayModel.drawn.forEach((entry) => entries.delete(entry));

    // Edge cases
    if (entries.size === 0) {
        return;
    }
    if (entries.size < numWinners) {
        numWinners = entries.size
    }

    let winners = [];
    try {
        for (let i = 0; i < numWinners; i++) {
            // Calculate the total sum of weights
            const totalWeight = [...entries.values()].reduce((sum, weight) => sum + weight, 0);

            // Generate a random number between 0 and the total sum of weights
            const randomNum = Math.random() * totalWeight;

            // Find winner based on their weights
            let accumulatedWeight = 0;
            for (const [entry, weight] of entries) {
                accumulatedWeight += weight;
                if (randomNum <= accumulatedWeight) {
                    winners.push(entry);
                    giveawayModel.drawn.push(entry);
                    entries.delete(entry);
                    break;
                }
            }
        }
        // Save model
        const task = async () => {
            await giveawayModel.save();
        };
        client.giveawayQueue.enqueue(task);

        return winners;
    } catch (error) {
        console.error("[ROLL WINNER]:", error);
    }
}

module.exports = rollWinner;
