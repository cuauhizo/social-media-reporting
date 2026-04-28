const express = require('express')
const router = express.Router()
const compromisosController = require('../controllers/compromisosController')

router.get('/', compromisosController.getCompromisos)
router.post('/', compromisosController.addCompromiso)
router.put('/:id', compromisosController.updateCompromiso)
router.delete('/:id', compromisosController.deleteCompromiso)

module.exports = router
