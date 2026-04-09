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
    // Si por alguna razón la carpeta data no existe, la creamos
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  // ¿Qué nombre le ponemos? Usamos nuestro diccionario
  filename: (req, file, cb) => {
    const fileType = req.params.type // Lo leeremos de la URL
    const exactName = fileMapping[fileType]

    if (exactName) {
      cb(null, exactName) // Lo renombramos y sobrescribimos si ya existe
    } else {
      cb(new Error('Tipo de archivo no válido'), false)
    }
  },
})

// 3. Filtro de seguridad (¡Solo aceptamos .csv!)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true)
  } else {
    cb(new Error('El archivo debe ser un formato .csv'), false)
  }
}

// Inicializamos el middleware de Multer
const upload = multer({ storage: storage, fileFilter: fileFilter })

// 4. Endpoint de subida (El frontend hará un POST a /api/upload/fb_posts)
router.post('/:type', upload.single('csvFile'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo o formato inválido.' })
    }

    const newFileName = fileMapping[req.params.type]
    console.log(`✅ Nuevo archivo subido exitosamente: ${newFileName}`)

    res.json({
      message: 'Archivo subido y actualizado con éxito',
      fileName: newFileName,
    })
  } catch (error) {
    console.error('Error al subir el archivo:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
