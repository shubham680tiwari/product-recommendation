const { QdrantClient } = require('@qdrant/js-client-rest');

// Initialize Qdrant client
const qdrantClient = new QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY
});

// collection
const COLLECTIONS = {
    PRODUCTS: 'products',
    USERS: 'user_vector'
};

// Initialize a collection
const initializeQdrant = async () => {
    try {
        console.log('Checking if collection already exists');
        const collections = await qdrantClient.getCollections();

        const productCollectionExists = collections.collections.some(col => col.name === COLLECTIONS.PRODUCTS);
        
        if (!productCollectionExists) {
            console.log('Creating products collection');
            await qdrantClient.createCollection(COLLECTIONS.PRODUCTS, {
                vectors: {
                    size: 768,
                    distance: 'Cosine'
                }
            });
            console.log('Product collection created');
        } else {
            console.log('Product collection already exists');
        }

        const userCollectionExists = collections.collections.some(col => col.name === COLLECTIONS.USERS);
        
        if (!userCollectionExists) {
            console.log('Creating users collection');
            await qdrantClient.createCollection(COLLECTIONS.USERS, {
                vectors: {
                    size: 768,
                    distance: 'Cosine'
                }
            });
            console.log('User collection created');
        } else {
            console.log('user collection already exists');
        }
    } catch (error) {
        console.log('Qdrant intialization failed', error.message)
        throw error;
    }
};

module.exports = {
    qdrantClient,
    COLLECTIONS,
    initializeQdrant
}