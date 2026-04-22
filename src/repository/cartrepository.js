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
    return await Cart.findOne({ userId }).populate("items.serviceId", "name image cityAndPrice");
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
        { new: true }
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
            { upsert: true, new: true }
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
        { new: true }
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
        { new: true }
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
        { $set: { items: [] } },
        { new: true }
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
    clearCart
}
