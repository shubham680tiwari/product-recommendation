const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProduct,
    semanticSearch,
    hybridSearch
} = require('../controller/productController');

router.route('/')
    .get(getAllProducts)
    .post(createProduct);

router.get('/search', searchProduct);
router.post('/semantic-search', semanticSearch);
router.post('/hybrid-search', hybridSearch)

router.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);


module.exports = router;
