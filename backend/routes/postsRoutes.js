// backend/routes/postsRoutes.js
const express = require('express')
const router = express.Router()
const postsController = require('../controllers/postsController')

router.get('/', postsController.getPosts) // 👈 NUEVA
router.put('/:id', postsController.updatePost)

module.exports = router
