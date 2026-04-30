const express = require('express')
const router = express.Router()
const reportController = require('../controllers/reportController')

// Define que cuando pidan "/", llame a nuestro controlador
router.get('/:periodId', reportController.getReportData)
router.delete('/reset/:periodId', reportController.resetPeriod)

module.exports = router
