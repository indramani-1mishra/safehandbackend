const express = require("express");
const router = express.Router();
const questionController = require("../controllers/questionController");
const { authMiddleware, isAdmin, workerAuthMiddleware } = require("../middleware/authmiddleware");

// ⚠️ IMPORTANT: Static routes MUST come before dynamic /:id routes
// otherwise Express will treat 'worker-test' and 'submit-test' as IDs

// Worker routes (static paths - declared first)
router.get("/worker-test", workerAuthMiddleware, questionController.getWorkerTestQuestionsController);
router.post("/submit-test", workerAuthMiddleware, questionController.submitTestAnswersController);

// Admin routes
router.post("/", authMiddleware, isAdmin, questionController.createQuestionController);
router.get("/", authMiddleware, isAdmin, questionController.getQuestionsController);
router.put("/:id", authMiddleware, isAdmin, questionController.updateQuestionController);
router.delete("/:id", authMiddleware, isAdmin, questionController.deleteQuestionController);

module.exports = router;

