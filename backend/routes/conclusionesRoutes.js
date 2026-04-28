const express = require('express')
const router = express.Router()
const conclusionesController = require('../controllers/conclusionesController')

router.get('/', conclusionesController.getConclusiones)
router.post('/', conclusionesController.addConclusiones)
router.put('/:id', conclusionesController.updateConclusiones)
router.delete('/:id', conclusionesController.deleteConclusiones)

module.exports = router
