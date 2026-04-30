const { pool } = require('../utils/db')
const { getSocialMetrics } = require('../hootsuiteService')
// 🚀 ¡Adiós csvService.js! Ya no lo necesitamos.

// 🛠️ Función auxiliar para agrupar sentimientos de MySQL
const formatSentiment = rows => {
  const result = { positive: 0, neutral: 0, negative: 0, total: 0 }
  rows.forEach(r => {
    if (r.sentimiento === 'positive') result.positive = r.cantidad
    if (r.sentimiento === 'neutral') result.neutral = r.cantidad
    if (r.sentimiento === 'negative') result.negative = r.cantidad
    result.total += r.cantidad
  })
  if (result.total === 0) return { positive: 0, neutral: 0, negative: 0 }
  return {
    positive: parseFloat(((result.positive / result.total) * 100).toFixed(2)),
    neutral: parseFloat(((result.neutral / result.total) * 100).toFixed(2)),
    negative: parseFloat(((result.negative / result.total) * 100).toFixed(2)),
  }
}

// 🛠️ Función auxiliar para calcular Tags al vuelo desde MySQL
const calculateTags = posts => {
  const tagMap = {}
  posts.forEach(post => {
    const rawTags = post.tags || ''
    const tagsArray = rawTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '')
    const metricVal = post.visitas > 0 ? post.visitas : post.alcance

    if (metricVal > 0 && tagsArray.length > 0) {
      const dateVal = post.fecha ? new Date(post.fecha).toISOString().split('T')[0] : 'Desconocida'
      tagsArray.forEach(tag => {
        if (!tagMap[tag]) tagMap[tag] = []
        tagMap[tag].push({ date: dateVal, views: metricVal })
      })
    }
  })

  return Object.keys(tagMap)
    .map(name => ({
      name,
      posts: tagMap[name].sort((a, b) => new Date(a.date) - new Date(b.date)),
    }))
    .sort((a, b) => b.posts.reduce((s, p) => s + p.views, 0) - a.posts.reduce((s, p) => s + p.views, 0))
}

const getReportData = async (req, res) => {
  const { periodId } = req.params

  try {
    console.log(`Initiating MySQL data fetch for period: ${periodId}...`)

    // 1. DATA FETCHING (Consultas concurrentes a MySQL)
    const promises = [
      pool.query('SELECT * FROM fb_posts_metrics WHERE periodo = ? ORDER BY visitas DESC', [periodId]), // 0
      pool.query('SELECT * FROM ig_posts_metrics WHERE periodo = ? ORDER BY visitas DESC', [periodId]), // 1
      pool.query('SELECT * FROM network_kpis WHERE periodo = ? AND red_social = ?', [periodId, 'fb']), // 2
      pool.query('SELECT * FROM network_kpis WHERE periodo = ? AND red_social = ?', [periodId, 'ig']), // 3
      pool.query('SELECT * FROM historical_followers WHERE periodo = ? AND red_social = ? ORDER BY fecha ASC', [periodId, 'fb']), // 4
      pool.query('SELECT * FROM historical_followers WHERE periodo = ? AND red_social = ? ORDER BY fecha ASC', [periodId, 'ig']), // 5
      pool.query('SELECT * FROM top_cities WHERE periodo = ? AND red_social = ? ORDER BY followers DESC', [periodId, 'fb']), // 6
      pool.query('SELECT * FROM top_cities WHERE periodo = ? AND red_social = ? ORDER BY followers DESC', [periodId, 'ig']), // 7
      pool.query('SELECT * FROM inbound_sentiment WHERE periodo = ? AND red_social = ?', [periodId, 'fb']), // 8
      pool.query('SELECT * FROM inbound_sentiment WHERE periodo = ? AND red_social = ?', [periodId, 'ig']), // 9
      pool.query('SELECT * FROM benchmark_competitors WHERE periodo = ? ORDER BY is_main_brand DESC, followers DESC', [periodId]), // 10
      pool.query('SELECT post_id, image_url FROM post_images'), // 11
      getSocialMetrics(), // 12. Hootsuite API (Nombres y Avatares en vivo)
    ]

    const results = await Promise.allSettled(promises)
    const getSafeValue = (index, defaultValue) => (results[index].status === 'fulfilled' ? results[index].value : defaultValue)

    // Extraemos resultados (Los arrays de MySQL vienen dentro de otro array `[rows, fields]`)
    const fbPostsRaw = getSafeValue(0, [[]])[0]
    const igPostsRaw = getSafeValue(1, [[]])[0]
    const fbOverview = getSafeValue(2, [[{}]])[0][0] || {}
    const igOverview = getSafeValue(3, [[{}]])[0][0] || {}
    const fbHistory = getSafeValue(4, [[]])[0].map(h => ({
      date: h.fecha ? new Date(h.fecha).toISOString().split('T')[0] : null,
      followers: h.followers,
    }))
    const igHistory = getSafeValue(5, [[]])[0].map(h => ({
      date: h.fecha ? new Date(h.fecha).toISOString().split('T')[0] : null,
      followers: h.followers,
    }))
    const fbCities = getSafeValue(6, [[]])[0].map(c => ({ name: c.city_name, followers: c.followers }))
    const igCities = getSafeValue(7, [[]])[0].map(c => ({ name: c.city_name, followers: c.followers }))
    const fbSent = formatSentiment(getSafeValue(8, [[]])[0])
    const igSent = formatSentiment(getSafeValue(9, [[]])[0])
    const dbCompetitors = getSafeValue(10, [[]])[0]
    const dbImages = getSafeValue(11, [[]])[0]
    const hootsuiteData = getSafeValue(12, null)

    // 2. DATA FORMATTING
    // Mapeamos lo que viene de BD a lo que el Frontend espera
    const mapPost = (p, red) => {
      let tipo = p.tipo_post ? p.tipo_post.toUpperCase() : 'POST'
      const customImg = dbImages.find(img => img.post_id === p.id)

      let defaultImg = red === 'fb' ? 'https://placehold.co/300x400/00eb5d/ffffff?text=Post+Sin+Imagen' : 'https://placehold.co/300x400/ff7375/ffffff?text=IG+Sin+Imagen'
      if (tipo.includes('STORY')) defaultImg = 'https://placehold.co/300x400/17ccf9/ffffff?text=IG+Story'

      return {
        id: p.id,
        link: p.permalink,
        type: tipo.includes('STORY') ? 'STORY' : tipo,
        views: p.visitas,
        reach: p.alcance,
        interactions: p.interacciones,
        saved: red === 'fb' ? p.shares : p.saves || 0,
        likes: p.likes,
        shares: p.shares,
        picture: customImg ? customImg.image_url : defaultImg,
        img: customImg ? customImg.image_url : defaultImg,
        postPermalink: p.permalink,
        text: p.mensaje ? p.mensaje.substring(0, 60) + '...' : 'Sin texto',
        date: p.fecha ? new Date(p.fecha).toISOString().split('T')[0] : 'Sin fecha',
        tags: p.tags || 'Sin etiqueta',
      }
    }

    const finalTopPostsFb = fbPostsRaw.map(p => mapPost(p, 'fb'))
    const allIg = igPostsRaw.map(p => mapPost(p, 'ig'))
    const finalTopPostsIg = allIg.filter(p => !p.type.includes('STORY'))
    const topStoriesIg = allIg.filter(p => p.type.includes('STORY'))

    const trendPostsFb = finalTopPostsFb.filter(post => post.tags.toLowerCase().includes('#trend') || post.tags.toLowerCase().includes('#treend'))
    const trendPostsIg = finalTopPostsIg.filter(post => post.tags.toLowerCase().includes('#trend') || post.tags.toLowerCase().includes('#treend'))

    const fbTags = calculateTags(fbPostsRaw)
    const igTags = calculateTags(igPostsRaw)

    // CÁLCULO DE MES (Nombre legible)
    let mesDinamico = periodId
    if (periodId) {
      const [year, month] = periodId.split('-')
      const dateObj = new Date(year, month - 1, 1)
      const formateador = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric' })
      const fechaFormateada = formateador.format(dateObj)
      mesDinamico = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
    }

    // 3. REPORT ASSEMBLY
    const fullReport = {
      metadata: { client: 'Pluxee', title: 'SOCIAL MEDIA REPORT', period: mesDinamico, agency: 'TOLKO' },
      facebook: {
        username: hootsuiteData?.facebook?.username || 'Pluxee FB',
        kpis: {
          month: mesDinamico,
          interactions: fbOverview.fb_interactions || 0,
          total_followers: fbOverview.total_followers || 0,
          new_followers: fbOverview.new_followers || 0,
          clics: fbOverview.fb_clics || 0,
          shares: fbOverview.fb_shares || 0,
          responding: fbOverview.fb_comments || 0,
          post_engagement_rate: fbOverview.engagement_rate ? `${fbOverview.engagement_rate}%` : '0%',
          post_impressions: fbOverview.fb_post_impressions || 0,
          response_time: fbOverview.fb_time_visualization || '0',
          page_organic_reach: fbOverview.fb_page_organic_reach || 0,
          page_no_followers_views: fbOverview.fb_page_no_followers_views || 0,
          page_followers_views: fbOverview.fb_page_followers_views || 0,
          reach: fbOverview.fb_page_organic_reach || 0,
          sentiment: fbSent,
          historicalFollowers: fbHistory,
        },
        topCities: fbCities,
        topPosts: finalTopPostsFb,
        trendPosts: trendPostsFb,
        reachByTags: fbTags,
      },
      instagram: {
        username: hootsuiteData?.instagram?.username || 'Pluxee IG',
        kpis: {
          total_followers: igOverview.total_followers || 0,
          page_engagement_rate: igOverview.engagement_rate ? `${igOverview.engagement_rate}%` : '0%',
          post_saves: igOverview.ig_post_saves || 0,
          post_likes: igOverview.ig_post_likes || 0,
          stories_metrics: {
            total: topStoriesIg.length || 0,
            forward: igOverview.ig_story_taps_forward || 0,
            back: igOverview.ig_story_taps_back || 0,
            exit: igOverview.ig_story_exits || 0,
          },
          reach_by_type: { carousel: igOverview.ig_reach_carousel || 0, photo: igOverview.ig_reach_photo || 0, reel: igOverview.ig_reach_reel || 0, story: igOverview.ig_reach_story || 0 },
          sentiment: igSent,
          historicalFollowers: igHistory,
        },
        topCities: igCities,
        topPosts: finalTopPostsIg,
        topStories: topStoriesIg,
        trendPosts: trendPostsIg,
        reachByTags: igTags,
      },
      benchmarking: dbCompetitors,
      // El frontend (ReportView) carga context, quejas, conclusiones y propuestas por su cuenta
    }

    console.log(`✅ Data for ${periodId} successfully assembled from MySQL!`)
    res.json(fullReport)
  } catch (error) {
    console.error('Error FATAL assembling the final report:', error)
    res.status(500).json({ error: 'Error interno procesando el reporte' })
  }
}

// BORRAR TODA LA INFO DE UN MES (BOTÓN DE PÁNICO)
const resetPeriod = async (req, res) => {
  const { periodId } = req.params
  if (!periodId) return res.status(400).json({ error: 'Periodo requerido' })

  const tablasABorrar = [
    'fb_posts_metrics',
    'ig_posts_metrics',
    'network_kpis',
    'historical_followers',
    'top_cities',
    'inbound_sentiment',
    'benchmark_competitors',
    'benchmark_insights',
    'casos_cs',
    'quejas_rrss',
    'metricas_globales',
    'contexto_rrss',
    'propuestas',
    'compromisos',
    'conclusiones',
  ]

  try {
    // 1. Borramos todas las tablas que tienen la columna "periodo"
    const promises = tablasABorrar.map(tabla => pool.query(`DELETE FROM ${tabla} WHERE periodo = ?`, [periodId]))

    // 🚀 2. Borramos específicamente la imagen de portada de este mes en la tabla post_images
    promises.push(pool.query(`DELETE FROM post_images WHERE post_id = ?`, [`fb_cover_${periodId}`]))

    // Ejecutamos todos los deletes en paralelo a la velocidad de la luz
    await Promise.allSettled(promises)

    res.json({ message: `Toda la información de ${periodId} y su portada han sido eliminadas.` })
  } catch (error) {
    console.error('Error al hacer reset del periodo:', error)
    res.status(500).json({ error: 'Error interno al limpiar la base de datos.' })
  }
}

module.exports = { getReportData, resetPeriod }
