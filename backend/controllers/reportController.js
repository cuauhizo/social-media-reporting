const { getSocialMetrics } = require('../hootsuiteService')
const { leerPublicacionesCSV, leerKpisGenerales, leerKpisFacebookHootsuite, leerKpisInstagramHootsuite, leerSentimientos, leerAlcancePorTags } = require('../csvService')
const { formatFacebookPosts, formatInstagramPosts, formatCasData } = require('../utils/formatters')
const { pool } = require('../utils/db')

const getReportData = async (req, res) => {
  try {
    console.log('Initiating data fusion...')

    // 1. DATA FETCHING (Dinamizado por periodo)
    const { periodId } = req.params // Viene de la URL /api/reports/2026-03

    const promises = [
      leerPublicacionesCSV(`${periodId}_01_fb_posts_metrics.csv`), // 👈 Prefijo dinámico
      leerPublicacionesCSV(`${periodId}_02_ig_posts_metrics.csv`),
      getSocialMetrics(),
      leerKpisGenerales(), // Nota: los manuales podrían seguir siendo globales o también por periodo
      leerKpisFacebookHootsuite(`${periodId}_01_fb_overview_kpis.csv`), // 👈 Actualizar función en csvService
      leerKpisInstagramHootsuite(`${periodId}_02_ig_overview_kpis.csv`),
      leerSentimientos(`${periodId}_01_fb_inbound_sentiment.csv`),
      leerSentimientos(`${periodId}_02_ig_inbound_sentiment.csv`),
      leerAlcancePorTags(`${periodId}_01_fb_posts_metrics.csv`),
      leerAlcancePorTags(`${periodId}_02_ig_posts_metrics.csv`),
      pool.query('SELECT * FROM benchmark_competitors WHERE periodo = ? ORDER BY is_main_brand DESC, followers DESC', [periodId]), // 👈 Filtro SQL
    ]

    // Ejecutamos todo al mismo tiempo. Si algo falla, NO rompe la ejecución.
    const results = await Promise.allSettled(promises)

    // Función auxiliar para extraer el valor seguro (Si falla, devuelve el valor por defecto)
    const getSafeValue = (index, defaultValue) => (results[index].status === 'fulfilled' ? results[index].value : defaultValue)

    // Extraemos los resultados
    const fbPostsRaw = getSafeValue(0, [])
    const igPostsRaw = getSafeValue(1, [])
    const hootsuiteData = getSafeValue(2, null)
    const manualKpis = getSafeValue(3, {})
    const fbRealKpis = getSafeValue(4, {})
    const igRealKpis = getSafeValue(5, {})
    const fbSentiment = getSafeValue(6, { neutral: 0, positive: 0, negative: 0 })
    const igSentiment = getSafeValue(7, { neutral: 0, positive: 0, negative: 0 })
    const fbTags = getSafeValue(8, [])
    const igTags = getSafeValue(9, [])
    const dbCompetitors = getSafeValue(10, [[]]) // MySQL devuelve un array dentro de un array

    // 2. DATA FORMATTING & CLEANUP
    const topPostsFb = formatFacebookPosts(fbPostsRaw, hootsuiteData?.facebook)
    const { topPostsIg, topStoriesIg } = formatInstagramPosts(igPostsRaw, hootsuiteData?.instagram)
    const dynamicCas = formatCasData(manualKpis)

    const competitorsList = dbCompetitors[0] || []

    // CÁLCULO DE MES DINÁMICO
    let mesDinamico = 'Periodo Actual'
    if (fbRealKpis?.historicalFollowers && fbRealKpis.historicalFollowers.length > 0) {
      const fechaRaw = fbRealKpis.historicalFollowers[0].date
      const dateObj = new Date(fechaRaw)
      if (!isNaN(dateObj)) {
        const formateador = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' })
        const fechaFormateada = formateador.format(dateObj)
        mesDinamico = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
      }
    }

    // 3. DATABASE MERGE (Images & Videos) - Envuelto en try/catch independiente
    let dbImages = []
    try {
      const [rows] = await pool.query('SELECT post_id, image_url FROM post_images')
      dbImages = rows
    } catch (dbError) {
      console.error('Error al cargar imágenes de la BD, continuando sin ellas...', dbError.message)
    }

    const mergeImages = posts => {
      return posts.map(post => {
        const dbImg = dbImages.find(img => img.post_id === post.id)
        if (dbImg) return { ...post, img: dbImg.image_url }
        return post
      })
    }

    const finalTopPostsFb = mergeImages(topPostsFb)
    const finalTopPostsIg = mergeImages(topPostsIg)

    // Filtramos los Trends usando los arreglos ya mezclados con las imágenes
    const trendPostsFb = finalTopPostsFb.filter(post => (post.tags && post.tags.toLowerCase().includes('#trend')) || post.tags.toLowerCase().includes('#treend'))
    const trendPostsIg = finalTopPostsIg.filter(post => (post.tags && post.tags.toLowerCase().includes('#trend')) || post.tags.toLowerCase().includes('#treend'))

    // 4. REPORT ASSEMBLY
    const fullReport = {
      metadata: {
        client: 'Pluxee',
        title: 'SOCIAL MEDIA REPORT',
        period: mesDinamico,
        agency: 'TOLKO',
      },
      context: {
        title: 'Contexto actual de las RRSS',
        insights: ['No hay insights registrados en este periodo.'],
      },
      facebook: {
        username: hootsuiteData?.facebook?.username || 'Pluxee FB',
        kpis: {
          month: mesDinamico,
          interactions: fbRealKpis?.interactions || 0,
          total_followers: fbRealKpis?.total_followers || 0,
          new_followers: fbRealKpis?.new_followers || 0,
          clics: fbRealKpis?.clics || 0,
          shares: fbRealKpis?.shares || 0,
          responding: fbRealKpis?.comments || 0,
          post_engagement_rate: fbRealKpis?.post_engagement_rate ? `${fbRealKpis.post_engagement_rate}%` : '0%',
          post_impressions: fbRealKpis?.post_impressions || 0,
          response_time: fbRealKpis?.time_visualization || '0',
          page_organic_reach: fbRealKpis?.page_organic_reach || 0,
          page_no_followers_views: fbRealKpis?.page_no_followers_views || 0,
          page_followers_views: fbRealKpis?.page_followers_views || 0,
          reach: fbRealKpis?.reach || 0,
          sentiment: {
            neutral: fbSentiment?.neutral || 0,
            positive: fbSentiment?.positive || 0,
            negative: fbSentiment?.negative || 0,
          },
          historicalFollowers: fbRealKpis?.historicalFollowers || [],
        },
        topCities: fbRealKpis?.topCities || [],
        topPosts: finalTopPostsFb,
        trendPosts: trendPostsFb,
        reachByTags: fbTags || [],
      },
      instagram: {
        username: hootsuiteData?.instagram?.username || 'Pluxee IG',
        kpis: {
          total_followers: igRealKpis?.total_followers || 0,
          page_engagement_rate: igRealKpis?.page_engagement_rate ? `${igRealKpis.page_engagement_rate}%` : '0%',
          post_saves: igRealKpis?.post_saves || 0,
          post_likes: igRealKpis?.post_likes || 0,
          stories_metrics: {
            total: igRealKpis?.posts_total || 0,
            forward: igRealKpis?.story_taps_forward || 0,
            back: igRealKpis?.story_taps_back || 0,
            exit: igRealKpis?.story_exits || 0,
          },
          reach_by_type: igRealKpis?.reach_by_type || { carousel: 0, photo: 0, reel: 0, story: 0 },
          sentiment: {
            neutral: igSentiment?.neutral || 0,
            positive: igSentiment?.positive || 0,
            negative: igSentiment?.negative || 0,
          },
          historicalFollowers: igRealKpis?.historicalFollowers || [],
        },
        topCities: igRealKpis?.topCities || [],
        topPosts: finalTopPostsIg,
        topStories: topStoriesIg,
        trendPosts: trendPostsIg,
        reachByTags: igTags || [],
      },
      benchmarking: competitorsList,
      benchmarkInsights: ['No hay insights de benchmarking registrados en este periodo.'],
      customerService: {
        cas: dynamicCas,
        messages: { total: 0, escalated: 0, breakdown: { facebook: { count: 0, percentage: 0 }, instagram: { count: 0, percentage: 0 } } },
        complaints: ['No hay quejas registradas en este periodo.'],
      },
      nextSteps: {
        proposals: ['No hay propuestas registradas.'],
        commitments: ['No hay compromisos registrados.'],
      },
    }

    console.log('✅ Data successfully assembled!')
    res.json(fullReport)
  } catch (error) {
    console.error('Error FATAL assembling the final report:', error)
    res.status(500).json({ error: 'Error interno procesando el reporte' })
  }
}

module.exports = { getReportData }
