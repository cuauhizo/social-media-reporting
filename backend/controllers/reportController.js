const { getSocialMetrics } = require('../hootsuiteService')
const { leerMetricasCSV, leerKpisGenerales, leerKpisFacebookHootsuite, leerKpisInstagramHootsuite } = require('../csvService')

const getReportData = async (req, res) => {
  try {
    console.log('Iniciando fusión de datos...')

    // OPTIMIZACIÓN: Promise.all ejecuta todas las lecturas al mismo tiempo (mucho más rápido)
    const [metricasExcel, hootsuiteData, kpisManuales, kpisFbReales, kpisIgReales] = await Promise.all([leerMetricasCSV(), getSocialMetrics(), leerKpisGenerales(), leerKpisFacebookHootsuite(), leerKpisInstagramHootsuite()])

    const postsFusionados = metricasExcel.map(postExcel => {
      let imagenMapeada = 'https://placehold.co/300x400/cccccc/ffffff?text=Post+Sin+Imagen'
      let tipoPost = 'POST'

      if (hootsuiteData && hootsuiteData.facebook && hootsuiteData.facebook.realPosts) {
        const textoCortoExcel = postExcel.mensaje.substring(0, 20).trim()
        const postCoincidente = hootsuiteData.facebook.realPosts.find(p => p.text && p.text.includes(textoCortoExcel))

        if (postCoincidente) {
          if (postCoincidente.mediaUrls && postCoincidente.mediaUrls.length > 0) {
            imagenMapeada = postCoincidente.mediaUrls[0].thumbnailUrl || postCoincidente.mediaUrls[0].url
          }
          if (postCoincidente.postUrl && postCoincidente.postUrl.includes('reel')) tipoPost = 'REEL'
          else if (postCoincidente.mediaUrls && postCoincidente.mediaUrls[0] && postCoincidente.mediaUrls[0].url.includes('.mp4')) tipoPost = 'VIDEO'
        }
      }

      return {
        id: Math.random().toString(36).substr(2, 9), // Un ID temporal
        type: postExcel.tipoPost,
        reach: postExcel.alcance,
        interactions: postExcel.interacciones,
        saved: postExcel.shares,
        img: imagenMapeada,
        postPermalink: postExcel.postPermalink,
        text: postExcel.mensaje.substring(0, 60) + '...',
      }
    })

    // ORDENAMOS Y CORTAMOS
    // Ordenamos de mayor a menor alcance (Los más virales primero)
    postsFusionados.sort((a, b) => b.reach - a.reach)
    const topPostsFinales = postsFusionados

    const fullReport = {
      metadata: { client: 'Pluxee', title: 'SOCIAL MEDIA REPORT', period: 'February 2026', agency: 'TOLKO' },
      context: {
        title: 'Contexto actual de las RRSS',
        insights: [
          'Durante el mes de febrero nuestro crecimiento fue estable. Los usuarios se mantuvieron activos.',
          'La mayor interacción en contenido fue referente a promociones y educativo en Instagram',
          'El número de quejas disminuyó considerablemente.',
          'En Facebook, los carruseles fueron los formatos que mantuvieron mayor interacción de usuarios, mientras que en IG fue reel.',
        ],
      },
      facebook: {
        username: hootsuiteData ? hootsuiteData.facebook.username : 'Pluxee FB',
        kpis: {
          month: 'February 2026',
          page_engagement: kpisManuales.fb_page_engagement || 9789,
          followers: kpisFbReales ? kpisFbReales.followers : 3855,
          clics: kpisFbReales ? kpisFbReales.clics : 1801,
          shares: kpisFbReales ? kpisFbReales.shares : 310,
          responding: kpisFbReales ? kpisFbReales.comments : 84,
          post_engagement_rate: kpisFbReales ? `${kpisFbReales.post_engagement_rate}%` : '5.62%',
          post_impressions: kpisFbReales ? kpisFbReales.post_impressions : 2100,
          response_time: kpisFbReales ? kpisFbReales.time_visualization : 0,
          page_organic_reach: kpisFbReales ? kpisFbReales.page_organic_reach : 1200,
          page_no_followers_views: kpisFbReales ? kpisFbReales.page_no_followers_views : 300,
          page_followers_views: kpisFbReales ? kpisFbReales.page_followers_views : 900,
          reach: kpisManuales.fb_reach || 1801,
          sentiment: {
            neutral: kpisManuales.sentiment_neutral || 61.92,
            positive: kpisManuales.sentiment_positive || 15.95,
            negative: kpisManuales.sentiment_negative || 23.13,
          },
        },
        topCities: kpisFbReales && kpisFbReales.topCities ? kpisFbReales.topCities : [],
        // AQUI INYECTAMOS LOS POSTS FUSIONADOS
        topPosts:
          topPostsFinales.length > 0
            ? topPostsFinales
            : [
                // Respaldo por si algo falla
                { id: 1, type: 'IMAGE', reach: 860, interactions: 37, saved: 1, img: 'https://placehold.co/300x400/ac2d72/ffffff?text=Pizza+Post' },
              ],
      },
      instagram: {
        username: hootsuiteData ? hootsuiteData.instagram.username : 'Pluxee IG',
        kpis: {
          // followers: kpisManuales.ig_followers || 2677,
          followers: kpisIgReales ? kpisIgReales.followers : 2677,
          page_engagement_rate: `${kpisIgReales ? kpisIgReales.page_engagement_rate : 19.01}%`,
          post_saves: kpisIgReales ? kpisIgReales.post_saves : 1,
          post_likes: kpisIgReales ? kpisIgReales.post_likes : 1,
          stories_metrics: {
            total: kpisIgReales ? kpisIgReales.posts_total : 18,
            forward: kpisIgReales ? kpisIgReales.story_taps_forward : 0,
            back: kpisIgReales ? kpisIgReales.story_taps_back : 0,
            exit: kpisIgReales ? kpisIgReales.story_exits : 310,
          },
        },
        topCities: kpisIgReales && kpisIgReales.topCities ? kpisIgReales.topCities : [],
        topPosts: [
          { id: 'ig_p1', type: 'CAROUSEL', views: 771, interactions: 348, saved: 1, img: 'https://placehold.co/300x400/e1306c/ffffff?text=IG+Post+1' },
          { id: 'ig_p2', type: 'CAROUSEL', views: 733, interactions: 32, saved: 1, img: 'https://placehold.co/300x400/e1306c/ffffff?text=IG+Post+2' },
        ],
        topStories: [
          { id: 'ig_s1', type: 'STORY', views: 418, interactions: 5, shares: 0, img: 'https://placehold.co/300x533/f56040/ffffff?text=IG+Story+1' },
          { id: 'ig_s2', type: 'STORY', views: 368, interactions: 2, shares: 0, img: 'https://placehold.co/300x533/f56040/ffffff?text=IG+Story+2' },
        ],
      },
      benchmarking: [
        { id: 1, name: 'Si Vale', description: 'Una empresa líder en soluciones en tarjetas...', followers: '217.3 mil', following: '1209', posts: 10 },
        { id: 2, name: 'Edenred México', description: 'Somos líderes a nivel mundial en soluciones de pago...', followers: '212.8 mil', following: '1529', posts: 3 },
        { id: 3, name: 'Toka', description: 'En Toka creemos en el constante cambio...', followers: '74.2 mil', following: '76', posts: 10 },
        { id: 4, name: 'Efectivale', description: 'Fundada en 1989 en la CDMX, ofrece soluciones...', followers: '13.6 mil', following: '157', posts: 12 },
        { id: 5, name: 'Pluxee.MX', description: 'Servicio financiero', followers: '3.9 mil', following: '135', posts: 25, isClient: true },
      ],
      customerService: {
        messages: {
          total: kpisManuales.cs_total || 84,
          escalated: kpisManuales.cs_escalated || 31,
          breakdown: { facebook: { count: 63, percentage: 75.0 }, instagram: { count: 21, percentage: 25.0 } },
        },
        complaints: [
          { id: 1, topic: 'RFC Duplicado' },
          { id: 2, topic: 'Rechazo en establecimientos' },
          { id: 3, topic: 'Pérdida o robo' },
          { id: 4, topic: 'La app no reconoce mi tarjeta' },
          { id: 5, topic: 'Cómo ingreso a la app' },
        ],
      },
      nextSteps: {
        proposals: ['Dar seguimiento a los casos registrados en la pestaña de escalamiento.', 'Mantener el cover de portada y/o con promociones nuevas.', 'Contenido educativo con videos y carruseles.'],
        commitments: ['Continuar resolviendo problemáticas que no requieran un escalamiento y uso de post.', 'Repostear el contenido de feed en historias.', 'Mantener tiempo de respuesta en comentarios y mensajes directos de cada red social.'],
      },
    }

    if (hootsuiteData) console.log('¡Datos obtenidos y listos!')
    res.json(fullReport)
  } catch (error) {
    console.error('Error general armando el reporte:', error)
    res.status(500).json({ error: 'Error interno del servidor al procesar los datos' })
  }
}

// Exportamos el controlador
module.exports = { getReportData }
