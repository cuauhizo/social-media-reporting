const { getSocialMetrics } = require('../hootsuiteService')
const { leerPublicacionesCSV, leerKpisGenerales, leerKpisFacebookHootsuite, leerKpisInstagramHootsuite, leerSentimientos, leerAlcancePorTags } = require('../csvService')

const getReportData = async (req, res) => {
  try {
    console.log('Iniciando fusión de datos...')

    // 1. LEEMOS TODO AL MISMO TIEMPO (Incluyendo ambos CSVs de posts)
    const [publicacionesFb, publicacionesIg, hootsuiteData, kpisManuales, kpisFbReales, kpisIgReales, sentimientosFb, sentimientosIg, tagFb, tagIg] = await Promise.all([
      leerPublicacionesCSV('hootsuite_publicaciones_fb.csv'), // Pide los de FB
      leerPublicacionesCSV('hootsuite_publicaciones_ig.csv'), // Pide los de IG
      getSocialMetrics(),
      leerKpisGenerales(),
      leerKpisFacebookHootsuite(),
      leerKpisInstagramHootsuite(),
      leerSentimientos('fb_inbound_messages.csv'),
      leerSentimientos('ig_inbound_messages.csv'),
      leerAlcancePorTags('hootsuite_publicaciones_fb.csv'),
      leerAlcancePorTags('hootsuite_publicaciones_ig.csv'),
    ])

    // 2. FUSIÓN Y MAPEO PARA FACEBOOK
    const topPostsFb = (publicacionesFb || [])
      .map(postExcel => {
        let imagenMapeada = 'https://placehold.co/300x400/00eb5d/ffffff?text=Post+Sin+Imagen'
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
          date: postExcel.fecha ? postExcel.fecha.split(' ')[0] : 'Sin fecha',
          tags: postExcel.tags || 'Sin etiqueta',
        }
      })
      .sort((a, b) => b.reach - a.reach)

    // 3. FUSIÓN Y MAPEO PARA INSTAGRAM (Separando Posts y Stories)
    const igPostsList = []
    const igStoriesList = []

    ;(publicacionesIg || []).forEach(postExcel => {
      let imagenMapeada = 'https://placehold.co/300x400/ff7375/ffffff?text=IG+Sin+Imagen'
      let tipoPost = (postExcel.tipoPost || 'POST').toUpperCase()

      // 1. TRUCO PARA HISTORIAS: Usamos la imagen directa que viene en el CSV
      if (tipoPost.includes('STORY')) {
        imagenMapeada = 'https://placehold.co/300x533/00eb5d/ffffff?text=IG+Story'

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
        date: postExcel.fecha ? postExcel.fecha.split(' ')[0] : 'Sin fecha',
        tags: postExcel.tags || 'Sin etiqueta',
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

    // ✨ NUEVA LÓGICA DINÁMICA PARA LOS CAS (Customer Service) ✨
    const dynamicCas = []
    if (kpisManuales) {
      for (const key in kpisManuales) {
        // Buscamos cualquier llave que empiece con 'cas_'
        if (key.startsWith('cas_')) {
          // Limpiamos el texto: de "cas_actualizacion_de_datos" a "Actualizacion de datos"
          let label = key.replace('cas_', '').replace(/_/g, ' ')
          label = label.charAt(0).toUpperCase() + label.slice(1) // Mayúscula inicial

          dynamicCas.push({
            label: label,
            value: parseFloat(kpisManuales[key]) || 0,
          })
        }
      }
    }
    // Ordenamos de mayor a menor para que la gráfica de pastel se vea ordenada
    dynamicCas.sort((a, b) => b.value - a.value)

    // 4. ARMAMOS EL REPORTE FINAL
    const fullReport = {
      metadata: { client: 'Pluxee', title: 'SOCIAL MEDIA REPORT', period: kpisManuales?.month || 'Periodo Actual', agency: 'TOLKO' },
      context: {
        title: 'Contexto actual de las RRSS',
        // insights: [
        //   'Durante el mes de febrero nuestro crecimiento fue estable. Los usuarios se mantuvieron activos.',
        //   'La mayor interacción en contenido fue referente a promociones y educativo en Instagram',
        //   'El número de quejas disminuyó considerablemente.',
        //   'En Facebook, los carruseles fueron los formatos que mantuvieron mayor interacción de usuarios, mientras que en IG fue reel.',
        //   'Este es otro punto importante a destacar, que nos habla de la importancia de mantener una estrategia de contenido variada y adaptada a cada plataforma.',
        // ],
        insights: kpisManuales.insight || ['No hay insights registrados en este periodo.'],
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
          sentiment: {
            neutral: sentimientosIg?.neutral || 0,
            positive: sentimientosIg?.positive || 0,
            negative: sentimientosIg?.negative || 0,
          },
        },
        topCities: kpisIgReales?.topCities || [],
        topPosts: topPostsIg,
        topStories: topStoriesIg,
        reachByTags: tagIg || [],
      },
      benchmarking: [
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
          gainedFollowers: {
            total: 0.78,
            dailyHistory: [2, 3, 5, 4, 6, 8, 10, 9, 8, 7, 5, 6, 8, 10, 12, 11, 10, 9, 8, 9, 10, 11, 12, 11, 10, 9, 8, 7, 6, 5, 6],
          },
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
          gainedFollowers: {
            total: 0.3,
            dailyHistory: [8, 10, 12, 10, 8, 10, 15, 20, 18, 15, 12, 10, 8, 10, 15, 20, 25, 20, 18, 15, 12, 10, 8, 10, 15, 20, 25, 20, 18, 15, 20],
          },
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
          gainedFollowers: {
            total: 0.1,
            dailyHistory: [15, 18, 20, 22, 20, 18, 20, 25, 30, 28, 25, 22, 20, 18, 20, 25, 30, 35, 32, 30, 28, 25, 22, 20, 22, 25, 30, 35, 32, 30, 35],
          },
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
          gainedFollowers: {
            total: -0.01,
            dailyHistory: [1, 2, 3, 2, 1, 2, 3, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 2, 0],
          },
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
          gainedFollowers: {
            total: 0.19,
            dailyHistory: [10, 12, 15, 12, 10, 15, 20, 25, 22, 20, 18, 15, 12, 15, 20, 25, 30, 28, 25, 22, 20, 18, 15, 20, 25, 30, 35, 32, 30, 28, 30],
          },
        },
      ],
      benchmarkInsights: kpisManuales.benchmark_insight || [],
      customerService: {
        cas: dynamicCas,
        messages: {
          total: kpisManuales.cs_total || 0,
          escalated: kpisManuales.cs_escalated || 0,
          breakdown: {
            facebook: {
              count: kpisManuales.msj_fb || 0,
              percentage: kpisManuales.percentage_fb || 0,
            },
            instagram: {
              count: kpisManuales.msj_ig || 0,
              percentage: kpisManuales.percentage_ig || 0,
            },
          },
        },
        complaints: (kpisManuales.complaint || []).map((texto, index) => {
          return { id: index + 1, topic: texto }
        }),
      },
      nextSteps: {
        proposals: kpisManuales.proposal || ['No hay propuestas registradas.'],
        commitments: kpisManuales.commitment || ['No hay compromisos registrados.'],
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
