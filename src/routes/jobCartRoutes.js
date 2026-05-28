const express = require('express');
const router = express.Router();
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");
const {
    createJobCardController,
    updateJobCardController,
    deleteJobCardController,
    getAllJobCardsController,
    getJobCardByIdController,
    addWorkerToJobCardController,
    removeWorkerFromJobCardController,
    assignWorkerToJobCardController,
    replaceWorkerInJobCardController,
    getJobCardsByWorkerIdController,
    getJobCardsByStatusController,
    getJobCardsByStatusAndWorkerIdController,
    completeJobCardController,
    updateTrackingStatusController
} = require("../controllers/jobCartController");

// ----------------------------------------------------
// ADMIN ROUTES (Requires Admin Auth)
// ----------------------------------------------------
router.post("/", authMiddleware, isAdmin, createJobCardController);
router.get("/", authMiddleware, isAdmin, getAllJobCardsController);
router.get("/:id", authMiddleware, isAdmin, getJobCardByIdController);
router.put("/:id", authMiddleware, isAdmin, updateJobCardController);
router.delete("/:id", authMiddleware, isAdmin, deleteJobCardController);

// Admin Action: Finalize one worker for the Job
router.post("/:id/assign", authMiddleware, isAdmin, assignWorkerToJobCardController);
router.post("/:id/replace", authMiddleware, isAdmin, replaceWorkerInJobCardController);

router.get("/status/:status", authMiddleware, isAdmin, getJobCardsByStatusController);


// ----------------------------------------------------
// WORKER APP ROUTES (Flutter App)
// (Add your worker token middleware here later!)
// ----------------------------------------------------

// Worker hits this when clicking "Interested"
router.post("/:id/interested", addWorkerToJobCardController);

// Worker hits this when clicking "Not Interested"
router.post("/:id/not-interested", removeWorkerFromJobCardController);

router.get("/worker/:workerId", getJobCardsByWorkerIdController);
router.get("/status/:status/worker/:workerId", getJobCardsByStatusAndWorkerIdController);
router.put("/:id/complete", completeJobCardController);
router.put("/:id/tracking-status", updateTrackingStatusController);

module.exports = router;
