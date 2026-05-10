const Client = require("../modals/clientModel");

const createClientRepository = async (data) => {
    return await Client.create(data);
}

const updateClientRepository = async (id, data) => {
    return await Client.findByIdAndUpdate(id, data, { returnDocument: 'after' });
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

const saveRefreshToken = async (id, refreshToken) => {
    return await Client.findByIdAndUpdate(id, { refreshToken }, { returnDocument: 'after' });
}

const findClientByRefreshToken = async (refreshToken) => {
    return await Client.findOne({ refreshToken });
}

const removeRefreshToken = async (id) => {
    return await Client.findByIdAndUpdate(id, { refreshToken: null }, { returnDocument: 'after' });
}


module.exports = {
    createClientRepository,
    updateClientRepository,
    deleteClientRepository,
    getClientByIdRepository,
    getAllClientsRepository,
    findClientByPhoneRepository,
    findClientByEmailRepository,
    findClientByPhoneOrEmailRepository,
    saveRefreshToken,
    findClientByRefreshToken,
    removeRefreshToken
}