const Cart = require('../models/Cart');
const Product = require('../models/Product');


exports.getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({userId: req.params.userId})
            .populate('items.productId', 'name price imageUrl');

        if(!cart) {
            return res.status(200).json({
                success: true,
                message: 'Cart is Empty',
                data: {items: [], totalItems: 0, totalPrice: 0}
            });
        }

        // Filter out items with null productId
        const validItems = cart.items.filter(item => item.productId);

        // Calculate Totals
        const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = validItems.reduce((sum, item) => sum + (item.priceAtAdd * item.quantity), 0);

        res.status(200).json({
            success: true,
            data: {
                ...cart.toObject(),
                items: validItems,
                totalItems,
                totalPrice
            }
        });

    } catch (error) {
        
        res.status(500).json({
            success: false,
            message: 'Failed to get cart',
            error: error.message
        });
    }
};


exports.addToCart = async (req, res) => {
    try {
        const {userId, productId, quantity = 1} = req.body;
        const product = await Product.findById(productId);
        
        if(!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if(product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        let cart = await Cart.findOne({userId});

        if(!cart) {
            // create new cart
            cart = await Cart.create({
                userId,
                items: [{
                    productId,
                    quantity,
                    priceAtAdd: product.price
                }]
            });
        } else {
            // Existing product
            const exisitingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            if(exisitingItemIndex > -1){
                cart.items[exisitingItemIndex].quantity += quantity;
            } else {
                cart.items.push({
                    productId,
                    quantity,
                    priceAtAdd: product.price
                });
            }

            await cart.save();
        }

        await cart.populate('items.productId', 'name price');

        // Track interactions in uvg
        const interactionController = require('./interactionController');
        await interactionController.trackInteraction(
            {
                body: {
                    userId,
                    productId,
                    interactionType: 'cart'
                }
            },
            {
                status: () => ({json: () => {}}) //Mock response
            }
        )

        return res.status(200).json({
            success: true,
            message: 'Item Added to Cart',
            data: cart
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to Add to cart',
            error: error.message
        });
    }
};


exports.updateCartItem = async (req, res) => {
    try {
        const { userId, productId, quantity =1 } = req.body;

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be greater than 1'
            });
        }

        let cart = await Cart.findOne({userId});

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if(itemIndex === -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                productId,
                quantity,
                priceAtAdd: product.price
            });
        }
        await cart.save();
        await cart.populate('items.productId', 'name price');

        res.status(200).json({
            success: true,
            message: 'Cart updated successfully'
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update the cart',
            error: error.message
        });
    }
};


exports.removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        let cart = await Cart.findOne({userId});
        console.log('cart', cart);
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(
            item = item.productId.toString() !== productId
        );

        await cart.save();
        await cart.populate('items.productId', 'name price');

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: cart
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to remove the item',
            error: error.message
        });
    }
};



exports.clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({userId: req.params.userId});

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
};





