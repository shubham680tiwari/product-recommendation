const userVectorGrowth = require('../models/UserVectorGrowth');
const { getProductVector } = require('../utils/qdrantOperations');

exports.trackInteractions = async (req, res) => {
    try {
        const { userId, productId, interactiontype = 'view'} = req.body;

        // Define weight for different interactions
        const weights = {
            view: 1,
            cart: 3,
            purchase: 5
        };

        const weight = weights[interactiontype] || 1;

        // get product vector from Qdrant
        const productPoint = await getProductVector(productId);

        if(!productPoint || !productPoint.vector) {
            return res.status(404).json({
                success: false,
                message: 'Product vector not found'
            });
        }

        const productVector = productPoint.vector;

        // Find or create user vector growth
        let uvg = await userVectorGrowth.create({
            userId,
            sumVector
        })
    }
}