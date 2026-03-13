const express = require('express')
const cors = require('cors')
const { getSocialMetrics } = require('./hootsuiteService')
const app = express()

app.use(cors())

// Endpoint maestro RESTful
app.get('/api/reports/:periodId', async (req, res) => {
  // req.params.periodId podría ser "2026-02"

  // 1. Intentamos traer datos reales de Hootsuite
  const hootsuiteData = await getSocialMetrics()

  // Aquí en el futuro decidirás:
  // ¿Leo de MySQL? ¿Consulto Hootsuite? ¿Leo un Excel parseado?

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
      topPosts: [
        {
          id: 1,
          type: 'IMAGE',
          reach: 860,
          interactions: 37,
          saved: 1,
          img: 'https://placehold.co/300x400/ac2d72/ffffff?text=Pizza+Post',
        },
        {
          id: 2,
          type: 'CAROUSEL',
          reach: 482,
          interactions: 22,
          saved: 0,
          img: 'https://placehold.co/300x400/9835fc/ffffff?text=Promo+Post',
        },
        {
          id: 3,
          type: 'IMAGE',
          reach: 473,
          interactions: 16,
          saved: 1,
          img: 'https://placehold.co/300x400/002d23/ffffff?text=Team+Post',
        },
      ],
    },
    instagram: {
      kpis: {
        followers: 2677,
        new_followers: '+58',
        engagement_rate: '19.01%',
        stories_metrics: {
          total: 18,
          forward: '1,000',
          back: 71,
          exit: 310,
        },
      },
      topPosts: [
        {
          id: 'ig_p1',
          type: 'CAROUSEL',
          views: 771,
          interactions: 348,
          saved: 1,
          img: 'https://placehold.co/300x400/e1306c/ffffff?text=IG+Post+1',
        },
        {
          id: 'ig_p2',
          type: 'CAROUSEL',
          views: 733,
          interactions: 32,
          saved: 1,
          img: 'https://placehold.co/300x400/e1306c/ffffff?text=IG+Post+2',
        },
      ],
      topStories: [
        {
          id: 'ig_s1',
          type: 'STORY',
          views: 418,
          interactions: 5,
          shares: 0,
          img: 'https://placehold.co/300x533/f56040/ffffff?text=IG+Story+1',
        },
        {
          id: 'ig_s2',
          type: 'STORY',
          views: 368,
          interactions: 2,
          shares: 0,
          img: 'https://placehold.co/300x533/f56040/ffffff?text=IG+Story+2',
        },
      ],
    },
    benchmarking: [
      {
        id: 1,
        name: 'Si Vale',
        description: 'Una empresa líder en soluciones en tarjetas...',
        followers: '217.3 mil',
        following: '1209',
        posts: 10,
      },
      {
        id: 2,
        name: 'Edenred México',
        description: 'Somos líderes a nivel mundial en soluciones de pago...',
        followers: '212.8 mil',
        following: '1529',
        posts: 3,
      },
      {
        id: 3,
        name: 'Toka',
        description: 'En Toka creemos en el constante cambio...',
        followers: '74.2 mil',
        following: '76',
        posts: 10,
      },
      {
        id: 4,
        name: 'Efectivale',
        description: 'Fundada en 1989 en la CDMX, ofrece soluciones...',
        followers: '13.6 mil',
        following: '157',
        posts: 12,
      },
      {
        id: 5,
        name: 'Pluxee.MX',
        description: 'Servicio financiero',
        followers: '3.9 mil',
        following: '135',
        posts: 25,
        isClient: true,
      },
    ],
    customerService: {
      messages: {
        total: 84,
        escalated: 31,
        breakdown: {
          facebook: { count: 63, percentage: 75.0 },
          instagram: { count: 21, percentage: 25.0 },
        },
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

  // Simulamos un retraso de red para ver el estado de "Carga" en Vue
  // setTimeout(() => {
  //   res.json(fullReport)
  // }, 800)

  // 3. Si Hootsuite nos respondió, reemplazamos los datos falsos con los reales
  if (hootsuiteData) {
    console.log('¡Datos reales obtenidos de Hootsuite!')
    // Ejemplo: fullReport.facebook.kpis.followers = hootsuiteData.algun_campo_de_hootsuite;
  } else {
    console.log('Usando datos de respaldo (Esperando API Key de Hootsuite)...')
  }
  res.json(fullReport)
  // console.log(fullReport)
})

// 1. Ruta para mandarte a iniciar sesión en Hootsuite
app.get('/api/auth/login', (req, res) => {
  const redirectUri = 'http://localhost:3000/api/auth/callback'
  // Te enviamos a la ventana de login de Hootsuite
  const authUrl = `https://platform.hootsuite.com/oauth2/auth?response_type=code&client_id=${process.env.HOOTSUITE_CLIENT_ID}&scope=offline&redirect_uri=${redirectUri}`
  res.redirect(authUrl)
})

// 2. Ruta donde Hootsuite te regresa después de aceptar
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

    // ¡ESTE ES EL TOKEN DE USUARIO QUE NECESITAMOS!
    const userToken = response.data.access_token
    console.log('=========================================')
    console.log('¡ÉXITO! TU TOKEN DE USUARIO ES:')
    console.log(userToken)
    console.log('=========================================')

    res.send('¡Autorización exitosa! Revisa tu terminal en VS Code para copiar tu Token. Ya puedes cerrar esta ventana.')
  } catch (error) {
    res.send('Error en la autorización: ' + (error.response?.data?.errors[0]?.message || error.message))
  }
})

app.listen(3000, () => console.log('Backend centralizado en puerto 3000'))
