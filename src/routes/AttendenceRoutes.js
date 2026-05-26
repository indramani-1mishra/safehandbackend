const express = require("express");
const AttendanceController = require("../controllers/AttendenceController");
const { allowAnyAuth } = require("../middleware/authmiddleware");
const router = express.Router();

router.post("/request-otp", allowAnyAuth, AttendanceController.requestAttendanceOtpController);
router.post("/verify-otp", allowAnyAuth, AttendanceController.verifyAttendanceOtpController);
router.get("/worker/:workerId", allowAnyAuth, AttendanceController.getAttendanceByWorkerIdController);
router.get("/job-card/:jobCardId", allowAnyAuth, AttendanceController.getAttendanceByJobCardIdController);
router.get("/job-card/:jobCardId/worker/:workerId", allowAnyAuth, AttendanceController.getAttendanceByJobCardIdAndWorkerIdController);
router.get("/date/:date", allowAnyAuth, AttendanceController.getAttendanceByDateController);
router.put("/:id", allowAnyAuth, AttendanceController.updateAttendanceController);
router.delete("/:id", allowAnyAuth, AttendanceController.deleteAttendanceController);
router.get("/", allowAnyAuth, AttendanceController.getAllWorkersAttendanceController);

module.exports = router;
