const express = require('express')
const axios = require('axios')
const cors = require('cors')
const { getSocialMetrics } = require('./hootsuiteService')

const app = express()
app.use(cors())

// ==========================================
// RUTA MAESTRA: El frontend pide los datos aquí
// ==========================================
app.get('/api/reports/:periodId', async (req, res) => {
  // 1. Intentamos traer datos reales de Hootsuite (Los nombres de Pluxee)
  const hootsuiteData = await getSocialMetrics()

  // 2. Preparamos el reporte completo con la estructura que Vue espera
  const fullReport = {
    metadata: {
      client: 'Pluxee',
      title: 'SOCIAL MEDIA REPORT',
      period: 'February 2026',
      agency: 'TOLKO',
    },
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
      // AQUÍ INYECTAMOS EL NOMBRE REAL DE HOOTSUITE (si existe), si no, usamos el de prueba
      username: hootsuiteData ? hootsuiteData.facebook.username : 'Pluxee FB',
      avatar: hootsuiteData ? hootsuiteData.facebook.avatar : '',

      kpis: {
        month: 'February 2026',
        followers: 3855,
        engagement: '5.62%',
        reach: 1801,
        sentiment: {
          neutral: '61.92%',
          positive: '15.95%',
          negative: '23.13%',
        },
      },
      topPosts:
        hootsuiteData && hootsuiteData.facebook.realPosts && hootsuiteData.facebook.realPosts.length > 0
          ? hootsuiteData.facebook.realPosts.map(post => {
              // 1. Buscamos si tiene imagen real, si no, ponemos placeholder
              const imageUrl = post.mediaUrls && post.mediaUrls.length > 0 ? post.mediaUrls[0].thumbnailUrl : 'https://placehold.co/300x400/cccccc/ffffff?text=Sin+Imagen'

              // 2. Adivinamos el tipo de post leyendo su URL
              let postType = 'IMAGE'
              if (post.postUrl && post.postUrl.includes('reel')) postType = 'REEL'
              else if (post.mediaUrls && post.mediaUrls[0] && post.mediaUrls[0].url.includes('.mp4')) postType = 'VIDEO'

              return {
                id: post.id,
                type: postType,
                // Ponemos números de prueba porque la API estándar no da métricas
                reach: Math.floor(Math.random() * 1000) + 200,
                interactions: Math.floor(Math.random() * 100) + 10,
                saved: 0,
                img: imageUrl,
              }
            })
          : // Si falla Hootsuite, caemos en los datos de respaldo
            [
              { id: 1, type: 'IMAGE', reach: 860, interactions: 37, saved: 1, img: 'https://placehold.co/300x400/ac2d72/ffffff?text=Pizza+Post' },
              { id: 2, type: 'CAROUSEL', reach: 482, interactions: 22, saved: 0, img: 'https://placehold.co/300x400/9835fc/ffffff?text=Promo+Post' },
              { id: 3, type: 'IMAGE', reach: 473, interactions: 16, saved: 1, img: 'https://placehold.co/300x400/002d23/ffffff?text=Team+Post' },
            ],
    },
    instagram: {
      // AQUÍ INYECTAMOS EL NOMBRE REAL DE HOOTSUITE (si existe), si no, usamos el de prueba
      username: hootsuiteData ? hootsuiteData.instagram.username : 'Pluxee IG',
      avatar: hootsuiteData ? hootsuiteData.instagram.avatar : '',

      kpis: {
        followers: 2677,
        new_followers: '+58',
        engagement_rate: '19.01%',
        stories_metrics: { total: 18, forward: '1,000', back: 71, exit: 310 },
      },
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
        total: 84,
        escalated: 31,
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

  if (hootsuiteData) {
    console.log('¡Datos reales obtenidos de Hootsuite y listos para enviar al frontend!')
  } else {
    console.log('Usando datos de respaldo al 100%...')
  }

  // 3. Enviamos el reporte completo al frontend
  res.json(fullReport)
})

// ==========================================
// RUTAS DE AUTENTICACIÓN OAUTH 2.0
// ==========================================

app.get('/api/auth/login', (req, res) => {
  const redirectUri = 'http://localhost:3000/api/auth/callback'
  const authUrl = `https://platform.hootsuite.com/oauth2/auth?response_type=code&client_id=${process.env.HOOTSUITE_CLIENT_ID}&scope=offline&redirect_uri=${redirectUri}`
  res.redirect(authUrl)
})

app.get('/api/auth/callback', async (req, res) => {
  const code = req.query.code
  const redirectUri = 'http://localhost:3000/api/auth/callback'
  const credentials = Buffer.from(`${process.env.HOOTSUITE_CLIENT_ID}:${process.env.HOOTSUITE_CLIENT_SECRET}`).toString('base64')

  try {
    const response = await axios.post('https://platform.hootsuite.com/oauth2/token', `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`, {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const userToken = response.data.access_token
    console.log('=========================================')
    console.log('¡ÉXITO! TU NUEVO TOKEN DE USUARIO ES:')
    console.log(userToken)
    console.log('=========================================')

    res.send('¡Autorización exitosa! Revisa tu terminal en VS Code para copiar tu Token. Ya puedes cerrar esta ventana.')
  } catch (error) {
    res.send('Error en la autorización: ' + (error.response?.data?.errors[0]?.message || error.message))
  }
})

// Iniciamos el servidor
app.listen(3000, () => console.log('Backend centralizado corriendo en el puerto 3000'))
