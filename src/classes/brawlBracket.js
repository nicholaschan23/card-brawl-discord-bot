class Match {
    /**
     *
     * @param {String} cardCode
     * @param {String} cardCode
     */
    constructor(competitor1, competitor2) {
        this.competitor1 = competitor1;
        this.competitor2 = competitor2;
        this.winner = null;
    }

    conductMatch() {
        // Display matchup as a png with reactions for the audience to vote
        // Tally votes and announce winner
        this.winner = null;
    }
}

class BrawlBracket {
    constructor(competitors) {
        this.competitors = competitors; // Array of competitors

        this.matches = []; // Array of match instances
        this.completedMatches = []; // Store completed matches for progress saving
        this.startIndex = 0; // Start index of completed matches to generate next round

        this.currentRound = 1; // Current round of the tournament
        this.currentMatch = 1; // Current match of the tournament
    }

    getStatus() {
        if (this.matches.length === 0) {
            if (this.completedMatches.length === 0) return 0; // Brawl has not started
            if (this.completedMatches.length === this.competitors.length - 1)
                return 2; // Brawl is finished
        }
        return 1; // Brawl is in progress
    }

    // Split competitors into pairs to create initial matches
    // Run this once before conduct tournament method
    generateInitialBracket() {
        // Randomize competitors
        const shuffle = require("../functions/shuffleArray");
        this.competitors = shuffle(this.competitors);

        // Assign round 1
        for (let i = 0; i < this.competitors.length; i += 2) {
            const match = new Match(
                this.competitors[i],
                this.competitors[i + 1]
            );
            this.matches.push(match);
        }
    }

    // Conduct the tournament
    conductTournament() {
        while (this.matches.length > 0) {
            const currentMatch = this.matches.shift();
            currentMatch.conductMatch(); // Determine the winner of the match

            // Save the match result and update the bracket
            this.completedMatches.push({
                round: this.currentRound,
                match: currentMatch,
            });

            // Check if there are more matches in the current round
            // If not, move to the next round
            if (this.matches.length === 0) {
                this.currentRound++;
                this.currentMatch = 1;
                this.generateNextRound();
            }
            this.currentMatch++;
            this.saveProgress(); // Save after every completed match
        }
    }

    // Generate matches for the next round based on the winners of the current round
    generateNextRound() {
        // Bracket finished
        if (this.completedMatches.length === this.competitors.length - 1) {
            return;
        }

        // Generate matches
        for (
            let i = this.startIndex;
            i < this.completedMatches.length;
            i += 2
        ) {
            const match = new Match(
                this.completedMatches[i].match.winner,
                this.completedMatches[i + 1].match.winner
            );
            this.matches.push(match);
        }
        this.startIndex = this.completedMatches.length;
    }

    getWinner() {
        if (this.completedMatches.length === this.competitors.length - 1) {
            return this.completedMatches[-1].winner;
        }
        return null;
    }

    // Save the tournament progress to persistent storage
    saveProgress() {
        // Serialize the bracket state, including completed rounds
        // Store it in a database or a file for later retrieval
    }

    // Load the tournament progress from persistent storage
    loadProgress() {
        // Retrieve the serialized bracket state and completed rounds
        // Restore the bracket to the previous state to resume the tournament
        // Display stats of current on-going brawl
        // Confirm to resume it
    }
}

module.exports = BrawlBracket;
