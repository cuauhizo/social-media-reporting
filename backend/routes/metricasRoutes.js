const express = require('express')
const router = express.Router()
const metricasController = require('../controllers/metricasController')

router.get('/', metricasController.getMetricas)
router.post('/', metricasController.updateMetricas)

module.exports = router
