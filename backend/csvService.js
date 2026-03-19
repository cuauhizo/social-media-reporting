const fs = require('fs')
const path = require('path')
const csv = require('csv-parser')

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

function leerMetricasCSV() {
  return new Promise((resolve, reject) => {
    const postsExportados = []
    // Apuntamos al archivo que acabas de guardar
    // const rutaArchivo = path.join(__dirname, 'data', 'hootsuite_export.csv')
    const rutaArchivo = path.join(__dirname, 'data', 'hootsuite_publicaciones_fb.csv')

    if (!fs.existsSync(rutaArchivo)) {
      console.log('⚠️ No se encontró el archivo hootsuite_publicaciones_fb.csv en backend/data/')
      return resolve([])
    }

    console.log('📊 Leyendo métricas exactas desde el CSV de Hootsuite...')

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', row => {
        // Filtramos para guardar solo lo que nos importa
        // Nota: Verificamos los nombres de columnas en mayúscula o minúscula
        const mensaje = row['POST MESSAGE'] || row['Post Message'] || ''
        if (mensaje) {
          postsExportados.push({
            mensaje: mensaje,
            fecha: row['DATE (GMT)'] || row['Date (GMT)'] || '',
            alcance: parseInt(row['REACH'] || row['Reach'] || 0),
            interacciones: parseInt(row['ENGAGEMENT'] || row['Engagement'] || 0),
            visitas: parseInt(row['POST VIEWS'] || row['Post views'] || 0),
            tipoPost: row['POST TYPE'] || row['Post Type'] || '',
            shares: parseInt(row['SHARES'] || row['Shares'] || 0),
            postPermalink: row['POST PERMALINK'] || row['Post Permalink'] || '',
          })
        }
      })
      .on('end', () => {
        console.log(`✅ CSV leído: ¡Se encontraron ${postsExportados.length} posts con sus métricas!`)
        resolve(postsExportados)
      })
      .on('error', error => reject(error))
  })
}

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
          kpisMensuales = {
            followers: parseFloat(row[keyFollowers]),
            reach: parseFloat(row[keyReach]),
            post_impressions: parseFloat(row[keyImpressions]),
            // Si el engagement viene como 7.51, lo dejamos así
            post_engagement_rate: parseFloat(row[keyEngagement]),
            clics: parseFloat(row[keyClics]),
            shares: parseFloat(row[keyShares]),
            comments: parseFloat(row[keyComments]),
            // time_visualization: parseFloat(row[keyTimeVisualization]),
            time_visualization: row[keyTimeVisualization],
            page_organic_reach: parseFloat(row[keyPageOrganicReach]),
            page_no_followers_views: parseFloat(row[keyNoFollowersViews]),
            page_followers_views: parseFloat(row[keyFollowersViews]),
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

module.exports = { leerMetricasCSV, leerKpisGenerales, leerKpisFacebookHootsuite }
