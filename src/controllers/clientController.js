const clientService = require("../services/clientservice");

const createClientController = async (req, res) => {
    try {
        const { phone, email, password } = req.body;
        if (req.file) {
            req.body.image = req.file.location;
        }
        if (!phone || !email || !password) {
            throw new Error("phone, email and password are required");
        }

        const client = await clientService.createClientService(req.body);
        const { token, refreshToken } = client;

        res.cookie("clientToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.cookie("clientRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(201).json({ 
            success: true, 
            message: "Client created successfully", 
            data: client.client 
        });

    } catch (error) {
        const statusCode = error.message.includes("exists") ? 409 : 400;
        res.status(statusCode).json({ success: false, message: error.message });
    }
}

const loginClientController = async (req, res) => {
    try {
        const { email, phone, password } = req.body;
        if ((!email && !phone) || !password) {
            throw new Error("Email/Phone and password are required");
        }

        const result = await clientService.loginClientService({ email, phone, password });
        const { client, token, refreshToken } = result;

        res.cookie("clientToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.cookie("clientRefreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        res.status(200).json({ 
            success: true, 
            message: "Login successful", 
            data: client 
        });
    } catch (error) {
        res.status(401).json({ success: false, message: error.message });
    }
}

const updateClientController = async (req, res) => {
    try {
        if (req.file) {
            req.body.image = req.file.location;
        }
        const client = await clientService.updateClientService(req.params.id, req.body);
        res.status(200).json({ success: true, message: "Client updated successfully", data: client });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
}

const deleteClientController = async (req, res) => {
    try {
        const client = await clientService.deleteClientService(req.params.id);
        res.status(200).json({ success: true, message: "Client deleted successfully", data: client });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}

const getClientByIdController = async (req, res) => {
    try {
        const client = await clientService.getClientByIdService(req.params.id);
        res.status(200).json({ success: true, data: client });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
}

const getAllClientsController = async (req, res) => {
    try {
        const clients = await clientService.getAllClientsService();
        res.status(200).json({ success: true, data: clients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = {
    createClientController,
    loginClientController,
    updateClientController,
    deleteClientController,
    getClientByIdController,
    getAllClientsController
}