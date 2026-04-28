const { getSocialMetrics } = require('../hootsuiteService')
const { leerPublicacionesCSV, leerKpisGenerales, leerKpisFacebookHootsuite, leerKpisInstagramHootsuite, leerSentimientos, leerAlcancePorTags } = require('../csvService')
const { formatFacebookPosts, formatInstagramPosts, formatCasData } = require('../utils/formatters')
const { pool } = require('../utils/db') //  IMPORTANTE: Traemos la BD para el Benchmark

const getReportData = async (req, res) => {
  try {
    console.log('Initiating data fusion...')

    // 1. DATA FETCHING (Parallel execution for maximum performance)
    const [
      fbPostsRaw,
      igPostsRaw,
      hootsuiteData,
      manualKpis,
      fbRealKpis,
      igRealKpis,
      fbSentiment,
      igSentiment,
      fbTags,
      igTags,
      dbCompetitors, // 👈 Nueva consulta a tu base de datos
    ] = await Promise.all([
      leerPublicacionesCSV('01_fb_posts_metrics.csv'),
      leerPublicacionesCSV('02_ig_posts_metrics.csv'),
      getSocialMetrics(),
      leerKpisGenerales(),
      leerKpisFacebookHootsuite(),
      leerKpisInstagramHootsuite(),
      leerSentimientos('01_fb_inbound_sentiment.csv'),
      leerSentimientos('02_ig_inbound_sentiment.csv'),
      leerAlcancePorTags('01_fb_posts_metrics.csv'),
      leerAlcancePorTags('02_ig_posts_metrics.csv'),
      pool.query('SELECT * FROM benchmark_competitors ORDER BY is_main_brand DESC, followers DESC'), // 👈 Traemos competidores reales
    ])

    // 2. DATA FORMATTING & CLEANUP
    // Standardizing raw CSV/API data for the frontend
    const topPostsFb = formatFacebookPosts(fbPostsRaw, hootsuiteData?.facebook)
    const { topPostsIg, topStoriesIg } = formatInstagramPosts(igPostsRaw, hootsuiteData?.instagram)
    const dynamicCas = formatCasData(manualKpis)

    // Extrayendo los competidores de la respuesta de MySQL
    const competitorsList = dbCompetitors[0] || []

    // CÁLCULO DE MES DINÁMICO
    let mesDinamico = 'Periodo Actual'
    if (fbRealKpis?.historicalFollowers && fbRealKpis.historicalFollowers.length > 0) {
      const fechaRaw = fbRealKpis.historicalFollowers[0].date // Ej: "2026-03-01"
      const dateObj = new Date(fechaRaw)
      if (!isNaN(dateObj)) {
        // Crea "marzo 2026" y luego capitalizamos la primera letra
        const formateador = new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' })
        const fechaFormateada = formateador.format(dateObj)
        mesDinamico = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1) // "Marzo 2026"
      }
    }

    // 3. DATABASE MERGE (Images & Videos)
    const [dbImages] = await pool.query('SELECT post_id, image_url FROM post_images')

    const mergeImages = posts => {
      return posts.map(post => {
        const dbImg = dbImages.find(img => img.post_id === post.id)
        if (dbImg) {
          return { ...post, img: dbImg.image_url }
        }

        return post
      })
    }

    const finalTopPostsFb = mergeImages(topPostsFb)
    const finalTopPostsIg = mergeImages(topPostsIg)

    // CORRECCIÓN: Filtramos los Trends DESPUÉS del merge y usando los arreglos FINAL
    const trendPostsFb = finalTopPostsFb.filter(post => (post.tags && post.tags.toLowerCase().includes('#trend')) || post.tags.toLowerCase().includes('#treend'))
    const trendPostsIg = finalTopPostsIg.filter(post => (post.tags && post.tags.toLowerCase().includes('#trend')) || post.tags.toLowerCase().includes('#treend'))

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
          reach: fbRealKpis?.fb_reach || 0,
          sentiment: {
            neutral: fbSentiment?.neutral || 0,
            positive: fbSentiment?.positive || 0,
            negative: fbSentiment?.negative || 0,
          },
          historicalFollowers: fbRealKpis?.historicalFollowers || [],
        },
        topCities: fbRealKpis?.topCities || [],
        topPosts: topPostsFb,
        trendPosts: trendPostsFb,
        reachByTags: fbTags || [],
      },

      instagram: {
        username: hootsuiteData?.instagram?.username || 'Pluxee IG',
        kpis: {
          total_followers: igRealKpis?.total_followers || 0,
          page_engagement_rate: `${igRealKpis?.page_engagement_rate || 0}%`,
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
        topPosts: topPostsIg,
        topStories: topStoriesIg,
        trendPosts: trendPostsIg,
        reachByTags: igTags || [],
      },

      //  Benchmarking ahora es dinámico y real
      benchmarking: competitorsList,
      benchmarkInsights: ['No hay insights de benchmarking registrados en este periodo.'],

      customerService: {
        cas: dynamicCas,
        messages: {
          total: 0,
          escalated: 0,
          breakdown: {
            facebook: { count: 0, percentage: 0 },
            instagram: { count: 0, percentage: 0 },
          },
        },
        complaints: ['No hay quejas registradas en este periodo.'],
      },

      nextSteps: {
        proposals: ['No hay propuestas registradas.'],
        commitments: ['No hay compromisos registrados.'],
      },
    }

    console.log('Data successfully assembled!')
    res.json(fullReport)
  } catch (error) {
    // 4. ERROR HANDLING
    console.error('Error assembling the final report:', error)
    // Se envía un error genérico al cliente por seguridad, el detalle queda en el log del servidor
    res.status(500).json({ error: 'Internal server error while processing report data' })
  }
}

module.exports = { getReportData }
