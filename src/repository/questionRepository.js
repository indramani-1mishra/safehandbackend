const Question = require("../modals/questionModel");

const createQuestion = async (data) => {
    const question = new Question(data);
    return await question.save();
};

const findQuestionsByServiceId = async (serviceId) => {
    return await Question.find({ serviceId, isActive: true });
};

const findQuestionById = async (id) => {
    return await Question.findById(id);
};

const updateQuestion = async (id, data) => {
    return await Question.findByIdAndUpdate(
        id,
        { $set: data },
        { returnDocument: 'after', runValidators: true }
    );
};

const deleteQuestion = async (id) => {
    return await Question.findByIdAndDelete(id);
};

const getAllQuestions = async (filter = {}) => {
    return await Question.find(filter).populate("serviceId", "name");
};

module.exports = {
    createQuestion,
    findQuestionsByServiceId,
    findQuestionById,
    updateQuestion,
    deleteQuestion,
    getAllQuestions
};
