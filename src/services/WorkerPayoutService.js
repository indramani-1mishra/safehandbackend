const WorkerPayoutRepository = require("../repository/WorkerPayoutRepository");
const JobCard = require("../modals/jobcartModel");
const Attendance = require("../modals/attendanceModel");


const getWorkerPayoutDue = async (workerId, jobCardId) => {
    try {
        const jobCard = await JobCard.findById(jobCardId);
        if (!jobCard) throw new Error("JobCard not found");


        const presentDays = await Attendance.countDocuments({
            workerId,
            jobCardId,
            status: "present"
        });

        console.log(jobCard);
        const perDaySalary = jobCard.perDayNurseCost;
        const totalEarned = presentDays * perDaySalary;
        console.log(totalEarned);
        console.log(presentDays);
        console.log(perDaySalary);


        const previousPayouts = await WorkerPayoutRepository.getPayoutsByWorkerAndJob(workerId, jobCardId);
        const totalPaidSoFar = previousPayouts.reduce((sum, p) => sum + Number(p.amount, 0));


        const remainingDue = totalEarned - totalPaidSoFar;

        return {
            workerId,
            jobCardId,
            presentDays,
            perDaySalary,
            totalEarned,
            totalPaidSoFar,
            remainingDue
        };
    } catch (error) {
        throw error;
    }
}


const createWorkerPayout = async (data) => {
    try {
        const { workerId, jobCardId, amount, remarks } = data;
        //
        const dueInfo = await getWorkerPayoutDue(workerId, jobCardId);
        if (amount > dueInfo.remainingDue) {
            throw new Error("Amount exceeds due amount");
        }


        const payoutData = {
            workerId,
            jobCardId,
            amount,
            remarks,
            payoutDate: new Date(),
            paymentStatus: "paid"
        };

        return await WorkerPayoutRepository.createWorkerPayout(payoutData);
    } catch (error) {
        throw error;
    }
}

const getWorkerPayoutHistory = async (workerId) => {
    return await WorkerPayoutRepository.getAllPayoutsByWorker(workerId);
}

module.exports = {
    getWorkerPayoutDue,
    createWorkerPayout,
    getWorkerPayoutHistory
}
