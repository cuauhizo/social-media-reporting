const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { pool } = require('../utils/db')

// Creamos la carpeta físicamente si no existe
const uploadDir = path.join(__dirname, '../uploads/posts')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configuramos Multer para guardar la imagen con el ID del post
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Guardamos la imagen usando el ID del post como nombre (ej. 12345.jpg)
    cb(null, req.body.post_id + path.extname(file.originalname))
  },
})
const upload = multer({ storage: storage })

// 1. OBTENER todas las imágenes personalizadas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM post_images')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 2. SUBIR y guardar la imagen de un post
router.post('/', upload.single('image'), async (req, res) => {
  const { post_id } = req.body
  if (!req.file) return res.status(400).send('No se subió ninguna imagen')

  // La ruta pública que usará el frontend para ver la imagen
  const imageUrl = `/uploads/posts/${req.file.filename}`

  try {
    await pool.query('INSERT INTO post_images (post_id, image_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE image_url = VALUES(image_url)', [post_id, imageUrl])
    res.json({ message: 'Imagen guardada con éxito', image_url: imageUrl })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
