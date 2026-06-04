const WorkerTransactionHistoryRepository = require("../repository/WorkerTransactionHistoryRepo");
const WorkerPayoutRepository = require("../repository/WorkerPayoutRepository");
const attendanceWorker = require("../repository/attendenceWorker");
const workerRepository = require("../repository/workerRepository");

const createTransactionService = async (data) => {
    try {
        const workerId = data.workerId;
        const jobCardId = data.jobCardId;
        const amount = data.amount;
        const type = data.transactionType || data.type;

        if (!workerId || !jobCardId || amount === undefined || amount === null || !type) {
            throw new Error("All fields (workerId, jobCardId, amount, and type) are required");
        }

        if (type === "created_attendance") {
            const attendanceId = data.attendanceId;
            if (!attendanceId) {
                throw new Error("Attendance ID is required for created_attendance type");
            }
            const attendance = await attendanceWorker.getAttendanceById(attendanceId);
            if (!attendance) {
                throw new Error("Attendance record not found");
            }
            if (attendance.workerId.toString() !== workerId.toString()) {
                throw new Error("Worker ID does not match the attendance record");
            }
        } else if (type === "paid_payout" || type === "cancelled_payout") {
            const payoutId = data.payoutId;
            if (!payoutId) {
                throw new Error("Payout ID is required for payout types");
            }
            const payout = await WorkerPayoutRepository.getPayoutById(payoutId);
            if (!payout) {
                throw new Error("Payout record not found");
            }
            if (payout.workerId.toString() !== workerId.toString()) {
                throw new Error("Worker ID does not match the payout record");
            }
        }

        const transaction = await WorkerTransactionHistoryRepository.createTransaction(data);
        return {
            success: true,
            data: transaction
        };
    } catch (error) {
        throw error;
    }
};

const updateTransactionService = async (id, data) => {
    try {
        if (!id) {
            throw new Error("Transaction ID is required for update");
        }
        const type = data.transactionType || data.type;

        if (type === "created_attendance") {
            const attendanceId = data.attendanceId;
            if (!attendanceId) {
                throw new Error("Attendance ID is required");
            }
            const attendance = await attendanceWorker.getAttendanceById(attendanceId);
            if (!attendance) {
                throw new Error("Attendance record not found");
            }
            if (data.workerId && attendance.workerId.toString() !== data.workerId.toString()) {
                throw new Error("Worker ID does not match the attendance record");
            }
        } else if (type === "paid_payout" || type === "cancelled_payout") {
            const payoutId = data.payoutId;
            if (!payoutId) {
                throw new Error("Payout ID is required");
            }
            const payout = await WorkerPayoutRepository.getPayoutById(payoutId);
            if (!payout) {
                throw new Error("Payout record not found");
            }
            if (data.workerId && payout.workerId.toString() !== data.workerId.toString()) {
                throw new Error("Worker ID does not match the payout record");
            }
        }

        const transaction = await WorkerTransactionHistoryRepository.updateTransaction(id, data);
        return {
            success: true,
            data: transaction
        };
    } catch (error) {
        throw error;
    }
};

const deleteTransactionService = async (id) => {
    try {
        if (!id) {
            throw new Error("Transaction ID is required");
        }
        const transaction = await WorkerTransactionHistoryRepository.deleteTransaction(id);
        return {
            success: true,
            data: transaction
        };
    } catch (error) {
        throw error;
    }
};

const getAllTransactionsService = async () => {
    try {
        const transactions = await WorkerTransactionHistoryRepository.getAllTransactions();
        return {
            success: true,
            data: transactions
        };
    } catch (error) {
        throw error;
    }
};

const getTransactionByIdService = async (id) => {
    try {
        if (!id) {
            throw new Error("Transaction ID is required");
        }
        const transaction = await WorkerTransactionHistoryRepository.getTransactionById(id);
        return {
            success: true,
            data: transaction
        };
    } catch (error) {
        throw error;
    }
};

const getTransactionsByWorkerIdService = async (id) => {
    try {
        if (!id) {
            throw new Error("Worker ID is required");
        }
        const worker = await workerRepository.getWorkerById(id);
        if (!worker) {
            throw new Error("Worker not found");
        }
        const transactions = await WorkerTransactionHistoryRepository.getTransactionsByWorkerId(id);
        return {
            success: true,
            data: transactions
        };
    } catch (error) {
        throw error;
    }
};

const getTransactionsByJobCardIdService = async (id) => {
    try {
        if (!id) {
            throw new Error("JobCard ID is required");
        }
        const transactions = await WorkerTransactionHistoryRepository.getTransactionsByJobCardId(id);
        return {
            success: true,
            data: transactions
        };
    } catch (error) {
        throw error;
    }
};

const getTransactionsByPatientNameService = async (name) => {
    try {
        const transactions = await WorkerTransactionHistoryRepository.getTransactionsByPatientName(name);
        return {
            success: true,
            data: transactions
        };
    } catch (error) {
        throw error;
    }
};

const getTransactionsByWorkerNameService = async (name) => {
    try {
        const transactions = await WorkerTransactionHistoryRepository.getTransactionsByWorkerName(name);
        return {
            success: true,
            data: transactions
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createTransactionService,
    updateTransactionService,
    deleteTransactionService,
    getAllTransactionsService,
    getTransactionByIdService,
    getTransactionsByWorkerIdService,
    getTransactionsByJobCardIdService,
    getTransactionsByPatientNameService,
    getTransactionsByWorkerNameService
};