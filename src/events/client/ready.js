module.exports = {
    name: "ready",
    once: true,
    execute() {
		console.log("Client is ready");
		// console.log("Logged in as ${client.user.tag}!");
        // client.user.setActivity("in the Far Shore");
    },
};
