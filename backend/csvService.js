const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')

// Lee metricas_pluxee.csv para obtener KPIs generales (alcance total, seguidores, etc.)
function leerKpisGenerales() {
  return new Promise((resolve, reject) => {
    const kpis = {}
    const rutaArchivo = path.join(__dirname, 'data', 'metricas_pluxee.csv')

    if (!fs.existsSync(rutaArchivo)) {
      console.log('⚠️ No se encontró metricas_pluxee.csv. Usando datos por defecto.')
      return resolve({}) // Devolvemos objeto vacío si no existe
    }

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        // Guardamos la llave y su valor (ej. kpis['fb_followers'] = 3950)
        kpis[row.kpi] = row.valor
      })
      .on('end', () => {
        console.log('✅ KPIs Generales maestros leídos con éxito.')
        resolve(kpis)
      })
      .on('error', error => reject(error))
  })
}

// Lee hootsuite_metricas_fb.csv para obtener KPIs generales de Facebook (seguidores, clics, shares, etc.) y también las ciudades top
function leerKpisFacebookHootsuite() {
  return new Promise((resolve, reject) => {
    // Asegúrate de que el archivo se llame así en tu carpeta data/
    const rutaArchivo = path.join(__dirname, 'data', 'hootsuite_metricas_fb.csv')

    if (!fs.existsSync(rutaArchivo)) {
      console.log('⚠️ No se encontró hootsuite_metricas_fb.csv. Usando respaldo.')
      return resolve(null)
    }

    let kpisMensuales = null

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        const keys = Object.keys(row)

        // Buscamos los nombres de las columnas reales usando palabras clave
        const keyInteractions = keys.find(k => k.includes('Interacciones de la página'))
        const keyFollowers = keys.find(k => k.includes('Total followers'))
        const keyReach = keys.find(k => k.includes('Alcance orgánico'))
        const keyEngagement = keys.find(k => k.includes('Post engagement rate'))
        const keyClics = keys.find(k => k.includes('Post link clicks'))
        const keyShares = keys.find(k => k.includes('Post shares'))
        const keyComments = keys.find(k => k.includes('Comentarios y respuestas'))
        const keyImpressions = keys.find(k => k.includes('Impresiones orgánicas'))
        const keyTimeVisualization = keys.find(k => k.includes('Tiempo de visualización'))
        const keyPageOrganicReach = keys.find(k => k.includes('Alcance orgánico de la página'))
        const keyNoFollowersViews = keys.find(k => k.includes('Vistas de página de no seguidores'))
        const keyFollowersViews = keys.find(k => k.includes('Visualizaciones de seguidores'))

        // Solo guardamos si la fila tiene datos (ignoramos los días vacíos)
        if (keyFollowers && row[keyFollowers]) {
          // 1. Extraemos las columnas de las ciudades
          const cityKeys = keys.filter(k => k.includes('Seguidores de la página > Ciudad'))

          const topCities = cityKeys
            .map(k => {
              let cityName = 'Desconocida'

              // 1. Identificamos si es la columna "Other"
              if (k.includes('Other')) {
                cityName = 'Other'
              } else {
                // Extraemos la parte después de "Ciudad - " y antes del primer "("
                // Ej: "Monterrey, Nuevo León, Mexico "
                const rawName = k.split('Ciudad - ')[1]?.split(' (')[0] || ''
                const parts = rawName.split(',')

                // 2. Tomamos solo la Ciudad y el Estado (las primeras 2 partes separadas por coma)
                if (parts.length >= 2) {
                  cityName = `${parts[0].trim()}, ${parts[1].trim()}`
                } else {
                  // Respaldo por si viene sin comas
                  cityName = rawName.trim()
                }
              }

              return {
                name: cityName,
                followers: parseFloat(row[k]) || 0,
              }
            })
            .filter(c => c.followers > 0)

            // 3. ORDENAMIENTO INTELIGENTE
            .sort((a, b) => {
              // Si "a" es Other, lo mandamos al fondo (retorna 1)
              if (a.name === 'Other') return 1
              // Si "b" es Other, lo mandamos al fondo (retorna -1)
              if (b.name === 'Other') return -1
              // Para el resto, ordenamos de mayor a menor número de seguidores
              return b.followers - a.followers
            })

          kpisMensuales = {
            interactions: parseFloat(row[keyInteractions]),
            followers: parseFloat(row[keyFollowers]),
            reach: parseFloat(row[keyReach]),
            post_impressions: parseFloat(row[keyImpressions]),
            post_engagement_rate: parseFloat(row[keyEngagement]),
            clics: parseFloat(row[keyClics]),
            shares: parseFloat(row[keyShares]),
            comments: parseFloat(row[keyComments]),
            time_visualization: row[keyTimeVisualization],
            page_organic_reach: parseFloat(row[keyPageOrganicReach]),
            page_no_followers_views: parseFloat(row[keyNoFollowersViews]),
            page_followers_views: parseFloat(row[keyFollowersViews]),
            topCities: topCities,
          }
        }
      })
      .on('end', () => {
        console.log('✅ KPIs Generales de Facebook leídos directamente del reporte de Hootsuite!')
        resolve(kpisMensuales)
      })
      .on('error', error => reject(error))
  })
}

// hootsuite_metricas_ig.csv para obtener KPIs generales de Facebook (seguidores, clics, shares, etc.) y también las ciudades top
function leerKpisInstagramHootsuite_old() {
  return new Promise((resolve, reject) => {
    // Asegúrate de que el archivo se llame así en tu carpeta data/
    const rutaArchivo = path.join(__dirname, 'data', 'hootsuite_metricas_ig.csv')

    if (!fs.existsSync(rutaArchivo)) {
      console.log('⚠️ No se encontró hootsuite_metricas_ig.csv. Usando respaldo.')
      return resolve(null)
    }

    let kpisMensuales = null

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        const keys = Object.keys(row)

        // Buscamos los nombres de las columnas reales usando palabras clave
        const keyFollowers = keys.find(k => k.includes('Followers'))
        const keyPosts = keys.find(k => k.includes('Posts'))
        const keyPageEngagement = keys.find(k => k.includes('Page engagement rate'))
        const keyStoryTapsForward = keys.find(k => k.includes('Story taps forward'))
        const keyStoryTapsBack = keys.find(k => k.includes('Story taps back'))
        const keyStoryExits = keys.find(k => k.includes('Story exits'))
        const keyPostSaves = keys.find(k => k.includes('Post saves'))
        const keyPostLikes = keys.find(k => k.includes('Post likes'))
        const keyReachCarousel = keys.find(k => k.includes('Post reach - Carousel'))
        const keyReachPhoto = keys.find(k => k.includes('Post reach - Photo'))
        const keyReachReel = keys.find(k => k.includes('Post reach - Reel'))
        const keyReachStory = keys.find(k => k.includes('Post reach - Story'))

        // Solo guardamos si la fila tiene datos (ignoramos los días vacíos)
        if (keyFollowers && row[keyFollowers]) {
          // 1. Extraemos las columnas de las ciudades
          const cityKeys = keys.filter(k => k.includes('Seguidores de la página > Ciudad') || k.includes('Audience > City'))

          const topCities = cityKeys
            .map(k => {
              let cityName = 'Desconocida'

              // 1. Identificamos si es la columna "Other"
              if (k.includes('Other')) {
                cityName = 'Other'
              } else {
                // Extraemos la parte después de "Ciudad - " y antes del primer "("
                // Ej: "Monterrey, Nuevo León, Mexico "
                const rawName = k.split('Ciudad - ')[1]?.split(' (')[0] || k.split('City - ')[1]?.split(' (')[0] || ''
                const parts = rawName.split(',')

                // 2. Tomamos solo la Ciudad y el Estado (las primeras 2 partes separadas por coma)
                if (parts.length >= 2) {
                  cityName = `${parts[0].trim()}, ${parts[1].trim()}`
                } else {
                  // Respaldo por si viene sin comas
                  cityName = rawName.trim()
                }
              }

              return {
                name: cityName,
                followers: parseFloat(row[k]) || 0,
              }
            })
            .filter(c => c.followers > 0)

            // 3. ORDENAMIENTO INTELIGENTE
            .sort((a, b) => {
              // Si "a" es Other, lo mandamos al fondo (retorna 1)
              if (a.name === 'Other') return 1
              // Si "b" es Other, lo mandamos al fondo (retorna -1)
              if (b.name === 'Other') return -1
              // Para el resto, ordenamos de mayor a menor número de seguidores
              return b.followers - a.followers
            })

          kpisMensuales = {
            followers: parseFloat(row[keyFollowers]),
            page_engagement_rate: parseFloat(row[keyPageEngagement]),
            posts_total: parseFloat(row[keyPosts]),
            story_taps_forward: parseFloat(row[keyStoryTapsForward]),
            story_taps_back: parseFloat(row[keyStoryTapsBack]),
            story_exits: parseFloat(row[keyStoryExits]),
            post_saves: parseFloat(row[keyPostSaves]),
            post_likes: parseFloat(row[keyPostLikes]),
            reach_by_type: {
              carousel: parseFloat(row[keyReachCarousel]) || 0,
              photo: parseFloat(row[keyReachPhoto]) || 0,
              reel: parseFloat(row[keyReachReel]) || 0,
              story: parseFloat(row[keyReachStory]) || 0,
            },
            topCities: topCities,
          }
        }

        // Solo guardamos si la fila tiene datos (ignoramos los días vacíos)
        if (keyFollowers && row[keyFollowers]) {
          // 1. Extraemos las columnas de las ciudades
          const cityKeys = keys.filter(k => k.includes('Seguidores de la página > Ciudad') || k.includes('Audience > City'))

          const topCities = cityKeys
            .map(k => {
              let cityName = 'Desconocida'

              // 1. Identificamos si es la columna "Other"
              if (k.includes('Other')) {
                cityName = 'Other'
              } else {
                // Extraemos la parte después de "Ciudad - " y antes del primer "("
                // Ej: "Monterrey, Nuevo León, Mexico "
                const rawName = k.split('Ciudad - ')[1]?.split(' (')[0] || k.split('City - ')[1]?.split(' (')[0] || ''
                const parts = rawName.split(',')

                // 2. Tomamos solo la Ciudad y el Estado (las primeras 2 partes separadas por coma)
                if (parts.length >= 2) {
                  cityName = `${parts[0].trim()}, ${parts[1].trim()}`
                } else {
                  // Respaldo por si viene sin comas
                  cityName = rawName.trim()
                }
              }

              return {
                name: cityName,
                followers: parseFloat(row[k]) || 0,
              }
            })
            .filter(c => c.followers > 0)

            // 3. ORDENAMIENTO INTELIGENTE
            .sort((a, b) => {
              // Si "a" es Other, lo mandamos al fondo (retorna 1)
              if (a.name === 'Other') return 1
              // Si "b" es Other, lo mandamos al fondo (retorna -1)
              if (b.name === 'Other') return -1
              // Para el resto, ordenamos de mayor a menor número de seguidores
              return b.followers - a.followers
            })

          kpisMensuales = {
            followers: parseFloat(row[keyFollowers]),
            page_engagement_rate: parseFloat(row[keyPageEngagement]),
            posts_total: parseFloat(row[keyPosts]),
            story_taps_forward: parseFloat(row[keyStoryTapsForward]),
            story_taps_back: parseFloat(row[keyStoryTapsBack]),
            story_exits: parseFloat(row[keyStoryExits]),
            post_saves: parseFloat(row[keyPostSaves]),
            post_likes: parseFloat(row[keyPostLikes]),
            reach_by_type: {
              carousel: parseFloat(row[keyReachCarousel]) || 0,
              photo: parseFloat(row[keyReachPhoto]) || 0,
              reel: parseFloat(row[keyReachReel]) || 0,
              story: parseFloat(row[keyReachStory]) || 0,
            },
            topCities: topCities,
          }
        }
      })
      .on('end', () => {
        console.log('✅ KPIs Generales de Instagram leídos directamente del reporte de Hootsuite!')
        resolve(kpisMensuales)
      })
      .on('error', error => reject(error))
  })
}

// hootsuite_metricas_ig.csv para obtener KPIs generales de IG y las ciudades top
function leerKpisInstagramHootsuite() {
  return new Promise((resolve, reject) => {
    const rutaArchivo = path.join(__dirname, 'data', 'hootsuite_metricas_ig.csv')

    if (!fs.existsSync(rutaArchivo)) {
      console.log('⚠️ No se encontró hootsuite_metricas_ig.csv. Usando respaldo.')
      return resolve(null)
    }

    let kpisMensuales = null

    // ✨ CAJAS FUERTES: Para no perder los datos si la última fila está vacía
    let maxCarousel = 0
    let maxPhoto = 0
    let maxReel = 0
    let maxStory = 0

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        const keys = Object.keys(row)

        const keyFollowers = keys.find(k => k.includes('Followers'))
        const keyPosts = keys.find(k => k.includes('Posts'))
        const keyPageEngagement = keys.find(k => k.includes('Page engagement rate'))
        const keyStoryTapsForward = keys.find(k => k.includes('Story taps forward'))
        const keyStoryTapsBack = keys.find(k => k.includes('Story taps back'))
        const keyStoryExits = keys.find(k => k.includes('Story exits'))
        const keyPostSaves = keys.find(k => k.includes('Post saves'))
        const keyPostLikes = keys.find(k => k.includes('Post likes'))

        // Buscadores para la gráfica de Alcance
        const keyReachCarousel = keys.find(k => k.includes('Post reach - Carousel'))
        const keyReachPhoto = keys.find(k => k.includes('Post reach - Photo'))
        const keyReachReel = keys.find(k => k.includes('Post reach - Reel'))
        const keyReachStory = keys.find(k => k.includes('Post reach - Story'))

        // ✨ ATRAPAMOS EL VALOR MÁS ALTO DEL MES ✨
        if (keyReachCarousel) maxCarousel = Math.max(maxCarousel, parseFloat(row[keyReachCarousel]) || 0)
        if (keyReachPhoto) maxPhoto = Math.max(maxPhoto, parseFloat(row[keyReachPhoto]) || 0)
        if (keyReachReel) maxReel = Math.max(maxReel, parseFloat(row[keyReachReel]) || 0)
        if (keyReachStory) maxStory = Math.max(maxStory, parseFloat(row[keyReachStory]) || 0)

        // SOLO UN BLOQUE (Eliminamos el duplicado)
        if (keyFollowers && row[keyFollowers]) {
          const cityKeys = keys.filter(k => k.includes('Seguidores de la página > Ciudad') || k.includes('Audience > City'))

          const topCities = cityKeys
            .map(k => {
              let cityName = 'Desconocida'
              if (k.includes('Other')) {
                cityName = 'Other'
              } else {
                const rawName = k.split('Ciudad - ')[1]?.split(' (')[0] || k.split('City - ')[1]?.split(' (')[0] || ''
                const parts = rawName.split(',')
                if (parts.length >= 2) {
                  cityName = `${parts[0].trim()}, ${parts[1].trim()}`
                } else {
                  cityName = rawName.trim()
                }
              }
              return { name: cityName, followers: parseFloat(row[k]) || 0 }
            })
            .filter(c => c.followers > 0)
            .sort((a, b) => {
              if (a.name === 'Other') return 1
              if (b.name === 'Other') return -1
              return b.followers - a.followers
            })

          kpisMensuales = {
            followers: parseFloat(row[keyFollowers]),
            page_engagement_rate: parseFloat(row[keyPageEngagement]),
            posts_total: parseFloat(row[keyPosts]),
            story_taps_forward: parseFloat(row[keyStoryTapsForward]),
            story_taps_back: parseFloat(row[keyStoryTapsBack]),
            story_exits: parseFloat(row[keyStoryExits]),
            post_saves: parseFloat(row[keyPostSaves]),
            post_likes: parseFloat(row[keyPostLikes]),
            topCities: topCities,
          }
        }
      })
      .on('end', () => {
        // ✨ INYECTAMOS LOS ALCANCES MÁXIMOS AL FINAL ✨
        if (kpisMensuales) {
          kpisMensuales.reach_by_type = {
            carousel: maxCarousel,
            photo: maxPhoto,
            reel: maxReel,
            story: maxStory,
          }
        }

        console.log('✅ KPIs Generales de Instagram leídos directamente del reporte de Hootsuite!')
        resolve(kpisMensuales)
      })
      .on('error', error => reject(error))
  })
}

// NUEVA FUNCIÓN DINÁMICA: Lee publicaciones de cualquier archivo que le pidas
function leerPublicacionesCSV(nombreArchivo) {
  return new Promise((resolve, reject) => {
    const postsExportados = []
    const rutaArchivo = path.join(__dirname, 'data', nombreArchivo)

    if (!fs.existsSync(rutaArchivo)) {
      console.log(`⚠️ No se encontró el archivo ${nombreArchivo} en backend/data/`)
      return resolve([])
    }

    console.log(`📊 Leyendo métricas exactas desde ${nombreArchivo}...`)

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        const mensaje = row['POST MESSAGE'] || row['Post Message'] || ''
        const tipoPost = row['POST TYPE'] || row['Post Type'] || ''

        if (mensaje || tipoPost.toUpperCase().includes('STORY')) {
          postsExportados.push({
            mensaje: mensaje,
            fecha: row['DATE (GMT)'] || row['Date (GMT)'] || '',
            alcance: parseInt(row['REACH'] || row['Reach'] || 0),
            interacciones: parseInt(row['ENGAGEMENT'] || row['Engagement'] || 0),
            visitas: parseInt(row['VIEWS'] || row['Views'] || 0),
            likes: parseInt(row['LIKES'] || row['Likes'] || 0),
            tipoPost: row['POST TYPE'] || row['Post Type'] || '',
            shares: parseInt(row['SHARES'] || row['Shares'] || 0),
            saves: parseInt(row['SAVES'] || row['Saves'] || 0),
            postPermalink: row['POST PERMALINK'] || row['Post Permalink'] || '',
            tags: row['POST TAGS'] || row['Post Tags'] || row['Etiquetas'] || '',
          })
        }
      })
      .on('end', () => {
        console.log(`✅ ${nombreArchivo} leído: ¡${postsExportados.length} posts encontrados!`)
        resolve(postsExportados)
      })
      .on('error', error => reject(error))
  })
}

// NUEVA FUNCIÓN: Calcula porcentajes de sentimiento desde la tabla de mensajes entrantes
function leerSentimientos(nombreArchivo) {
  return new Promise((resolve, reject) => {
    const rutaArchivo = path.join(__dirname, 'data', nombreArchivo)

    if (!fs.existsSync(rutaArchivo)) {
      console.log(`⚠️ No se encontró el archivo de mensajes: ${nombreArchivo}`)
      return resolve(null)
    }

    let conteo = { positive: 0, neutral: 0, negative: 0, total: 0 }

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        const keys = Object.keys(row)
        // Buscamos la columna de sentimiento sin importar mayúsculas
        const keySentiment = keys.find(k => k.toLowerCase().includes('sentiment'))

        if (keySentiment && row[keySentiment]) {
          const sentimiento = row[keySentiment].trim().toLowerCase()

          if (sentimiento === 'positive') conteo.positive++
          else if (sentimiento === 'neutral') conteo.neutral++
          else if (sentimiento === 'negative') conteo.negative++

          // Solo sumamos al total si es un sentimiento válido (ignoramos celdas vacías)
          if (['positive', 'neutral', 'negative'].includes(sentimiento)) {
            conteo.total++
          }
        }
      })
      .on('end', () => {
        // Si no hubo mensajes, regresamos ceros
        if (conteo.total === 0) {
          return resolve({ positive: 0, neutral: 0, negative: 0 })
        }

        // Calculamos los porcentajes (ej. 15.95)
        const porcentajes = {
          positive: parseFloat(((conteo.positive / conteo.total) * 100).toFixed(2)),
          neutral: parseFloat(((conteo.neutral / conteo.total) * 100).toFixed(2)),
          negative: parseFloat(((conteo.negative / conteo.total) * 100).toFixed(2)),
        }

        console.log(`✅ Sentimientos analizados: ${conteo.total} mensajes leídos de ${nombreArchivo}`)
        resolve(porcentajes)
      })
      .on('error', error => reject(error))
  })
}

// NUEVA FUNCIÓN GENÉRICA: Analiza Alcance por Tags (Funciona para FB e IG)
// NUEVA VERSIÓN: Guarda cada post por fecha para dibujar una línea de tiempo
function leerAlcancePorTags(nombreArchivo) {
  return new Promise((resolve, reject) => {
    const rutaArchivo = path.join(__dirname, 'data', nombreArchivo)

    if (!fs.existsSync(rutaArchivo)) {
      console.log(`⚠️ No se encontró ${nombreArchivo} para análisis de Tags.`)
      return resolve([])
    }

    // Estructura: { 'Educativo': [ { date: '2026-02-01', reach: 500 }, ... ] }
    const tagMap = {}

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        const keys = Object.keys(row)

        const keyTags = keys.find(k => k.toLowerCase().includes('post tags') || k.toLowerCase().includes('etiquetas'))
        const keyReach = keys.find(k => k.toLowerCase().includes('reach') || k.toLowerCase().includes('alcance'))
        const keyDate = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('fecha'))

        if (keyTags && row[keyTags] && keyReach && row[keyReach]) {
          const rawTags = row[keyTags]
          const reachVal = parseInt(row[keyReach]) || 0
          // Extraemos solo la fecha (YYYY-MM-DD) ignorando la hora
          const dateVal = keyDate && row[keyDate] ? row[keyDate].split(' ')[0] : 'Desconocida'

          const tagsArray = rawTags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== '')

          tagsArray.forEach(tag => {
            if (!tagMap[tag]) {
              tagMap[tag] = [] // Creamos el arreglo vacío para esta etiqueta
            }
            // Guardamos el punto en la línea de tiempo
            tagMap[tag].push({ date: dateVal, reach: reachVal })
          })
        }
      })
      .on('end', () => {
        // Formateamos el resultado
        const tagResults = Object.keys(tagMap)
          .map(tagName => {
            return {
              name: tagName,
              posts: tagMap[tagName].sort((a, b) => new Date(a.date) - new Date(b.date)), // Ordenamos cronológicamente
            }
          })
          // Ordenamos las etiquetas por alcance total para que la más fuerte salga primero en la leyenda
          .sort((a, b) => {
            const totalA = a.posts.reduce((sum, p) => sum + p.reach, 0)
            const totalB = b.posts.reduce((sum, p) => sum + p.reach, 0)
            return totalB - totalA
          })

        console.log(`✅ Evolución de Tags analizada en ${nombreArchivo}`)
        resolve(tagResults)
      })
      .on('error', error => reject(error))
  })
}

// Asegúrate de exportar el nuevo nombre de la función:
module.exports = { leerPublicacionesCSV, leerKpisGenerales, leerKpisFacebookHootsuite, leerKpisInstagramHootsuite, leerSentimientos, leerAlcancePorTags }
