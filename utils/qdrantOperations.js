const { qdrantClient, COLLECTIONS } = require('../config/qdrant');
const { v4: uuidv4 } = require('uuid');

// Store product vector in Qdrant
const upsertProductVector = async (productId, vector, payload = {}) => {
    try {
        await qdrantClient.upsert(COLLECTIONS.PRODUCTS, {
            wait: true,
            points: [
                {
                    id: uuidv4(),
                    vector: vector,
                    payload: {
                        productId: productId,
                        ...payload
                    }
                }
            ]
        });

        console.log(`Upserted vector for product: ${productId}`);
        return true;
    } catch (error) {
        console.log('Failed to upsert the vector', error);
        throw error;
    }
};

// Search similar products in vector
const searchSimilarProducts = async (vector, limit=10, filter=null) => {
    try {
        const searchResults = await qdrantClient.search(COLLECTIONS.PRODUCTS, {
            vector: vector,
            limit: limit,
            with_payload: true,
            filter: filter
        });

        return searchResults;
    } catch (error) {
        console.error('Vector search failed', error);
        throw error;
    }
};

// Get product vector by Id
const getProductVector = async (productId) => {
    try {
        const points = await qdrantClient.retrieve(COLLECTIONS.PRODUCTS, {
            ids: [productId],
            with_vector: true
        });

        return points[0] || null;
    } catch (error) {
        console.error('Failed to get product vector', error);
        return null;
    }
}

// Delete product vector
const deleteProductVector = async (productId) => {
    try {
        await qdrantClient.delete(COLLECTIONS.PRODUCTS, {
            wait: true,
            points: [productId]
        });

        console.log(`Deleted vector for productId: ${productId}`);
        return true;
    } catch (error) {
        console.error('Failed to delete the product vector', error);
        return false;
    }
};

module.exports = {
    upsertProductVector,
    searchSimilarProducts,
    getProductVector,
    deleteProductVector
};

