const Client = require("../modals/clientModel");

const createClientRepository = async (data) => {
    return await Client.create(data);
}

const updateClientRepository = async (id, data) => {
    return await Client.findByIdAndUpdate(id, data, { new: true });
}

const deleteClientRepository = async (id) => {

    return await Client.findByIdAndDelete(id);
}

const getClientByIdRepository = async (id) => {
    return await Client.findById(id);
}

const getAllClientsRepository = async () => {
    return await Client.find();
}

const findClientByPhoneRepository = async (phone) => {
    return await Client.findOne({ phone });
}

const findClientByEmailRepository = async (email) => {
    return await Client.findOne({ email });
}

const findClientByPhoneOrEmailRepository = async (phone, email) => {
    return await Client.findOne({ $or: [{ phone }, { email }] });
}


module.exports = {
    createClientRepository,
    updateClientRepository,
    deleteClientRepository,
    getClientByIdRepository,
    getAllClientsRepository,
    findClientByPhoneRepository,
    findClientByEmailRepository,
    findClientByPhoneOrEmailRepository
}