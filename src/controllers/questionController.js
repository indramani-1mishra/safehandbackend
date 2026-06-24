const questionService = require("../services/questionService");
const { submitAnswersSchema } = require("../validations/questionValidation");

const createQuestionController = async (req, res) => {
    try {
        const question = await questionService.createQuestion(req.body);
        return res.status(201).json({
            success: true,
            message: "Question created successfully",
            data: question
        });
    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const updateQuestionController = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await questionService.updateQuestion(id, req.body);
        return res.status(200).json({
            success: true,
            message: "Question updated successfully",
            data: question
        });
    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const deleteQuestionController = async (req, res) => {
    try {
        const { id } = req.params;
        await questionService.deleteQuestion(id);
        return res.status(200).json({
            success: true,
            message: "Question deleted successfully"
        });
    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const getQuestionsController = async (req, res) => {
    try {
        const filter = {};
        if (req.query.serviceId) {
            filter.serviceId = req.query.serviceId;
        }
        const questions = await questionService.getAllQuestions(filter);
        return res.status(200).json({
            success: true,
            data: questions
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const getWorkerTestQuestionsController = async (req, res) => {
    try {
        const workerId = req?.worker?.id;
        if (!workerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }
        const questions = await questionService.generateWorkerTest(workerId);
        return res.status(200).json({
            success: true,
            data: questions
        });
    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

const submitTestAnswersController = async (req, res) => {
    try {
        const workerId = req?.worker?.id;
        if (!workerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const { error, value } = submitAnswersSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message
            });
        }

        const result = await questionService.gradeWorkerTest(workerId, value.answers);
        return res.status(200).json({
            success: true,
            message: "Test graded and submitted successfully",
            ...result
        });
    } catch (error) {
        const statusCode = error.statusCode || 400;
        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createQuestionController,
    updateQuestionController,
    deleteQuestionController,
    getQuestionsController,
    getWorkerTestQuestionsController,
    submitTestAnswersController
};
