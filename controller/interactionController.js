const userVectorGrowth = require('../models/UserVectorGrowth');
const { getProductVector } = require('../utils/qdrantOperations');

exports.trackInteraction = async (req, res) => {
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
        let uvg = await userVectorGrowth.findOne({ userId });
        if(!uvg) {
            uvg = await userVectorGrowth.create({
                userId,
                sumVector: productVector.map(v => v * weight),
                totalWeight: weight,
                interactionCount: 1
            });
        } else {
            uvg.sumVector = uvg.sumVector.map((sum, i) => sum + (productVector[i] * weight));
            uvg.totalWeight += weight;
            uvg.interactionCount += 1;
            await uvg.save();
        }

        console.log(`Tracked ${interactiontype} for ${userId}`);

        res.status(200).json({
            success: true,
            message: `${interactiontype} interaction Tracked`,
            data: {
                totalWeight: uvg.totalWeight,
                interactionCount: uvg.interactionCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to track interaction',
            error: error.message
        });
    }
}

exports.getUserProfile = async (req, res) => {
    try {
        const uvg = await userVectorGrowth.findOne({userId: req.params.userId});

        if (!uvg) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found'
            });
        }

        // Calculate average vector
        const avgVector = uvg.sumVector.map(sum => sum/uvg.totalWeight);

        res.status(200).json({
            success: true,
            data: {
                userId: uvg.userId,
                totalWeight: uvg.totalWeight,
                interactionCount: uvg.interactionCount,
                vectorDimension: avgVector.length,
                sampleVector: avgVector.slice(0, 10)
            } 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get user profile',
            error: error.message
        });
    }
}
