const express = require('express')
const router = express.Router()
const casosCSController = require('../controllers/casosCSController')

router.get('/', casosCSController.getCasosCS)
router.post('/', casosCSController.addCasosCS)
router.put('/:id', casosCSController.updateCasosCS)
router.delete('/:id', casosCSController.deleteCasosCS)

module.exports = router
