class TaskQueue {
    constructor() {
        this.queue = [];
        this.running = false;
    }

    async enqueue(task) {
        return new Promise((resolve) => {
            this.queue.push({ task, resolve });
            if (!this.running) {
                this.processQueue();
            }
        });
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.running = false;
            return;
        }

        this.running = true;
        const { task, resolve } = this.queue.shift();

        try {
            await task();
            resolve();
        } catch (error) {
            reject(error);
        }

        // Continue processing the queue
        this.processQueue();
    }
}

module.exports = TaskQueue;
