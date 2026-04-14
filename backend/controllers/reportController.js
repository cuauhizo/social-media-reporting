const { getSocialMetrics } = require('../hootsuiteService')
const { leerPublicacionesCSV, leerKpisGenerales, leerKpisFacebookHootsuite, leerKpisInstagramHootsuite, leerSentimientos, leerAlcancePorTags } = require('../csvService')
const { formatFacebookPosts, formatInstagramPosts, formatCasData } = require('../utils/formatters')
const { pool } = require('../utils/db') // ✨ IMPORTANTE: Traemos la BD para el Benchmark

const getReportData = async (req, res) => {
  try {
    console.log('Initiating data fusion...')

    // 1. DATA FETCHING (Parallel execution for maximum performance)
    // We load CSVs, API data, and MySQL data simultaneously
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

    // 3. REPORT ASSEMBLY
    // Building the final JSON payload
    const fullReport = {
      metadata: {
        client: 'Pluxee',
        title: 'SOCIAL MEDIA REPORT',
        period: manualKpis?.month || 'Periodo Actual',
        agency: 'TOLKO',
      },

      context: {
        title: 'Contexto actual de las RRSS',
        insights: manualKpis.insight || ['No hay insights registrados en este periodo.'],
      },

      facebook: {
        username: hootsuiteData?.facebook?.username || 'Pluxee FB',
        kpis: {
          month: manualKpis?.month || 'Periodo Actual',
          interactions: fbRealKpis?.interactions || 0,
          followers: fbRealKpis?.followers || 0,
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
        },
        topCities: fbRealKpis?.topCities || [],
        topPosts: topPostsFb,
        reachByTags: fbTags || [],
      },

      instagram: {
        username: hootsuiteData?.instagram?.username || 'Pluxee IG',
        kpis: {
          followers: igRealKpis?.followers || 0,
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
        },
        topCities: igRealKpis?.topCities || [],
        topPosts: topPostsIg,
        topStories: topStoriesIg,
        reachByTags: igTags || [],
      },

      // ✨ Benchmarking ahora es dinámico y real ✨
      benchmarking: competitorsList,
      benchmarkInsights: manualKpis.benchmark_insight || [],

      customerService: {
        cas: dynamicCas,
        messages: {
          total: manualKpis.cs_total || 0,
          escalated: manualKpis.cs_escalated || 0,
          breakdown: {
            facebook: { count: manualKpis.msj_fb || 0, percentage: manualKpis.percentage_fb || 0 },
            instagram: { count: manualKpis.msj_ig || 0, percentage: manualKpis.percentage_ig || 0 },
          },
        },
        complaints: (manualKpis.complaint || []).map((text, index) => ({ id: index + 1, topic: text })),
      },

      nextSteps: {
        proposals: manualKpis.proposal || ['No hay propuestas registradas.'],
        commitments: manualKpis.commitment || ['No hay compromisos registrados.'],
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
