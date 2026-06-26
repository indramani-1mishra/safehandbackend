const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectToDatabase = require('./src/config/dbConfig');
const Attendance = require('./src/modals/attendanceModel');
const JobCard = require('./src/modals/jobcartModel');
const Worker = require('./src/modals/workerModel');

async function run() {
    await connectToDatabase();
    
    // Find job cards that are active/assigned
    console.log("Fetching job cards...");
    const jobCards = await JobCard.find({}).sort({ updatedAt: -1 }).limit(10);
    console.log(`Found ${jobCards.length} recent job cards:`);
    for (const j of jobCards) {
        const assignedWorkerId = j.workers?.assigned;
        let workerName = "None";
        if (assignedWorkerId) {
            const worker = await Worker.findById(assignedWorkerId);
            workerName = worker ? worker.name : "Unknown";
        }
        console.log(`ID: ${j._id}, Patient: ${j.patientDetails?.name}, serviceStart: ${j.serviceStart}, Assigned Worker: ${workerName} (${assignedWorkerId}), status: ${j.status}`);
        
        if (assignedWorkerId) {
            // Find how many attendance records exist for this worker and job card
            const attendanceCount = await Attendance.countDocuments({ jobCardId: j._id, workerId: assignedWorkerId });
            const presentCount = await Attendance.countDocuments({ jobCardId: j._id, workerId: assignedWorkerId, status: "present" });
            const absentCount = await Attendance.countDocuments({ jobCardId: j._id, workerId: assignedWorkerId, status: "absent" });
            const pendingCount = await Attendance.countDocuments({ jobCardId: j._id, workerId: assignedWorkerId, status: "pending" });
            console.log(`  Attendance Records: ${attendanceCount} (Present: ${presentCount}, Absent: ${absentCount}, Pending: ${pendingCount})`);
        }
    }
    
    mongoose.disconnect();
}

run().catch(console.error);
