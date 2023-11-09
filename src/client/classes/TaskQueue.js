class TaskQueue {
    constructor() {
        this.queue = [];
        this.running = false;
    }

    async enqueue(task) {
        return new Promise(async (resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            if (!this.running) {
                await this.processQueue();
            }
        });
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.running = false;
            return;
        }

        this.running = true;
        const { task, resolve, reject } = this.queue.shift();

        try {
            await task();
            resolve(); // Resolve the promise for success
        } catch (error) {
            reject(error); // Reject the promise for failure
        }

        // Continue processing the queue
        await this.processQueue();
    }
}

module.exports = TaskQueue;
