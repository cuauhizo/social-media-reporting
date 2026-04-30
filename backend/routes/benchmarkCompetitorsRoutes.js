const express = require('express')
const router = express.Router()
const compController = require('../controllers/benchmarkCompetitorsController')

router.get('/', compController.getCompetitors)
router.post('/', compController.addCompetitor)
router.put('/:id', compController.updateCompetitor)
router.delete('/:id', compController.deleteCompetitor)
router.post('/clone', compController.cloneCompetitors)

module.exports = router
