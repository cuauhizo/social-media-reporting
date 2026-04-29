const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// 1. Diccionario de nombres exactos (Nomenclatura Jerárquica)
// El frontend mandará la "llave" (ej. fb_posts) y multer lo guardará con el "valor" (01_fb_posts_metrics.csv)
const fileMapping = {
  global_manual: '00_global_manual_data.csv',
  fb_overview: '01_fb_overview_kpis.csv',
  fb_posts: '01_fb_posts_metrics.csv',
  fb_sentiment: '01_fb_inbound_sentiment.csv',
  ig_overview: '02_ig_overview_kpis.csv',
  ig_posts: '02_ig_posts_metrics.csv',
  ig_sentiment: '02_ig_inbound_sentiment.csv',
}

// 2. Configurar el "Disco Duro" de Multer
const storage = multer.diskStorage({
  // ¿Dónde lo guardamos? En la carpeta data/
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../data')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  // ¿Qué nombre le ponemos? Usamos nuestro diccionario
  filename: (req, file, cb) => {
    const { type, periodo } = req.params // 👈 Capturamos el periodo de la URL
    const exactName = fileMapping[type]

    if (exactName && periodo) {
      // 🛡️ El nombre ahora será: "YYYY-MM_nombre_archivo.csv"
      cb(null, `${periodo}_${exactName}`)
    } else {
      cb(new Error('Tipo de archivo o periodo no válido'), false)
    }
  },
})

// 3. Filtro de seguridad (¡Solo aceptamos .csv!)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true)
  } else {
    cb(new Error('Solo se permiten archivos .csv'), false)
  }
}

const upload = multer({ storage, fileFilter })

// El frontend enviará /api/upload/fb_posts/2026-03
router.post('/:type/:periodo', upload.single('csvFile'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Archivo no subido' })
    res.json({ message: 'Archivo guardado con historial', fileName: req.file.filename })
  } catch (error) {
    res.status(500).json({ error: 'Error al procesar la subida' })
  }
})

module.exports = router
