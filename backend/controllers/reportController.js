const { getSocialMetrics } = require('../hootsuiteService')
const { leerPublicacionesCSV, leerKpisGenerales, leerKpisFacebookHootsuite, leerKpisInstagramHootsuite, leerSentimientos } = require('../csvService')

const getReportData = async (req, res) => {
  try {
    console.log('Iniciando fusión de datos...')

    // 1. LEEMOS TODO AL MISMO TIEMPO (Incluyendo ambos CSVs de posts)
    const [publicacionesFb, publicacionesIg, hootsuiteData, kpisManuales, kpisFbReales, kpisIgReales, sentimientosFb, sentimientosIg] = await Promise.all([
      leerPublicacionesCSV('hootsuite_publicaciones_fb.csv'), // Pide los de FB
      leerPublicacionesCSV('hootsuite_publicaciones_ig.csv'), // Pide los de IG
      getSocialMetrics(),
      leerKpisGenerales(),
      leerKpisFacebookHootsuite(),
      leerKpisInstagramHootsuite(),
      leerSentimientos('fb_inbound_messages.csv'),
      leerSentimientos('ig_inbound_messages.csv'),
    ])

    // 2. FUSIÓN Y MAPEO PARA FACEBOOK
    const topPostsFb = (publicacionesFb || [])
      .map(postExcel => {
        let imagenMapeada = 'https://placehold.co/300x400/cccccc/ffffff?text=Post+Sin+Imagen'
        let tipoPost = postExcel.tipoPost || 'POST'

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
          id: Math.random().toString(36).substr(2, 9),
          type: tipoPost,
          reach: postExcel.alcance,
          interactions: postExcel.interacciones,
          saved: postExcel.shares,
          img: imagenMapeada,
          postPermalink: postExcel.postPermalink,
          text: postExcel.mensaje.substring(0, 60) + '...',
        }
      })
      .sort((a, b) => b.reach - a.reach)

    // 3. FUSIÓN Y MAPEO PARA INSTAGRAM (Separando Posts y Stories)
    const igPostsList = []
    const igStoriesList = []

    ;(publicacionesIg || []).forEach(postExcel => {
      let imagenMapeada = 'https://placehold.co/300x400/e1306c/ffffff?text=IG+Sin+Imagen'
      let tipoPost = (postExcel.tipoPost || 'POST').toUpperCase()

      // 1. TRUCO PARA HISTORIAS: Usamos la imagen directa que viene en el CSV
      if (tipoPost.includes('STORY')) {
        imagenMapeada = 'https://placehold.co/300x533/f56040/ffffff?text=IG+Story'

        // Si la URL del permalink contiene "scontent" (servidor de Meta), "jpg" o "mp4", es la imagen real
        if (postExcel.postPermalink && postExcel.postPermalink.includes('scontent')) {
          imagenMapeada = postExcel.postPermalink
        }
      }

      // 2. TRUCO PARA POSTS: Cruzamos los datos usando la URL en lugar del texto
      if (hootsuiteData && hootsuiteData.instagram && hootsuiteData.instagram.realPosts) {
        // Limpiamos la URL del Excel para evitar problemas con parámetros extra
        const urlLimpiaExcel = (postExcel.postPermalink || '').split('?')[0].replace(/\/$/, '')

        // Buscamos el post en la API que tenga exactamente la misma URL
        const postCoincidente = hootsuiteData.instagram.realPosts.find(p => {
          const urlLimpiaApi = (p.postUrl || '').split('?')[0].replace(/\/$/, '')
          return urlLimpiaApi === urlLimpiaExcel || (urlLimpiaApi !== '' && urlLimpiaExcel.includes(urlLimpiaApi))
        })

        if (postCoincidente) {
          if (postCoincidente.mediaUrls && postCoincidente.mediaUrls.length > 0) {
            imagenMapeada = postCoincidente.mediaUrls[0].thumbnailUrl || postCoincidente.mediaUrls[0].url
          }
          // Adivinamos si es reel o carrusel
          if (!tipoPost.includes('STORY')) {
            if (postCoincidente.postUrl && postCoincidente.postUrl.includes('reel')) tipoPost = 'REEL'
            else if (postCoincidente.mediaUrls && postCoincidente.mediaUrls.length > 1) tipoPost = 'CAROUSEL'
          }
        }
      }

      const postFormateado = {
        id: Math.random().toString(36).substr(2, 9),
        type: tipoPost.includes('STORY') ? 'STORY' : tipoPost,
        views: postExcel.visitas || postExcel.alcance || 0,
        reach: postExcel.alcance || 0,
        interactions: postExcel.interacciones || 0,
        saved: postExcel.saves || 0,
        likes: postExcel.likes || 0,
        shares: postExcel.shares || 0,
        img: imagenMapeada,
        postPermalink: postExcel.postPermalink,
        text: postExcel.mensaje ? postExcel.mensaje.substring(0, 60) + '...' : 'Historia sin texto',
      }

      // Los separamos en sus respectivas listas
      if (tipoPost.includes('STORY')) {
        igStoriesList.push(postFormateado)
      } else {
        igPostsList.push(postFormateado)
      }
    })

    // Ordenamos ambas listas por vistas y tomamos las 4 mejores
    const topPostsIg = igPostsList.sort((a, b) => b.views - a.views)
    const topStoriesIg = igStoriesList.sort((a, b) => b.views - a.views)

    // 4. ARMAMOS EL REPORTE FINAL
    const fullReport = {
      metadata: { client: 'Pluxee', title: 'SOCIAL MEDIA REPORT', period: kpisManuales?.month || 'Periodo Actual', agency: 'TOLKO' },
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
          month: kpisFbReales?.month || 'Periodo Actual',
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
          sentiment: {
            neutral: sentimientosFb?.neutral || 0,
            positive: sentimientosFb?.positive || 0,
            negative: sentimientosFb?.negative || 0,
          },
        },
        topCities: kpisFbReales?.topCities || [],
        topPosts: topPostsFb,
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
          sentiment: {
            neutral: sentimientosIg?.neutral || 0,
            positive: sentimientosIg?.positive || 0,
            negative: sentimientosIg?.negative || 0,
          },
        },
        topCities: kpisIgReales?.topCities || [],
        topPosts: topPostsIg,
        topStories: topStoriesIg,
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

module.exports = { getReportData }
