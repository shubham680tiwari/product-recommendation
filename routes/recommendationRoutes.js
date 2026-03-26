const express = require('express');
const router = express.Router();

const { getRecommendations, getSimilarProducts } = require('../controller/recommendationController');

router.get('/user/:userId', getRecommendations);
router.get('/similar/:productId', getSimilarProducts);

module.exports = router;