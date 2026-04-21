const jwt = require("jsonwebtoken");
const ClientRepository = require("../repository/ClientRepository1");
const { JWT_SECRET } = require("../config/serverConfig");
const cartRepository = require("../repository/cartrepository");
const createClientService = async (data) => {
    const { phone, email } = data;
    if (!phone || !email) {
        throw new Error("phone and email are required");
    }
    const existingClient = await ClientRepository.findClientByPhoneOrEmailRepository(phone, email);

    if (existingClient) {
        throw new Error("account already exists with this phone or email");
    }

    const client = await ClientRepository.createClientRepository(data);
    await cartRepository.createCart({ userId: client._id });
    const token = jwt.sign({ id: client._id }, JWT_SECRET, { expiresIn: "1h" })
    const refreshToken = jwt.sign({ id: client._id }, JWT_SECRET, { expiresIn: "7d" })
    return { client, token, refreshToken };
}

const loginClientService = async (data) => {
    const { email, phone, password } = data;
    let client;
    if (email) {
        client = await ClientRepository.findClientByEmailRepository(email);
    } else if (phone) {
        client = await ClientRepository.findClientByPhoneRepository(phone);
    }

    if (!client) {
        throw new Error("Invalid email/phone or password");
    }

    const isMatch = await client.comparePassword(password);
    if (!isMatch) {
        throw new Error("Invalid email/phone or password");
    }

    const token = jwt.sign({ id: client._id }, JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: client._id }, JWT_SECRET, { expiresIn: "7d" });

    return { client, token, refreshToken };
}

const updateClientService = async (id, data) => {
    if (!id) {
        throw new Error("id not found");
    }
    const client1 = await ClientRepository.getClientByIdRepository(id);
    if (!client1) {
        throw new Error("account not found");
    }

    const client = await ClientRepository.updateClientRepository(id, data);
    return client;
}

const deleteClientService = async (id) => {
    const client = await ClientRepository.getClientByIdRepository(id);
    if (!client) {
        throw new Error("account not found");
    }
    return await ClientRepository.deleteClientRepository(id);
}

const getClientByIdService = async (id) => {
    const client = await ClientRepository.getClientByIdRepository(id);
    if (!client) {
        throw new Error("account not found");
    }
    return client;
}

const getAllClientsService = async () => {
    const clients = await ClientRepository.getAllClientsRepository();
    return clients;
}

module.exports = {
    createClientService,
    loginClientService,
    updateClientService,
    deleteClientService,
    getClientByIdService,
    getAllClientsService,
}
