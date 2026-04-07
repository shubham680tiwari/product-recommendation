const UserVectorGrowth = require('../models/UserVectorGrowth');
const Product = require('../models/Product');
const { searchSimilarProducts } = require('../utils/qdrantOperations');

// Get personalized recommendation for user
exports.getRecommendations = async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10, excludViewed = false } = req.query;

        // Get user's vector profile
        const uvg = await UserVectorGrowth.findOne({ userId });

        if( !uvg || uvg.totalWeight === 0 ) {
            return res.status(200).json({
                success: true,
                message: 'No interaction found, shwoing popular products',
                data: await Product.find({}).limit(parseInt(limit))
            });
        }

        // Calculate the average vector
        const avgVector = uvg.sumVector.map(sum => sum / uvg.totalWeight);

        // Search similar product in Qdrant
        const similarProducts = await searchSimilarProducts(
            avgVector,
            parseInt(limit) * 2
        );

        // Get product details from MongoDB
        const productIds = similarProducts.map(r => r.payload.productId);
        const products = await Product.find({ _id: { $in: productIds }});

        // Add similairty score
        let recommendations = products.map( product => {
            const result = similarProducts.find(
                r => r.payload.productId === product._id.toString()
            );
            return {
                ...product.toObject(),
                recommendationScore: result.score,
                matchReason: getMatchReason(result.score)
            };
        });

        // Sort by score
        recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

        // Limit results
        recommendations = recommendations.slice(0, parseInt(limit));

        res.status(200).json({
            success: true,
            message: 'personalized recommendations returned successfully',
            count: recommendations.length,
            data: recommendations
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to generate recommendations',
            error: error.message
        });
    }
}

exports.getSimilarProducts = async (req, res) => {
    try {
        const { productId } = req.params;
        const { limit = 6 } = req.query;
        
        // Get the product vector
        const { getProductVector } = require('../utils/qdrantOperations');
        const productPoint = await getProductVector(productId);

        if (!productPoint || !productPoint.vector) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Search similar products
        const similarProducts = await searchSimilarProducts(
            productPoint.vector,
            parseInt(limit) + 1
        );

        // Filter out the product itself
        const filtered = similarProducts.filter(
            r => r.payload.productId !== productId
        );

        // Get product details
        const productIds = filtered.map(r => r.payload.productId);
        const products = await Product.find({_id: { $in: productIds }});


        // Add scores to recommended products
        const productsWithScores = products.map(product => {
            const result = filtered.find(
                r => r.payload.productId === product._id.toString()
            );
            return {
                ...product.toObject(),
                similarityScore: result ? result.score : null
            };
        });

        // Sort and limit 
        productsWithScores.sort((a, b) => b.similarityScore - a.similarityScore);
        const finalResults = productsWithScores.slice(0, parseInt(limit));

        res.status(200).json({
            success: true,
            message: 'Similar products found',
            count: finalResults.length,
            data: finalResults 
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to find similar products',
            error: error.message
        });
    }
};

function getMatchReason(score) {
    if(score>0.9) return 'Perfect match for your taste';
    if(score>0.8) return 'Highly recommended';
    if(score>0.7) return 'Good match';
    return 'Might interest you';
}