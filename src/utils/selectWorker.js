const selectWorker = async (allfreeWorkers, assignedWorkerId) => {
    try {
        const selectedWorker = allfreeWorkers.find(worker => worker._id.toString() === assignedWorkerId);
        if (!selectedWorker) {
            throw new Error("Worker not found");
        }
        return selectedWorker;

    } catch (error) {
        throw error;
    }

}

module.exports = selectWorker;
