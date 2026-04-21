const cartRepository = require("../repository/cartrepository");

/**
 * Creates a cart for a user.
 */
const createCartService = async (data) => {
    const { userId } = data;
    const existingCart = await cartRepository.getCartByUserId(userId);
    if (existingCart) {
        throw new Error("Cart already exists for this user");
    }
    return await cartRepository.createCart(data);
}

/**
 * Retrieves a user's cart.
 */
const getCartByUserIdService = async (userId) => {
    const cart = await cartRepository.getCartByUserId(userId);
    if (!cart) {
        throw new Error("Cart not found");
    }
    return cart;
}

/**
 * Adds an item to the cart with specific pricing selection.
 * @param {String} userId
 * @param {String} serviceId
 * @param {Object} selectionDetails - { city }
 * @param {Number} quantity
 */
const addToCartService = async (userId, serviceId, selectionDetails, quantity = 1) => {
    if (!userId || !serviceId) {
        throw new Error("User ID and Service ID are required");
    }
    
    const { city } = selectionDetails;
    if (!city) {
        throw new Error("City is required for service selection");
    }

    return await cartRepository.addToCart(userId, serviceId, selectionDetails, quantity);
}

/**
 * Updates an item's quantity in the cart.
 * @param {String} userId
 * @param {String} itemId - The ID of the item within the items array
 * @param {Number} quantity
 */
const updateCartItemService = async (userId, itemId, quantity) => {
    if (quantity < 0) throw new Error("Quantity cannot be negative");
    
    if (quantity === 0) {
        return await cartRepository.removeCartItem(userId, itemId);
    }
    
    return await cartRepository.updateCartItem(userId, itemId, quantity);
}

/**
 * Removes an item from the cart entirely.
 */
const removeCartItemService = async (userId, itemId) => {
    return await cartRepository.removeCartItem(userId, itemId);
}

/**
 * Clears the entire cart.
 */
const clearCartService = async (userId) => {
    return await cartRepository.clearCart(userId);
}

module.exports = {
    createCartService,
    getCartByUserIdService,
    addToCartService,
    updateCartItemService,
    removeCartItemService,
    clearCartService
}