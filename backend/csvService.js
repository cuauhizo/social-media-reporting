const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')

// Lee 00_global_manual_data.csv para obtener KPIs generales y textos dinámicos
function leerKpisGenerales() {
  return new Promise((resolve, reject) => {
    const kpis = {}
    const rutaArchivo = path.join(__dirname, 'data', '00_global_manual_data.csv')

    if (!fs.existsSync(rutaArchivo)) {
      console.log('⚠️ No se encontró 00_global_manual_data.csv. Usando datos por defecto.')
      return resolve({})
    }

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        // Definimos qué llaves deben comportarse como "Listas" (pueden venir varias veces)
        const clavesLista = ['insight', 'complaint', 'proposal', 'commitment', 'benchmark_insight']

        if (clavesLista.includes(row.kpi)) {
          // Si es un texto de lista, lo empujamos a un arreglo
          if (!kpis[row.kpi]) kpis[row.kpi] = []
          kpis[row.kpi].push(row.valor)
        } else {
          // Si es un valor único (ej. cs_total), lo guardamos normal
          kpis[row.kpi] = row.valor
        }
      })
      .on('end', () => {
        console.log('✅ KPIs Generales y Textos dinámicos leídos con éxito.')
        resolve(kpis)
      })
      .on('error', error => reject(error))
  })
}

// Lee 01_fb_overview_kpis.csv para obtener KPIs generales de Facebook (seguidores, clics, shares, etc.) y también las ciudades top
function leerKpisFacebookHootsuite_old() {
  return new Promise((resolve, reject) => {
    // Asegúrate de que el archivo se llame así en tu carpeta data/
    const rutaArchivo = path.join(__dirname, 'data', '01_fb_overview_kpis.csv')

    if (!fs.existsSync(rutaArchivo)) {
      console.log('⚠️ No se encontró 01_fb_overview_kpis.csv. Usando respaldo.')
      return resolve(null)
    }

    let kpisMensuales = null

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        const keys = Object.keys(row)

        // Buscamos los nombres de las columnas reales usando palabras clave
        const keyInteractions = keys.find(k => k.includes('Interacciones de la página'))
        const keyTotalFollowers = keys.find(k => k.includes('Total followers'))
        const keyNewFollowers = keys.find(k => k.includes('Nuevos seguidores'))
        // const keyPublications = keys.find(k => k.includes('Publications'))
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
        const keyFollowersForTable = keys.find(k => k.includes('Seguidores (This column might contain'))
        // Seguidores (This column might contain

        // Solo guardamos si la fila tiene datos (ignoramos los días vacíos)
        if (keyTotalFollowers && row[keyTotalFollowers]) {
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
            total_followers: parseFloat(row[keyTotalFollowers]),
            new_followers: parseFloat(row[keyNewFollowers]),
            // publications: parseFloat(row[keyPublications]),
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
            tableFollowers: parseFloat(row[keyFollowersForTable]) || 0,
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

// Lee 01_fb_overview_kpis.csv para obtener KPIs generales de Facebook y también las ciudades top
function leerKpisFacebookHootsuite_old2() {
  let kpisMensuales = null
  const historicalFollowers = [] // Se inicializa como arreglo vacío

  return new Promise((resolve, reject) => {
    // Asegúrate de que el archivo se llame así en tu carpeta data/
    const rutaArchivo = path.join(__dirname, 'data', '01_fb_overview_kpis.csv')

    if (!fs.existsSync(rutaArchivo)) {
      console.log('⚠️ No se encontró 01_fb_overview_kpis.csv. Usando respaldo.')
      return resolve(null)
    }

    let kpisMensuales = null
    // ✨ NUEVO: Arreglo para guardar el crecimiento día por día
    const historicalFollowers = []

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        const keys = Object.keys(row)

        const keyDate = keys.find(k => k.toLowerCase().includes('Date (GMT)'))
        const keyInteractions = keys.find(k => k.includes('Interacciones de la página'))
        const keyTotalFollowers = keys.find(k => k.includes('Total followers'))
        const keyNewFollowers = keys.find(k => k.includes('Nuevos seguidores'))
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
        const keyFollowersForTable = keys.find(k => k.includes('Seguidores (This column might contain'))
        const datoSeguidoresDiarios = row[keyTotalFollowers]

        // ✨ NUEVO: Si hay una fecha y datos de seguidores, lo empujamos al arreglo histórico
        if (keyDate && row[keyDate] && datoSeguidoresDiarios) {
          if (!row[keyDate].toLowerCase().includes('total')) {
            historicalFollowers.push({
              date: row[keyDate],
              followers: parseInt(datoSeguidoresDiarios) || 0,
            })
          }
        }

        // Solo guardamos si la fila tiene datos (ignoramos los días vacíos)
        if (keyTotalFollowers && row[keyTotalFollowers]) {
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
              if (a.name === 'Other') return 1
              if (b.name === 'Other') return -1
              return b.followers - a.followers
            })

          // Asignamos las métricas generales (Esto se sobrescribirá fila por fila,
          // quedando con los datos de la última fila válida, que en Hootsuite suele ser el resumen total del mes)
          kpisMensuales = {
            interactions: parseFloat(row[keyInteractions]),
            total_followers: parseFloat(row[keyTotalFollowers]),
            new_followers: parseFloat(row[keyNewFollowers]),
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
            tableFollowers: followers,
          }
        }
      })
      .on('end', () => {
        console.log('✅ KPIs Generales de Facebook leídos directamente del reporte de Hootsuite!')

        if (kpisMensuales) {
          // Si no se encontró nada en el CSV, historicalFollowers seguirá siendo []
          kpisMensuales.historicalFollowers = historicalFollowers
        }
        resolve(kpisMensuales)
      })
      .on('error', error => reject(error))
  })
}

// Lee 01_fb_overview_kpis.csv para obtener KPIs generales de Facebook y también las ciudades top
function leerKpisFacebookHootsuite() {
  return new Promise((resolve, reject) => {
    const rutaArchivo = path.join(__dirname, 'data', '01_fb_overview_kpis.csv')

    if (!fs.existsSync(rutaArchivo)) {
      console.log('⚠️ No se encontró 01_fb_overview_kpis.csv. Usando respaldo.')
      return resolve(null)
    }

    let kpisMensuales = null
    const historicalFollowers = []

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        const keys = Object.keys(row)

        const keyDate = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('fecha') || k.toLowerCase().includes('día'))

        const keyInteractions = keys.find(k => k.includes('Interacciones de la página'))
        const keyTotalFollowers = keys.find(k => k.includes('Total followers'))
        const keyFollowersForTable = keys.find(k => k.includes('Seguidores (This column might contain'))
        const keyNewFollowers = keys.find(k => k.includes('Nuevos seguidores'))
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

        // 1. CAPTURAR EL HISTÓRICO DIARIO
        if (keyDate && row[keyDate]) {
          if (!row[keyDate].toLowerCase().includes('total')) {
            // Hootsuite es tramposo: buscamos el dato en la columna principal, y si no, en la secundaria
            let dailyFollowers = parseInt(row[keyTotalFollowers]) || parseInt(row[keyFollowersForTable]) || 0

            if (dailyFollowers > 0) {
              historicalFollowers.push({
                date: row[keyDate],
                followers: dailyFollowers,
              })
            }
          }
        }

        // 2. CAPTURAR EL RESUMEN TOTAL Y CIUDADES
        // Hootsuite pone los totales en la última fila válida o donde vienen las interacciones
        if (keyInteractions && row[keyInteractions] && keyTotalFollowers && row[keyTotalFollowers]) {
          const cityKeys = keys.filter(k => k.includes('Seguidores de la página > Ciudad'))
          const topCities = cityKeys
            .map(k => {
              let cityName = 'Desconocida'
              if (k.includes('Other')) {
                cityName = 'Other'
              } else {
                const rawName = k.split('Ciudad - ')[1]?.split(' (')[0] || ''
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
            interactions: parseFloat(row[keyInteractions]),
            total_followers: parseFloat(row[keyTotalFollowers]),
            new_followers: parseFloat(row[keyNewFollowers]),
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
            tableFollowers: parseFloat(row[keyFollowersForTable]) || 0,
          }
        }
      })
      .on('end', () => {
        console.log('✅ KPIs Generales de Facebook leídos directamente del reporte de Hootsuite!')

        // ✨ Le inyectamos el histórico de seguidores a nuestro objeto de KPIs
        if (kpisMensuales) {
          kpisMensuales.historicalFollowers = historicalFollowers
        }

        resolve(kpisMensuales)
      })
      .on('error', error => reject(error))
  })
}

// 02_ig_overview_kpis.csv para obtener KPIs generales de IG y las ciudades top
function leerKpisInstagramHootsuite() {
  return new Promise((resolve, reject) => {
    const rutaArchivo = path.join(__dirname, 'data', '02_ig_overview_kpis.csv')

    if (!fs.existsSync(rutaArchivo)) {
      console.log('⚠️ No se encontró 02_ig_overview_kpis.csv. Usando respaldo.')
      return resolve(null)
    }

    let kpisMensuales = null

    // CAJAS FUERTES: Para no perder los datos si la última fila está vacía
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

        // ATRAPAMOS EL VALOR MÁS ALTO DEL MES
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
        // INYECTAMOS LOS ALCANCES MÁXIMOS AL FINAL
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
            visitas: parseInt(row['POST VIEWS'] || row['Post views'] || row['Views'] || row['views'] || 0),
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
// NUEVA FUNCIÓN: Analiza Rendimiento por Tags (A prueba de fotos vs videos)
function leerAlcancePorTags(nombreArchivo) {
  return new Promise((resolve, reject) => {
    const rutaArchivo = path.join(__dirname, 'data', nombreArchivo)

    if (!fs.existsSync(rutaArchivo)) {
      console.log(`⚠️ No se encontró ${nombreArchivo} para análisis de Tags.`)
      return resolve([])
    }

    const tagMap = {}

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        const keys = Object.keys(row)

        const keyTags = keys.find(k => k.toLowerCase().includes('post tags') || k.toLowerCase().includes('etiquetas'))
        const keyViews = keys.find(k => k.toLowerCase().includes('views') || k.toLowerCase().includes('visitas') || k.toLowerCase().includes('impresiones'))
        const keyReach = keys.find(k => k.toLowerCase().includes('reach') || k.toLowerCase().includes('alcance'))
        const keyDate = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('fecha'))

        if (keyTags && row[keyTags]) {
          const rawTags = row[keyTags]
          const dateVal = keyDate && row[keyDate] ? row[keyDate].split(' ')[0] : 'Desconocida'

          // LEEMOS AMBAS CELDAS (Vistas y Alcance) DE FORMA INDEPENDIENTE
          const vistas = keyViews ? parseInt(row[keyViews]) || 0 : 0
          const alcance = keyReach ? parseInt(row[keyReach]) || 0 : 0

          // Lógica inteligente: Si Vistas es 0 (ej. porque es una foto), usamos su Alcance.
          const metricVal = vistas > 0 ? vistas : alcance

          // Solo guardamos si realmente tuvo algún impacto
          if (metricVal > 0) {
            const tagsArray = rawTags
              .split(',')
              .map(tag => tag.trim())
              .filter(tag => tag !== '')

            tagsArray.forEach(tag => {
              if (!tagMap[tag]) {
                tagMap[tag] = []
              }
              tagMap[tag].push({ date: dateVal, views: metricVal })
            })
          }
        }
      })
      .on('end', () => {
        const tagResults = Object.keys(tagMap)
          .map(tagName => {
            return {
              name: tagName,
              posts: tagMap[tagName].sort((a, b) => new Date(a.date) - new Date(b.date)),
            }
          })
          .sort((a, b) => {
            const totalA = a.posts.reduce((sum, p) => sum + p.views, 0)
            const totalB = b.posts.reduce((sum, p) => sum + p.views, 0)
            return totalB - totalA
          })

        console.log(`✅ Evolución de Tags analizada correctamente en ${nombreArchivo}`)
        resolve(tagResults)
      })
      .on('error', error => reject(error))
  })
}

// Asegúrate de exportar el nuevo nombre de la función:
module.exports = { leerPublicacionesCSV, leerKpisGenerales, leerKpisFacebookHootsuite, leerKpisInstagramHootsuite, leerSentimientos, leerAlcancePorTags }
