const axios = require('axios')
require('dotenv').config()

const HOOTSUITE_API_URL = 'https://platform.hootsuite.com/v1'

async function getSocialMetrics() {
  const token = process.env.HOOTSUITE_USER_TOKEN
  const fbId = process.env.PLUXEE_FB_ID
  const igId = process.env.PLUXEE_IG_ID

  // Si falta algún dato del .env, detenemos la función
  if (!token || !fbId || !igId) {
    // console.log('Faltan credenciales o IDs en el archivo .env')
    return null
  }

  try {
    // console.log('=========================================')
    // console.log('🎯 OBTENIENDO PERFILES Y POSTS DE PLUXEE...')

    // 1. Pedimos los datos exactos del Facebook de Pluxee
    const fbResponse = await axios.get(`${HOOTSUITE_API_URL}/socialProfiles/${fbId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // console.log(`fbResponse: ${JSON.stringify(fbResponse.data)}`)
    // console.log('=========================================')

    // 2. Pedimos los datos exactos del Instagram de Pluxee
    const igResponse = await axios.get(`${HOOTSUITE_API_URL}/socialProfiles/${igId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // 2. Calculamos las fechas para pedir los posts de los últimos 30 días
    // const endTime = new Date().toISOString() // Hoy
    // const startTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // Hace 30 días

    const startTime = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString()
    const endTime = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString()

    // 3. Le pedimos a Hootsuite los posts de Facebook publicados (state=SENT)
    // console.log('Buscando posts de Facebook de los últimos 30 días...')
    const fbPostsResponse = await axios.get(`${HOOTSUITE_API_URL}/messages?socialProfileIds=${fbId}&startTime=${startTime}&endTime=${endTime}&state=SENT`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    const fbPosts = fbPostsResponse.data.data
    // console.log(`✅ ¡Encontré ${fbPosts.length} posts publicados en Facebook!`)
    // console.log('=========================================')

    // AGREGA ESTA LÍNEA PARA INSPECCIONAR EL PRIMER POST:
    // console.log('👀 Estructura del primer post:', JSON.stringify(fbPosts[0], null, 2))
    // console.log('=========================================')

    const igData = igResponse.data.data

    // 3. Empaquetamos los datos reales para mandarlos a tu Frontend (Vue)
    // NOTA: Aquí es donde "traducimos" el idioma de Hootsuite al idioma de tu Dashboard
    return {
      facebook: {
        // Aquí pondremos las métricas reales
        username: fbResponse.data.data.socialNetworkUsername,
        avatar: fbResponse.data.data.avatarUrl,
        realPosts: fbPosts,
      },
      instagram: {
        username: igData.socialNetworkUsername,
        avatar: igData.avatarUrl,
        realPosts: [],
      },
    }
  } catch (error) {
    console.error('Error consultando los perfiles de Pluxee:', error.response?.data || error.message)
    return null
  }
}

module.exports = { getSocialMetrics }
