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

// 1. Definimos STORAGE (Esto es lo que causaba el error)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Guardamos la imagen usando el ID del post como nombre (ej. fb_cover_2026-03.jpg)
    cb(null, req.body.post_id + path.extname(file.originalname))
  },
})

// 2. Definimos el FILTRO DE SEGURIDAD (Solo imágenes)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    // Rechazamos el archivo y lanzamos un error
    cb(new Error('Formato no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.'), false)
  }
}

// 3. Inicializamos MULTER uniendo Storage + Filtro
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Opcional: Límite de peso de 5MB por imagen
})

// === RUTAS ===

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
