const express = require('express')
const router = express.Router()
const kpisController = require('../controllers/networkKpisController')

router.get('/', kpisController.getNetworkKpis)
router.put('/', kpisController.updateNetworkKpis)

module.exports = router
