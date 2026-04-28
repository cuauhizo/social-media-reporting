const express = require('express')
const router = express.Router()
const propuestasController = require('../controllers/propuestasController')

router.get('/', propuestasController.getPropuestas)
router.post('/', propuestasController.addPropuesta)
router.put('/:id', propuestasController.updatePropuesta)
router.delete('/:id', propuestasController.deletePropuesta)

module.exports = router
