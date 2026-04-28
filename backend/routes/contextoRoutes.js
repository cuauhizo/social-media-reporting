const express = require('express')
const router = express.Router()
const contextoController = require('../controllers/contextoController')

router.get('/', contextoController.getContexto)
router.post('/', contextoController.addContexto)
router.put('/:id', contextoController.updateContexto)
router.delete('/:id', contextoController.deleteContexto)

module.exports = router
