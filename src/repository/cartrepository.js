const Cart = require("../modals/cartmodel");

/**
 * Creates a new cart for a user.
 * @param {Object} data - Contains userId
 */
async function createCart(data) {
    const { userId } = data;
    return await Cart.create({ userId });
}

/**
 * Retrieves a cart by user ID with populated service details.
 */
async function getCartByUserId(userId) {
    return await Cart.findOne({ userId })
        .populate("items.serviceId", "name image cityAndPrice")
        .populate("equipments.equipmentId")
        .populate("products.productId");
}

/**
 * Adds an item to the cart. 
 * Line items are unique based on serviceId and city.
 */
async function addToCart(userId, serviceId, selectionDetails, quantity = 1) {
    const { city } = selectionDetails;

    // Try to update existing item quantity first for the same service and city
    let cart = await Cart.findOneAndUpdate(
        {
            userId,
            "items.serviceId": serviceId,
            "items.city": city
        },
        { $inc: { "items.$.quantity": quantity } },
        { returnDocument: 'after' }
    );

    // If item didn't exist with this configuration, push it
    if (!cart) {
        cart = await Cart.findOneAndUpdate(
            { userId },
            {
                $push: {
                    items: { serviceId, city, quantity }
                }
            },
            { upsert: true, returnDocument: 'after' }
        );
    }

    return cart;
}

/**
 * Updates the quantity of a specific item in the cart.
 */
async function updateCartItem(userId, itemId, quantity) {
    const cart = await Cart.findOneAndUpdate(
        { userId, "items._id": itemId },
        { $set: { "items.$.quantity": quantity } },
        { returnDocument: 'after' }
    );

    if (!cart) {
        throw new Error("Item not found in cart");
    }

    return cart;
}

/**
 * Removes a specific item from the cart entirely using its line-item ID.
 */
async function removeCartItem(userId, itemId) {
    const cart = await Cart.findOneAndUpdate(
        { userId },
        { $pull: { items: { _id: itemId } } },
        { returnDocument: 'after' }
    );

    if (!cart) {
        throw new Error("Cart not found");
    }

    return cart;
}

/**
 * Clears all items from the cart.
 */
async function clearCart(userId) {
    const cart = await Cart.findOneAndUpdate(
        { userId },
        { $set: { items: [], equipments: [], products: [] } },
        { returnDocument: 'after' }
    );

    if (!cart) {
        throw new Error("Cart not found");
    }

    return cart;
}

/**
 * Adds an equipment item to the cart.
 */
async function addEquipmentToCart(userId, equipmentId, orderType, quantity = 1) {
    // Try to update existing equipment item quantity first (same equipment and orderType)
    let cart = await Cart.findOneAndUpdate(
        {
            userId,
            "equipments.equipmentId": equipmentId,
            "equipments.orderType": orderType
        },
        { $inc: { "equipments.$.quantity": quantity } },
        { returnDocument: 'after' }
    );

    // If item didn't exist with this configuration, push it
    if (!cart) {
        cart = await Cart.findOneAndUpdate(
            { userId },
            {
                $push: {
                    equipments: { equipmentId, orderType, quantity }
                }
            },
            { upsert: true, returnDocument: 'after' }
        );
    }

    return cart;
}

/**
 * Updates the quantity of a specific equipment item in the cart.
 */
async function updateEquipmentCartItem(userId, itemId, quantity) {
    const cart = await Cart.findOneAndUpdate(
        { userId, "equipments._id": itemId },
        { $set: { "equipments.$.quantity": quantity } },
        { returnDocument: 'after' }
    );

    if (!cart) {
        throw new Error("Equipment item not found in cart");
    }

    return cart;
}

/**
 * Removes a specific equipment item from the cart entirely using its line-item ID.
 */
async function removeEquipmentCartItem(userId, itemId) {
    const cart = await Cart.findOneAndUpdate(
        { userId },
        { $pull: { equipments: { _id: itemId } } },
        { returnDocument: 'after' }
    );

    if (!cart) {
        throw new Error("Cart not found");
    }

    return cart;
}

/**
 * Adds a medical product to the cart.
 */
async function addProductToCart(userId, productId, quantity = 1) {
    let cart = await Cart.findOneAndUpdate(
        {
            userId,
            "products.productId": productId
        },
        { $inc: { "products.$.quantity": quantity } },
        { returnDocument: 'after' }
    );

    if (!cart) {
        cart = await Cart.findOneAndUpdate(
            { userId },
            {
                $push: {
                    products: { productId, quantity }
                }
            },
            { upsert: true, returnDocument: 'after' }
        );
    }

    return cart;
}

/**
 * Updates the quantity of a specific product item in the cart.
 */
async function updateProductCartItem(userId, itemId, quantity) {
    const cart = await Cart.findOneAndUpdate(
        { userId, "products._id": itemId },
        { $set: { "products.$.quantity": quantity } },
        { returnDocument: 'after' }
    );

    if (!cart) {
        throw new Error("Product item not found in cart");
    }

    return cart;
}

/**
 * Removes a specific product item from the cart entirely using its line-item ID.
 */
async function removeProductCartItem(userId, itemId) {
    const cart = await Cart.findOneAndUpdate(
        { userId },
        { $pull: { products: { _id: itemId } } },
        { returnDocument: 'after' }
    );

    if (!cart) {
        throw new Error("Cart not found");
    }

    return cart;
}

module.exports = {
    createCart,
    getCartByUserId,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    addEquipmentToCart,
    updateEquipmentCartItem,
    removeEquipmentCartItem,
    addProductToCart,
    updateProductCartItem,
    removeProductCartItem
}
