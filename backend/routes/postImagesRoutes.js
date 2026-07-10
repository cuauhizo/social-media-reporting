const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp') // 🚀 1. Importamos sharp
const { pool } = require('../utils/db')

const uploadDir = path.join(__dirname, '../uploads/posts')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 🚀 2. Multer ahora guarda en RAM temporalmente
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Formato no permitido. Solo se aceptan imágenes JPG, PNG o WEBP.'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Aceptamos hasta 10MB porque lo vamos a comprimir de todas formas
})

// OBTENER
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM post_images')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 🚀 3. SUBIR Y OPTIMIZAR
router.post('/', upload.single('image'), async (req, res) => {
  const { post_id } = req.body
  if (!req.file) return res.status(400).send('No se subió ninguna imagen')

  // Siempre las convertiremos a WebP para máxima velocidad
  const fileName = `${post_id}.webp`
  const filePath = path.join(uploadDir, fileName)
  const imageUrl = `/uploads/posts/${fileName}`

  try {
    // Magia de Sharp: Redimensionamos a máx 800px (ideal para web/pdf) y calidad 80%
    await sharp(req.file.buffer).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 80 }).toFile(filePath)

    await pool.query('INSERT INTO post_images (post_id, image_url) VALUES (?, ?) ON DUPLICATE KEY UPDATE image_url = VALUES(image_url)', [post_id, imageUrl])

    res.json({ message: 'Imagen optimizada y guardada con éxito', image_url: imageUrl })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
