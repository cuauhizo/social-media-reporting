const express = require('express')
const router = express.Router()
const multer = require('multer')
const uploadController = require('../controllers/uploadController') // 👈 Llamamos al nuevo Chef

// Usamos Memoria RAM en lugar de guardar archivos físicos
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos .csv'), false)
  }
}

const upload = multer({ storage, fileFilter })

// La ruta recibe el archivo y se lo pasa al Controlador
router.post('/:type/:periodo', upload.single('csvFile'), uploadController.processCsvUpload)

module.exports = router
