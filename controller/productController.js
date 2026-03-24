const Product = require('../models/Product');
const { generateProductEmbedding } = require('../utils/embeddingService');
const { upsertProductVector, deleteProductVector, searchSimilarProducts } = require('../utils/qdrantOperations');

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });      
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if(!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
  
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const {name, short_description, long_description, price, category, stock} = req.body;
        const product = await Product.create({
            name,
            short_description,
            long_description,
            price,
            category,
            stock
        });

        console.log('Generating product embedding...');
        const embedding = await generateProductEmbedding(product);

        console.log('Store the vector in Qdrant');
        await upsertProductVector(
            product._id.toString(),
            embedding,
            {
                name: product.name,
                category: product.category,
                price: product.price
            }
        );

        product.qdrantId = product._id.toString();
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product 
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to create product',
            error: error.message
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if(!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'product updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Failed to update the product',
            error: error.message
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if(!product) {
            res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if(product.qdrantId) {
            await deleteProductVector(product.qdrantId);
        }

        // delete from MongoDB
        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error: product not deleted',
            error: error.message
        });
    }
};

exports.searchProduct = async (req, res) => {
    try {
        const {q} = req.query;

        if(!q){
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const products = await Product.find(
            {$text: {$search: q}},
            {score: {$meta: 'textScore'}}
        ).sort({score: {$meta: 'textScore'}});

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Search failed',
            error: error.message
        })
    }
}

exports.semanticSearch = async (req, res) => {
    try {
        const { query, limit=10 } = req.body;

        // no query provided
        if (!query) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        // Generate embedding for seach query
        const { generateEmbedding } = require('../utils/embeddingService');
        const queryEmbedding = await generateEmbedding(query);

        // search in Qdrant
        const results = await searchSimilarProducts(queryEmbedding, limit);

        const productIds = results.map(r => r.payload.productId);
        const products = await Product.find({_id: {$in: productIds}});

        // Add similarity score
        const productsWithScores = products.map(product => {
            const result = results.find(r => r.payload.productId === product._id.toString());
            return {
                ...product.toObject(),
                similarityScore: result.score
            };
        });

        // Sort by score
        productsWithScores.sort((a, b) => b.similarityScore - a.similarityScore);
        res.status(200).json({
            success: true,
            count: productsWithScores.length,
            data: productsWithScores
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Semantic search failed',
            error: error.message
        });
    }
};


