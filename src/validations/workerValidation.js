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
    prefer_city: Joi.string().allow("").optional(),
    Religion: Joi.string().allow("").optional(),

    services: Joi.array().items(Joi.string()).optional(),
    documents: Joi.array().items(Joi.string()).optional(),
    photo: Joi.string().optional(),
    workerId: Joi.string().optional(),

    // 💳 Bank Details
    bankName: Joi.string().allow("").optional(),
    accountNumber: Joi.string().allow("").optional(),
    ifscCode: Joi.string().allow("").optional(),
    accountHolderName: Joi.string().allow("").optional(),
    upiId: Joi.string().allow("").optional()
});


// 🔥 UPDATE WORKER VALIDATION
const updateWorkerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50),

    email: Joi.string().email().lowercase(),

    phone: Joi.string().pattern(/^[0-9]{10}$/),

    age: Joi.number().min(18),

    gender: Joi.string().valid("male", "female", "other"),

    city: Joi.string().allow(""),
    prefer_city: Joi.string().allow("").optional(),
    Religion: Joi.string().allow("").optional(),

    isActive: Joi.boolean(),
    isOnline: Joi.boolean(),
    isBusy: Joi.boolean(),
    services: Joi.array().items(Joi.string()).optional(),
    documents: Joi.array().items(Joi.string()).optional(),
    photo: Joi.string().optional(),
    workerId: Joi.string().optional(),

    // 💳 Bank Details
    bankName: Joi.string().allow("").optional(),
    accountNumber: Joi.string().allow("").optional(),
    ifscCode: Joi.string().allow("").optional(),
    accountHolderName: Joi.string().allow("").optional(),
    upiId: Joi.string().allow("").optional()
});

module.exports = {
    createWorkerSchema,
    updateWorkerSchema
};