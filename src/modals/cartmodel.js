const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true
    },
    items: [
        {
            serviceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service",
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            },
            city: {
                type: String,
                required: true
            }
        }
    ],
    equipments: [
        {
            equipmentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Equipment",
                required: true
            },
            orderType: {
                type: String,
                enum: ["rent", "buy"],
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ],
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);

