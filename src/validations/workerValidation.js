const Joi = require("joi");

// 🔥 CREATE WORKER VALIDATION
const createWorkerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),

    email: Joi.string()
        .email()
        .lowercase()
        .required(),

    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required(),

    age: Joi.number().min(18).optional(),

    gender: Joi.string()
        .valid("male", "female", "other")
        .optional(),

    city: Joi.string().optional(),

    services: Joi.array().items(Joi.string()).optional(),
    documents: Joi.array().items(Joi.string()).optional(),
    photo: Joi.string().optional(),
    workerId: Joi.string().optional()
});


// 🔥 UPDATE WORKER VALIDATION
const updateWorkerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50),

    email: Joi.string().email().lowercase(),

    phone: Joi.string().pattern(/^[0-9]{10}$/),

    age: Joi.number().min(18),

    gender: Joi.string().valid("male", "female", "other"),

    city: Joi.string(),

    isActive: Joi.boolean(),
    isOnline: Joi.boolean(),
    isBusy: Joi.boolean(),
    documents: Joi.array().items(Joi.string()).optional(),
    photo: Joi.string().optional(),
    workerId: Joi.string().optional()
});

module.exports = {
    createWorkerSchema,
    updateWorkerSchema
};