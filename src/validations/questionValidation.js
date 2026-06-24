const Joi = require("joi");

const createQuestionSchema = Joi.object({
    questionText: Joi.string().trim().required(),
    options: Joi.array().items(Joi.string().trim().required()).length(4).required(),
    correctOptionIndex: Joi.number().integer().min(0).max(3).required(),
    serviceId: Joi.string().required(),
    isActive: Joi.boolean().optional()
});

const updateQuestionSchema = Joi.object({
    questionText: Joi.string().trim(),
    options: Joi.array().items(Joi.string().trim().required()).length(4),
    correctOptionIndex: Joi.number().integer().min(0).max(3),
    serviceId: Joi.string(),
    isActive: Joi.boolean()
});

const submitAnswersSchema = Joi.object({
    answers: Joi.array().items(
        Joi.object({
            questionId: Joi.string().required(),
            selectedOptionIndex: Joi.number().integer().min(0).max(3).required()
        }).required()
    ).required()
});

module.exports = {
    createQuestionSchema,
    updateQuestionSchema,
    submitAnswersSchema
};
