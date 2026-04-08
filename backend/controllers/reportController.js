const { getSocialMetrics } = require('../hootsuiteService')
const { leerPublicacionesCSV, leerKpisGenerales, leerKpisFacebookHootsuite, leerKpisInstagramHootsuite, leerSentimientos, leerAlcancePorTags } = require('../csvService')
const { formatFacebookPosts, formatInstagramPosts, formatCasData } = require('../utils/formatters') // ✨ IMPORTAMOS NUESTRAS UTILIDADES

const getReportData = async (req, res) => {
  try {
    console.log('Iniciando fusión de datos...')

    // 1. LEEMOS TODO AL MISMO TIEMPO
    const [publicacionesFb, publicacionesIg, hootsuiteData, kpisManuales, kpisFbReales, kpisIgReales, sentimientosFb, sentimientosIg, tagFb, tagIg] = await Promise.all([
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
    ])

    // ✨ 2. USAMOS LAS FUNCIONES DE MAPEO PARA LIMPIAR LOS DATOS ✨
    const topPostsFb = formatFacebookPosts(publicacionesFb, hootsuiteData?.facebook)
    const { topPostsIg, topStoriesIg } = formatInstagramPosts(publicacionesIg, hootsuiteData?.instagram)
    const dynamicCas = formatCasData(kpisManuales)

    // 3. ARMAMOS EL REPORTE FINAL
    const fullReport = {
      metadata: { client: 'Pluxee', title: 'SOCIAL MEDIA REPORT', period: kpisManuales?.month || 'Periodo Actual', agency: 'TOLKO' },
      context: {
        title: 'Contexto actual de las RRSS',
        insights: kpisManuales.insight || ['No hay insights registrados en este periodo.'],
      },
      facebook: {
        username: hootsuiteData ? hootsuiteData.facebook.username : 'Pluxee FB',
        kpis: {
          month: kpisManuales?.month || 'Periodo Actual',
          interactions: kpisFbReales?.interactions || 0,
          followers: kpisFbReales?.followers || 0,
          clics: kpisFbReales?.clics || 0,
          shares: kpisFbReales?.shares || 0,
          responding: kpisFbReales?.comments || 0,
          post_engagement_rate: kpisFbReales?.post_engagement_rate ? `${kpisFbReales.post_engagement_rate}%` : '0%',
          post_impressions: kpisFbReales?.post_impressions || 0,
          response_time: kpisFbReales?.time_visualization || '0',
          page_organic_reach: kpisFbReales?.page_organic_reach || 0,
          page_no_followers_views: kpisFbReales?.page_no_followers_views || 0,
          page_followers_views: kpisFbReales?.page_followers_views || 0,
          reach: kpisFbReales?.fb_reach || 0,
          sentiment: { neutral: sentimientosFb?.neutral || 0, positive: sentimientosFb?.positive || 0, negative: sentimientosFb?.negative || 0 },
        },
        topCities: kpisFbReales?.topCities || [],
        topPosts: topPostsFb,
        reachByTags: tagFb || [],
      },
      instagram: {
        username: hootsuiteData ? hootsuiteData.instagram.username : 'Pluxee IG',
        kpis: {
          followers: kpisIgReales?.followers || 0,
          page_engagement_rate: `${kpisIgReales?.page_engagement_rate || 0}%`,
          post_saves: kpisIgReales?.post_saves || 0,
          post_likes: kpisIgReales?.post_likes || 0,
          stories_metrics: {
            total: kpisIgReales?.posts_total || 0,
            forward: kpisIgReales?.story_taps_forward || 0,
            back: kpisIgReales?.story_taps_back || 0,
            exit: kpisIgReales?.story_exits || 0,
          },
          reach_by_type: kpisIgReales?.reach_by_type || { carousel: 0, photo: 0, reel: 0, story: 0 },
          sentiment: { neutral: sentimientosIg?.neutral || 0, positive: sentimientosIg?.positive || 0, negative: sentimientosIg?.negative || 0 },
        },
        topCities: kpisIgReales?.topCities || [],
        topPosts: topPostsIg,
        topStories: topStoriesIg,
        reachByTags: tagIg || [],
      },
      benchmarking: [
        // (Aquí va tu arreglo quemado de benchmarking tal cual lo tienes)
        {
          id: 1,
          name: 'Pluxee.MX',
          description: 'Tu cuenta',
          posts: 25,
          frequency: 1,
          Interaction: 18.3,
          following: '135',
          followers: '3.9 mil',
          isClient: true,
          gainedFollowers: { total: 0.78, dailyHistory: [2, 3, 5, 4, 6, 8, 10, 9, 8, 7, 5, 6, 8, 10, 12, 11, 10, 9, 8, 9, 10, 11, 12, 11, 10, 9, 8, 7, 6, 5, 6] },
        },
        {
          id: 2,
          name: 'Efectivale',
          description: 'Añadido el May 30, 2024',
          posts: 12,
          frequency: 0,
          Interaction: 18.5,
          following: '157',
          followers: '13.6 mil',
          gainedFollowers: { total: 0.3, dailyHistory: [8, 10, 12, 10, 8, 10, 15, 20, 18, 15, 12, 10, 8, 10, 15, 20, 25, 20, 18, 15, 12, 10, 8, 10, 15, 20, 25, 20, 18, 15, 20] },
        },
        {
          id: 3,
          name: 'Sí Vale',
          description: 'Añadido el May 30, 2024',
          posts: 10,
          frequency: 0,
          Interaction: 19.2,
          following: '1209',
          followers: '217.3 mil',
          gainedFollowers: { total: 0.1, dailyHistory: [15, 18, 20, 22, 20, 18, 20, 25, 30, 28, 25, 22, 20, 18, 20, 25, 30, 35, 32, 30, 28, 25, 22, 20, 22, 25, 30, 35, 32, 30, 35] },
        },
        {
          id: 4,
          name: 'Toka México',
          description: 'Añadido el May 30, 2024',
          posts: 10,
          frequency: 0,
          Interaction: 14.3,
          following: '76',
          followers: '74.2 mil',
          gainedFollowers: { total: -0.01, dailyHistory: [1, 2, 3, 2, 1, 2, 3, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 2, 0] },
        },
        {
          id: 5,
          name: 'Edenred México',
          description: 'Añadido el May 30, 2024',
          posts: 3,
          frequency: 0,
          Interaction: 17.3,
          following: '1529',
          followers: '212.8 mil',
          gainedFollowers: { total: 0.19, dailyHistory: [10, 12, 15, 12, 10, 15, 20, 25, 22, 20, 18, 15, 12, 15, 20, 25, 30, 28, 25, 22, 20, 18, 15, 20, 25, 30, 35, 32, 30, 28, 30] },
        },
      ],
      benchmarkInsights: kpisManuales.benchmark_insight || [],
      customerService: {
        cas: dynamicCas, // Usamos la variable que vino del mapper
        messages: {
          total: kpisManuales.cs_total || 0,
          escalated: kpisManuales.cs_escalated || 0,
          breakdown: {
            facebook: { count: kpisManuales.msj_fb || 0, percentage: kpisManuales.percentage_fb || 0 },
            instagram: { count: kpisManuales.msj_ig || 0, percentage: kpisManuales.percentage_ig || 0 },
          },
        },
        complaints: (kpisManuales.complaint || []).map((texto, index) => ({ id: index + 1, topic: texto })),
      },
      nextSteps: {
        proposals: kpisManuales.proposal || ['No hay propuestas registradas.'],
        commitments: kpisManuales.commitment || ['No hay compromisos registrados.'],
      },
    }

    console.log('¡Datos obtenidos y listos!')
    res.json(fullReport)
  } catch (error) {
    console.error('Error general armando el reporte:', error)
    res.status(500).json({ error: 'Error interno del servidor al procesar los datos' })
  }
}

module.exports = { getReportData }
