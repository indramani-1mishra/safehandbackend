const express = require("express");
const AttendanceController = require("../controllers/AttendenceController");
const router = express.Router();

router.post("/request-otp", AttendanceController.requestAttendanceOtpController);
router.post("/verify-otp", AttendanceController.verifyAttendanceOtpController);
router.get("/worker/:workerId", AttendanceController.getAttendanceByWorkerIdController);
router.get("/date/:date", AttendanceController.getAttendanceByDateController);
router.put("/:id", AttendanceController.updateAttendanceController);
router.delete("/:id", AttendanceController.deleteAttendanceController);
router.get("/", AttendanceController.getAllWorkersAttendanceController);

module.exports = router;
