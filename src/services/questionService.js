const questionRepository = require("../repository/questionRepository");
const AppError = require("../utils/AppError");
const { createQuestionSchema, updateQuestionSchema } = require("../validations/questionValidation");

const createQuestion = async (data) => {
    const { error, value } = createQuestionSchema.validate(data);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }
    return await questionRepository.createQuestion(value);
};

const updateQuestion = async (id, data) => {
    if (!id) {
        throw new AppError("Question ID is required", 400);
    }
    const { error, value } = updateQuestionSchema.validate(data);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }
    const question = await questionRepository.updateQuestion(id, value);
    if (!question) {
        throw new AppError("Question not found", 404);
    }
    return question;
};

const deleteQuestion = async (id) => {
    if (!id) {
        throw new AppError("Question ID is required", 400);
    }
    const question = await questionRepository.deleteQuestion(id);
    if (!question) {
        throw new AppError("Question not found", 404);
    }
    return question;
};

const getAllQuestions = async (filter) => {
    return await questionRepository.getAllQuestions(filter);
};

const generateWorkerTest = async (workerId) => {
    const workerRepository = require("../repository/workerRepository");
    const worker = await workerRepository.getWorkerById(workerId);
    if (!worker) {
        throw new AppError("Worker not found", 404);
    }

    const selectedServices = worker.services || [];
    if (selectedServices.length === 0) {
        throw new AppError("No services selected. Please complete profile registration first.", 400);
    }

    const serviceIds = selectedServices.map(s => (s._id || s).toString());
    const S = serviceIds.length;

    // 1. Fetch questions for all services
    const serviceQuestions = {};
    for (const serviceId of serviceIds) {
        let questions = await questionRepository.findQuestionsByServiceId(serviceId);
        // Shuffle the questions for random selection
        serviceQuestions[serviceId] = questions.sort(() => Math.random() - 0.5);
    }

    // 2. Determine target allocations
    const baseCount = Math.floor(16 / S);
    let remainder = 16 % S;
    const allocations = serviceIds.map((serviceId, index) => {
        const target = baseCount + (index < remainder ? 1 : 0);
        return { serviceId, target };
    });

    const selectedQuestions = [];
    const extraPool = [];

    // 3. Initial pass: allocate up to target for each service
    for (const alloc of allocations) {
        const questions = serviceQuestions[alloc.serviceId] || [];
        const initialSelections = questions.slice(0, alloc.target);
        selectedQuestions.push(...initialSelections);

        const extras = questions.slice(alloc.target);
        extraPool.push(...extras);
    }

    // 4. Second pass: if less than 16, fill remainder from extra pool
    if (selectedQuestions.length < 16 && extraPool.length > 0) {
        const shuffledExtras = extraPool.sort(() => Math.random() - 0.5);
        const needed = 16 - selectedQuestions.length;
        const additional = shuffledExtras.slice(0, needed);
        selectedQuestions.push(...additional);
    }

    // 5. Shuffle the final set of questions
    const finalQuestions = selectedQuestions.sort(() => Math.random() - 0.5);

    // 6. Strip correctOptionIndex before returning
    return finalQuestions.map(q => {
        const obj = q.toObject ? q.toObject() : { ...q };
        delete obj.correctOptionIndex;
        return obj;
    });
};

const gradeWorkerTest = async (workerId, answers) => {
    const workerRepository = require("../repository/workerRepository");
    const worker = await workerRepository.getWorkerById(workerId);
    if (!worker) {
        throw new AppError("Worker not found", 404);
    }

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
        throw new AppError("No answers submitted", 400);
    }

    let correctCount = 0;
    const totalQuestions = answers.length;

    for (const ans of answers) {
        const question = await questionRepository.findQuestionById(ans.questionId);
        if (question) {
            if (question.correctOptionIndex === Number(ans.selectedOptionIndex)) {
                correctCount++;
            }
        }
    }

    const passingThreshold = Math.ceil(totalQuestions * 0.6);
    const pass = correctCount >= passingThreshold;
    const testResult = pass ? "pass" : "fail";

    const updatedWorker = await workerRepository.updateWorker(workerId, {
        test: true,
        testMark: correctCount,
        testResult: testResult
    });

    if (!updatedWorker) {
        throw new AppError("Worker not found during update", 404);
    }

    return {
        success: true,
        correctCount,
        totalQuestions,
        testResult,
        worker: {
            _id: updatedWorker._id,
            name: updatedWorker.name,
            test: updatedWorker.test,
            testMark: updatedWorker.testMark,
            testResult: updatedWorker.testResult
        }
    };
};

module.exports = {
    createQuestion,
    updateQuestion,
    deleteQuestion,
    getAllQuestions,
    generateWorkerTest,
    gradeWorkerTest
};
