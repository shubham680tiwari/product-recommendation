const express = require('express');
const router = express.Router();
const {
    createUser,
    getAllUsers,
    getUserById
} = require('../controller/userController');


router.route('/')
    .post(createUser)
    .get(getAllUsers)

router.get('/:id', getUserById);

module.exports = router;