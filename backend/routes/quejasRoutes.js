const express = require('express')
const router = express.Router()
const quejasController = require('../controllers/quejasController')

router.get('/', quejasController.getQuejas)
router.post('/', quejasController.addQueja)
router.put('/:id', quejasController.updateQueja)
router.delete('/:id', quejasController.deleteQueja)

module.exports = router
