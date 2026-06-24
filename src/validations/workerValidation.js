const Joi = require("joi");

// 🔥 CREATE WORKER VALIDATION
const createWorkerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),

    email: Joi.string()
        .email()
        .lowercase()
        .allow("")
        .optional(),

    adminId: Joi.string().optional(),

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
    documents: Joi.array().items(
        Joi.alternatives().try(
            Joi.string(),
            Joi.object({
                url: Joi.string().required(),
                name: Joi.string().required()
            }).unknown(true)
        )
    ).optional(),
    documentNames: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string()
    ).optional(),
    photo: Joi.string().optional(),
    workerId: Joi.string().optional(),

    // 💳 Bank Details
    bankName: Joi.string().allow("").optional(),
    accountNumber: Joi.string().allow("").optional(),
    ifscCode: Joi.string().allow("").optional(),
    accountHolderName: Joi.string().allow("").optional(),
    upiId: Joi.string().allow("").optional(),
    scanner: Joi.string().allow("").optional(),

    // 🎯 Tracking Status
    test: Joi.boolean().optional(),
    testMark: Joi.number().optional(),
    testResult: Joi.string().valid("pass", "fail", "").optional(),
    vcallVerification: Joi.boolean().optional(),
    documentsUpload: Joi.boolean().optional(),
    bankDetails: Joi.boolean().optional(),
    fullWorkerApproved: Joi.boolean().optional()
});


// 🔥 UPDATE WORKER VALIDATION
const updateWorkerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50),

    email: Joi.string().email().lowercase().allow("").optional(),
    adminId: Joi.string().optional(),

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
    documents: Joi.array().items(
        Joi.alternatives().try(
            Joi.string(),
            Joi.object({
                url: Joi.string().required(),
                name: Joi.string().required()
            }).unknown(true)
        )
    ).optional(),
    documentNames: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string()
    ).optional(),
    photo: Joi.string().optional(),
    workerId: Joi.string().optional(),

    // 💳 Bank Details
    bankName: Joi.string().allow("").optional(),
    accountNumber: Joi.string().allow("").optional(),
    ifscCode: Joi.string().allow("").optional(),
    accountHolderName: Joi.string().allow("").optional(),
    upiId: Joi.string().allow("").optional(),
    scanner: Joi.string().allow("").optional(),

    // 🎯 Tracking Status
    test: Joi.boolean().optional(),
    testMark: Joi.number().optional(),
    testResult: Joi.string().valid("pass", "fail", "").optional(),
    vcallVerification: Joi.boolean().optional(),
    documentsUpload: Joi.boolean().optional(),
    bankDetails: Joi.boolean().optional(),
    fullWorkerApproved: Joi.boolean().optional()
});

// 🔥 COMPLETE WORKER SELF-REGISTRATION VALIDATION
const completeWorkerSelfRegistrationSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required(),
    email: Joi.string().email().lowercase().allow("").optional(),
    age: Joi.number().min(18).optional(),
    gender: Joi.string().valid("male", "female", "other").optional(),
    city: Joi.string().optional(),
    prefer_city: Joi.string().allow("").optional(),
    Religion: Joi.string().allow("").optional(),
    services: Joi.array().items(Joi.string()).optional()
});

module.exports = {
    createWorkerSchema,
    updateWorkerSchema,
    completeWorkerSelfRegistrationSchema
};