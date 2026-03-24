const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProduct,
    semanticSearch
} = require('../controller/productController');

router.route('/')
    .get(getAllProducts)
    .post(createProduct);

router.post('/semantic-search', semanticSearch);
router.get('/search', searchProduct);

router.route('/:id')
    .get(getProductById)
    .put(updateProduct)
    .delete(deleteProduct);


module.exports = router;
