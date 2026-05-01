// backend/controllers/uploadController.js
const { pool } = require('../utils/db')
const csv = require('csv-parser')
const { Readable } = require('stream')

// Generador de IDs únicos para posts
const generarIdEstable = (postExcel, prefijo) => {
  const keys = Object.keys(postExcel)
  const idKey = keys.find(k => k.toLowerCase().includes('post id') || k.toLowerCase().trim() === 'id')
  if (idKey && postExcel[idKey]) return String(postExcel[idKey]).trim()

  const link = postExcel['Post URL'] || postExcel.postPermalink || postExcel['Post Permalink'] || ''
  if (link) return prefijo + '_' + link.replace(/[^a-zA-Z0-9]/g, '').slice(-15)

  const texto = postExcel.mensaje || postExcel['Post Message'] || postExcel['Message'] || 'sin_texto'
  return prefijo + '_' + texto.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)
}

const processCsvUpload = async (req, res) => {
  const { type, periodo } = req.params
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' })

  const results = []

  // Convertimos el archivo en RAM a un flujo de datos que csv-parser puede leer
  Readable.from(req.file.buffer)
    .pipe(csv())
    .on('data', data => results.push(data))
    .on('end', async () => {
      try {
        const connection = await pool.getConnection()

        // ==========================================
        // 1. PROCESAR MÉTRICAS DE POSTS (FB e IG)
        // ==========================================
        if (type === 'fb_posts' || type === 'ig_posts') {
          const tabla = type === 'fb_posts' ? 'fb_posts_metrics' : 'ig_posts_metrics'
          const prefijo = type === 'fb_posts' ? 'fb' : 'ig'

          await connection.query(`DELETE FROM ${tabla} WHERE periodo = ?`, [periodo])

          for (const row of results) {
            const mensaje = row['POST MESSAGE'] || row['Post Message'] || ''
            const tipoPost = row['POST TYPE'] || row['Post Type'] || ''

            if (mensaje || tipoPost.toUpperCase().includes('STORY')) {
              const id = generarIdEstable(row, prefijo)
              const fecha = row['DATE (GMT)'] || row['Date (GMT)'] || null
              const alcance = parseInt(row['REACH'] || row['Reach'] || 0)
              const interacciones = parseInt(row['ENGAGEMENT'] || row['Engagement'] || 0)
              const visitas = parseInt(row['POST VIEWS'] || row['Post views'] || row['Views'] || 0)
              const likes = parseInt(row['LIKES'] || row['Likes'] || 0)
              const shares = parseInt(row['SHARES'] || row['Shares'] || 0)
              const permalink = row['POST PERMALINK'] || row['Post Permalink'] || ''
              const tags = row['POST TAGS'] || row['Post Tags'] || row['Etiquetas'] || ''

              if (type === 'fb_posts') {
                await connection.query(
                  `INSERT INTO fb_posts_metrics (id, periodo, mensaje, tipo_post, fecha, alcance, interacciones, visitas, likes, shares, permalink, tags) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE visitas=VALUES(visitas)`,
                  [id, periodo, mensaje, tipoPost, fecha, alcance, interacciones, visitas, likes, shares, permalink, tags],
                )
              } else {
                const saves = parseInt(row['SAVES'] || row['Saves'] || 0)
                await connection.query(
                  `INSERT INTO ig_posts_metrics (id, periodo, mensaje, tipo_post, fecha, alcance, interacciones, visitas, likes, saves, shares, permalink, tags) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE visitas=VALUES(visitas)`,
                  [id, periodo, mensaje, tipoPost, fecha, alcance, interacciones, visitas, likes, saves, shares, permalink, tags],
                )
              }
            }
          }
        }

        // ==========================================
        // 2. PROCESAR SENTIMIENTOS (FB e IG)
        // ==========================================
        else if (type === 'fb_sentiment' || type === 'ig_sentiment') {
          const red_social = type === 'fb_sentiment' ? 'fb' : 'ig'

          await connection.query('DELETE FROM inbound_sentiment WHERE periodo = ? AND red_social = ?', [periodo, red_social])

          let positive = 0,
            neutral = 0,
            negative = 0
          for (const row of results) {
            const keySentiment = Object.keys(row).find(k => k.toLowerCase().includes('sentiment'))
            if (keySentiment && row[keySentiment]) {
              const val = row[keySentiment].trim().toLowerCase()
              if (val === 'positive') positive++
              else if (val === 'neutral') neutral++
              else if (val === 'negative') negative++
            }
          }

          await connection.query(
            `INSERT INTO inbound_sentiment (periodo, red_social, sentimiento, cantidad) VALUES 
            (?, ?, 'positive', ?), (?, ?, 'neutral', ?), (?, ?, 'negative', ?)`,
            [periodo, red_social, positive, periodo, red_social, neutral, periodo, red_social, negative],
          )
        }

        // ==========================================
        // 3. PROCESAR OVERVIEWS (Métricas globales, Histórico Diario y Ciudades)
        // ==========================================
        else if (type === 'fb_overview' || type === 'ig_overview') {
          const red_social = type === 'fb_overview' ? 'fb' : 'ig'

          await connection.query('DELETE FROM network_kpis WHERE periodo = ? AND red_social = ?', [periodo, red_social])
          await connection.query('DELETE FROM historical_followers WHERE periodo = ? AND red_social = ?', [periodo, red_social])
          await connection.query('DELETE FROM top_cities WHERE periodo = ? AND red_social = ?', [periodo, red_social])

          let kpis = {}
          let historical = []
          let cities = []
          let maxCarousel = 0,
            maxPhoto = 0,
            maxReel = 0,
            maxStory = 0

          for (const row of results) {
            const keys = Object.keys(row)
            const keyDate = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('fecha'))
            const dateVal = keyDate && row[keyDate] ? row[keyDate].split(' ')[0] : null

            if (type === 'fb_overview') {
              const keyTotalFollowers = keys.find(k => k.includes('Total followers'))
              const keyFollowersForTable = keys.find(k => k.includes('Seguidores (This column might contain'))
              const keyInteractions = keys.find(k => k.includes('Interacciones de la página'))

              // A. Histórico Diario
              if (dateVal && !dateVal.toLowerCase().includes('total')) {
                let daily = parseInt(row[keyFollowersForTable]) || parseInt(row[keyTotalFollowers]) || 0
                if (daily > 0) historical.push({ fecha: dateVal, followers: daily })
              }

              // B. KPIs Globales (Buscamos la fila donde vienen todos los totales juntos)
              if (keyInteractions && row[keyInteractions] && keyTotalFollowers && row[keyTotalFollowers]) {
                kpis = {
                  total_followers: parseInt(row[keyTotalFollowers]) || 0,
                  new_followers: parseInt(row[keys.find(k => k.includes('Nuevos seguidores'))]) || 0,
                  engagement_rate: parseFloat(row[keys.find(k => k.includes('Post engagement rate'))]) || 0,
                  fb_interactions: parseInt(row[keyInteractions]) || 0,
                  fb_clics: parseInt(row[keys.find(k => k.includes('Post link clicks'))]) || 0,
                  fb_shares: parseInt(row[keys.find(k => k.includes('Post shares'))]) || 0,
                  fb_comments: parseInt(row[keys.find(k => k.includes('Comentarios y respuestas'))]) || 0,
                  fb_post_impressions: parseInt(row[keys.find(k => k.includes('Impresiones orgánicas'))]) || 0,
                  fb_page_organic_reach: parseInt(row[keys.find(k => k.includes('Alcance orgánico de la página'))]) || 0,
                  fb_page_no_followers_views: parseInt(row[keys.find(k => k.includes('Vistas de página de no seguidores'))]) || 0,
                  fb_page_followers_views: parseInt(row[keys.find(k => k.includes('Visualizaciones de seguidores'))]) || 0,
                  fb_time_visualization: row[keys.find(k => k.includes('Tiempo de visualización'))] || '0',
                }

                // C. Ciudades Top
                const cityKeys = keys.filter(k => k.includes('Seguidores de la página > Ciudad'))
                cityKeys.forEach(k => {
                  let cityName = k.includes('Other') ? 'Other' : k.split('Ciudad - ')[1]?.split(' (')[0] || ''
                  if (cityName !== 'Other' && cityName.includes(',')) cityName = `${cityName.split(',')[0].trim()}, ${cityName.split(',')[1].trim()}`
                  const f = parseInt(row[k]) || 0
                  if (f > 0) cities.push({ name: cityName.trim(), followers: f })
                })
              }
            } else {
              // Lógica IG
              const keyTotalFollowers = keys.find(k => k.includes('Followers') && !k.includes('Daily'))
              const keyHistoryFollowers = keys.find(k => k.includes('Seguidores (Daily'))

              const keyReachCarousel = keys.find(k => k.includes('Post reach - Carousel'))
              const keyReachPhoto = keys.find(k => k.includes('Post reach - Photo'))
              const keyReachReel = keys.find(k => k.includes('Post reach - Reel'))
              const keyReachStory = keys.find(k => k.includes('Post reach - Story'))

              if (keyReachCarousel) maxCarousel = Math.max(maxCarousel, parseInt(row[keyReachCarousel]) || 0)
              if (keyReachPhoto) maxPhoto = Math.max(maxPhoto, parseInt(row[keyReachPhoto]) || 0)
              if (keyReachReel) maxReel = Math.max(maxReel, parseInt(row[keyReachReel]) || 0)
              if (keyReachStory) maxStory = Math.max(maxStory, parseInt(row[keyReachStory]) || 0)

              if (dateVal && !dateVal.toLowerCase().includes('total')) {
                let daily = parseInt(row[keyHistoryFollowers]) || 0
                if (daily >= 0) historical.push({ fecha: dateVal, followers: daily })
              }

              if (keyTotalFollowers && row[keyTotalFollowers]) {
                kpis = {
                  total_followers: parseInt(row[keyTotalFollowers]) || 0,
                  engagement_rate: parseFloat(row[keys.find(k => k.includes('Page engagement rate'))]) || 0,
                  ig_story_taps_forward: parseInt(row[keys.find(k => k.includes('Story taps forward'))]) || 0,
                  ig_story_taps_back: parseInt(row[keys.find(k => k.includes('Story taps back'))]) || 0,
                  ig_story_exits: parseInt(row[keys.find(k => k.includes('Story exits'))]) || 0,
                  ig_post_saves: parseInt(row[keys.find(k => k.includes('Post saves'))]) || 0,
                  ig_post_likes: parseInt(row[keys.find(k => k.includes('Post likes'))]) || 0,
                  ig_post_impressions: parseInt(row[keys.find(k => k.includes('Impresiones de publicaciones'))]) || 0,
                }

                const cityKeys = keys.filter(k => k.includes('Audience > City') || k.includes('Seguidores de la página > Ciudad'))
                cityKeys.forEach(k => {
                  let cityName = k.includes('Other') ? 'Other' : k.split('City - ')[1]?.split(' (')[0] || k.split('Ciudad - ')[1]?.split(' (')[0] || ''
                  if (cityName !== 'Other' && cityName.includes(',')) cityName = `${cityName.split(',')[0].trim()}, ${cityName.split(',')[1].trim()}`
                  const f = parseInt(row[k]) || 0
                  if (f > 0) cities.push({ name: cityName.trim(), followers: f })
                })
              }
            }
          }

          // GUARDAMOS TODO EN MYSQL
          if (Object.keys(kpis).length > 0) {
            if (type === 'ig_overview') {
              kpis.ig_reach_carousel = maxCarousel
              kpis.ig_reach_photo = maxPhoto
              kpis.ig_reach_reel = maxReel
              kpis.ig_reach_story = maxStory
            }
            const cols = Object.keys(kpis)
            const vals = Object.values(kpis)
            await connection.query(`INSERT INTO network_kpis (periodo, red_social, ${cols.join(', ')}) VALUES (?, ?, ${cols.map(() => '?').join(', ')})`, [periodo, red_social, ...vals])
          }

          for (const h of historical) {
            await connection.query('INSERT IGNORE INTO historical_followers (periodo, red_social, fecha, followers) VALUES (?, ?, ?, ?)', [periodo, red_social, h.fecha, h.followers])
          }

          for (const c of cities) {
            await connection.query('INSERT INTO top_cities (periodo, red_social, city_name, followers) VALUES (?, ?, ?, ?)', [periodo, red_social, c.name, c.followers])
          }
        }

        connection.release()
        res.json({ message: `Archivo ${type} analizado y guardado en la Base de Datos con éxito.` })
      } catch (error) {
        console.error(`Error procesando CSV de ${type}:`, error)
        res.status(500).json({ error: 'Error interno guardando los datos en MySQL.' })
      }
    })
}

module.exports = { processCsvUpload }
