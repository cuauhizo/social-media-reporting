const express = require('express')
const router = express.Router()
const benchmarkInsightsController = require('../controllers/benchmarkInsightsController')

router.get('/', benchmarkInsightsController.getBenchmarkInsights)
router.post('/', benchmarkInsightsController.addBenchmarkInsights)
router.put('/:id', benchmarkInsightsController.updateBenchmarkInsights)
router.delete('/:id', benchmarkInsightsController.deleteBenchmarkInsights)

module.exports = router
