module.exports = {
  name: "create",
  description: "Create a card competition",
  execute(message, args) {
    message.reply("Review your card competition and click \"Launch\" to open the competition for contestants to enter.");
    /**
     * Message embed with all the stats of the card giveaway
     *  Edit: modify values
     *  Launch: competition open to contestants
     *  Cancel: cancel setup
     * 
     * Fields to edit
     *  Theme: theme of the competition
     *  Channel:
     *  Max contestants: power of 2, no greater than 64
     * 
     *  Mode: all-at-once or live one-by-one
     *  Battle Duration: how long each battle will last, live mode
     *  Set Duration: how long a set of battles in a bracket row will last
     *
     */
  },
};
