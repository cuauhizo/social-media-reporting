const express = require('express')
const router = express.Router()
const { getReportData } = require('../controllers/reportController')

// Define que cuando pidan "/", llame a nuestro controlador
router.get('/:periodId', getReportData)

module.exports = router
