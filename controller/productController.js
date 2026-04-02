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

// Add this NEW function
exports.hybridSearch = async (req, res) => {
  try {
    const { query, limit = 20, textWeight = 0.4, semanticWeight = 0.6 } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Run both searches in parallel
    const [textResults, semanticResults] = await Promise.all([
      // Text search
      Product.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      ).limit(limit).lean(),
      
      // Semantic search
      (async () => {
        const { generateEmbedding } = require('../utils/embeddingService');
        const { searchSimilarProducts } = require('../utils/qdrantOperations');
        
        const queryEmbedding = await generateEmbedding(query);
        const vectorResults = await searchSimilarProducts(queryEmbedding, limit);
        
        // Get product details
        const productIds = vectorResults.map(r => r.payload.productId);
        const products = await Product.find({ _id: { $in: productIds } }).lean();
        
        // Attach scores
        return products.map(product => {
          const result = vectorResults.find(r => r.payload.productId === product._id.toString());
          return {
            ...product,
            semanticScore: result.score
          };
        });
      })()
    ]);

    // Normalize text scores (MongoDB text scores can be large)
    const maxTextScore = Math.max(...textResults.map(p => p.score || 1), 1);
    textResults.forEach(p => {
      p.normalizedTextScore = (p.score || 0) / maxTextScore;
    });

    // Combine results
    const combinedMap = new Map();

    // Add text results
    textResults.forEach(product => {
      combinedMap.set(product._id.toString(), {
        ...product,
        textScore: product.normalizedTextScore,
        semanticScore: 0,
        hybridScore: product.normalizedTextScore * textWeight
      });
    });

    // Add/merge semantic results
    semanticResults.forEach(product => {
      const id = product._id.toString();
      if (combinedMap.has(id)) {
        // Product found in both - update scores
        const existing = combinedMap.get(id);
        existing.semanticScore = product.semanticScore;
        existing.hybridScore = (existing.textScore * textWeight) + (product.semanticScore * semanticWeight);
      } else {
        // Only in semantic results
        combinedMap.set(id, {
          ...product,
          textScore: 0,
          hybridScore: product.semanticScore * semanticWeight
        });
      }
    });

    // Convert to array and sort by hybrid score
    const hybridResults = Array.from(combinedMap.values())
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, limit);

    res.status(200).json({
      success: true,
      count: hybridResults.length,
      data: hybridResults,
      metadata: {
        textResultsCount: textResults.length,
        semanticResultsCount: semanticResults.length,
        weights: { textWeight, semanticWeight }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Hybrid search failed',
      error: error.message
    });
  }
};

