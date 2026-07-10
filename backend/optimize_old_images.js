// backend/optimize_old_images.js
const fs = require('fs')
const path = require('path')
const sharp = require('sharp')
const { pool } = require('./utils/db')

async function optimizarProduccion() {
  console.log('Iniciando proceso de optimización...')

  try {
    const [rows] = await pool.query('SELECT * FROM post_images')

    for (const row of rows) {
      // row.image_url se ve como "/uploads/posts/post_123.png"
      const oldPath = path.join(__dirname, row.image_url)

      if (fs.existsSync(oldPath)) {
        // Si ya es webp, lo saltamos
        if (row.image_url.endsWith('.webp')) {
          console.log(`⏩ Saltando ${row.post_id}, ya está optimizada.`)
          continue
        }

        const newFileName = `${row.post_id}.webp`
        const newUrl = `/uploads/posts/${newFileName}`
        const newPath = path.join(__dirname, 'uploads/posts', newFileName)

        try {
          // 1. Comprimimos y guardamos la nueva en WEBP
          await sharp(oldPath).resize({ width: 800, withoutEnlargement: true }).webp({ quality: 80 }).toFile(newPath)

          // 2. Actualizamos la URL en MySQL
          await pool.query('UPDATE post_images SET image_url = ? WHERE post_id = ?', [newUrl, row.post_id])

          // 3. Borramos la imagen vieja original y pesada
          fs.unlinkSync(oldPath)

          console.log(`✅ Optimizada y reemplazada: ${row.post_id}`)
        } catch (e) {
          console.error(`❌ Error procesando ${row.post_id}:`, e.message)
        }
      } else {
        console.log(`⚠️ Archivo físico no encontrado para ${row.post_id}`)
      }
    }

    console.log('🎉 ¡Todas las imágenes en producción han sido optimizadas exitosamente!')
    process.exit(0)
  } catch (err) {
    console.error('Error al conectar con BD:', err)
    process.exit(1)
  }
}

optimizarProduccion()
