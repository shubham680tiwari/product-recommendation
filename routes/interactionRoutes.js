const express = require('express');
const router = express.Router();

const {
    trackInteraction,
    getUserProfile
} = require('../controller/interactionController');

router.post('/track', trackInteraction);
router.get('profile/:userId', getUserProfile);

module.exports = router;