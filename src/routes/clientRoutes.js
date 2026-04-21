const express = require("express");
const router = express.Router();
const clientController = require("../controllers/clientController");
const upload = require("../middleware/multer");
const { authMiddleware, isAdmin } = require("../middleware/authmiddleware");

// Login Client
router.post(
    "/login",
    clientController.loginClientController
);

// Create Client - Public (Password based)
router.post(
    "/create",
    upload.single("image"),
    clientController.createClientController
);

// Update Client
router.put(
    "/update/:id",
    authMiddleware,
    isAdmin,
    upload.single("image"),
    clientController.updateClientController
);

// Get All Clients
router.get(
    "/getall",
    authMiddleware,
    isAdmin,
    clientController.getAllClientsController
);

// Get Client by ID
router.get(
    "/get/:id",
    authMiddleware,
    isAdmin,
    clientController.getClientByIdController
);

// Delete Client
router.delete(
    "/delete/:id",
    authMiddleware,
    isAdmin,
    clientController.deleteClientController
);

module.exports = router;
