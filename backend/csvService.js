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

// Lee hootsuite_publicaciones_fb.csv para obtener métricas exactas de cada post
// function leerMetricasCSV() {
//   return new Promise((resolve, reject) => {
//     const postsExportados = []
//     // Apuntamos al archivo que acabas de guardar
//     // const rutaArchivo = path.join(__dirname, 'data', 'hootsuite_export.csv')
//     const rutaArchivo = path.join(__dirname, 'data', 'hootsuite_publicaciones_fb.csv')

//     if (!fs.existsSync(rutaArchivo)) {
//       console.log('⚠️ No se encontró el archivo hootsuite_publicaciones_fb.csv en backend/data/')
//       return resolve([])
//     }

//     console.log('📊 Leyendo métricas exactas desde el CSV de Hootsuite...')

//     fs.createReadStream(rutaArchivo)
//       .pipe(csv())
//       .on('data', row => {
//         // Filtramos para guardar solo lo que nos importa
//         // Nota: Verificamos los nombres de columnas en mayúscula o minúscula
//         const mensaje = row['POST MESSAGE'] || row['Post Message'] || ''
//         if (mensaje) {
//           postsExportados.push({
//             mensaje: mensaje,
//             fecha: row['DATE (GMT)'] || row['Date (GMT)'] || '',
//             alcance: parseInt(row['REACH'] || row['Reach'] || 0),
//             interacciones: parseInt(row['ENGAGEMENT'] || row['Engagement'] || 0),
//             visitas: parseInt(row['POST VIEWS'] || row['Post views'] || 0),
//             tipoPost: row['POST TYPE'] || row['Post Type'] || '',
//             shares: parseInt(row['SHARES'] || row['Shares'] || 0),
//             postPermalink: row['POST PERMALINK'] || row['Post Permalink'] || '',
//           })
//         }
//       })
//       .on('end', () => {
//         console.log(`✅ CSV leído: ¡Se encontraron ${postsExportados.length} posts con sus métricas!`)
//         resolve(postsExportados)
//       })
//       .on('error', error => reject(error))
//   })
// }

// Leehootsuite_metricas_fb.csv para obtener KPIs generales de Facebook (seguidores, clics, shares, etc.) y también las ciudades top
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

// Lee hootsuite_publicaciones_ig.csv para obtener métricas exactas de cada post
// function leerMetricasIgCSV() {
//   return new Promise((resolve, reject) => {
//     const postsExportados = []
//     // Apuntamos al archivo que acabas de guardar
//     // const rutaArchivo = path.join(__dirname, 'data', 'hootsuite_export.csv')
//     const rutaArchivo = path.join(__dirname, 'data', 'hootsuite_publicaciones_ig.csv')

//     if (!fs.existsSync(rutaArchivo)) {
//       console.log('⚠️ No se encontró el archivo hootsuite_publicaciones_ig.csv en backend/data/')
//       return resolve([])
//     }

//     console.log('📊 Leyendo métricas exactas desde el CSV de Hootsuite...')

//     fs.createReadStream(rutaArchivo)
//       .pipe(csv())
//       .on('data', row => {
//         // Filtramos para guardar solo lo que nos importa
//         // Nota: Verificamos los nombres de columnas en mayúscula o minúscula
//         const mensaje = row['POST MESSAGE'] || row['Post Message'] || ''
//         if (mensaje) {
//           postsExportados.push({
//             mensaje: mensaje,
//             fecha: row['DATE (GMT)'] || row['Date (GMT)'] || '',
//             alcance: parseInt(row['REACH'] || row['Reach'] || 0),
//             interacciones: parseInt(row['ENGAGEMENT'] || row['Engagement'] || 0),
//             visitas: parseInt(row['VIEWS'] || row['Views'] || 0),
//             tipoPost: row['POST TYPE'] || row['Post Type'] || '',
//             shares: parseInt(row['SHARES'] || row['Shares'] || 0),
//             postPermalink: row['POST PERMALINK'] || row['Post Permalink'] || '',
//           })
//         }
//       })
//       .on('end', () => {
//         console.log(`✅ CSV leído: ¡Se encontraron ${postsExportados.length} posts con sus métricas!`)
//         resolve(postsExportados)
//       })
//       .on('error', error => reject(error))
//   })
// }

// hootsuite_metricas_ig.csv para obtener KPIs generales de Facebook (seguidores, clics, shares, etc.) y también las ciudades top
function leerKpisInstagramHootsuite() {
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

        const keyReach = keys.find(k => k.includes('Alcance orgánico'))
        const keyClics = keys.find(k => k.includes('Post link clicks'))
        const keyComments = keys.find(k => k.includes('Comentarios y respuestas'))
        const keyImpressions = keys.find(k => k.includes('Impresiones orgánicas'))
        const keyTimeVisualization = keys.find(k => k.includes('Tiempo de visualización'))
        const keyPageOrganicReach = keys.find(k => k.includes('Alcance orgánico de la página'))
        const keyNoFollowersViews = keys.find(k => k.includes('Vistas de página de no seguidores'))
        const keyFollowersViews = keys.find(k => k.includes('Visualizaciones de seguidores'))

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

            reach: parseFloat(row[keyReach]),
            post_impressions: parseFloat(row[keyImpressions]),
            clics: parseFloat(row[keyClics]),
            comments: parseFloat(row[keyComments]),
            time_visualization: row[keyTimeVisualization],
            page_organic_reach: parseFloat(row[keyPageOrganicReach]),
            page_no_followers_views: parseFloat(row[keyNoFollowersViews]),
            page_followers_views: parseFloat(row[keyFollowersViews]),
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

// Asegúrate de exportar el nuevo nombre de la función:
module.exports = { leerPublicacionesCSV, leerKpisGenerales, leerKpisFacebookHootsuite, leerKpisInstagramHootsuite }

// module.exports = { leerMetricasCSV, leerKpisGenerales, leerKpisFacebookHootsuite, leerMetricasIgCSV, leerKpisInstagramHootsuite }
