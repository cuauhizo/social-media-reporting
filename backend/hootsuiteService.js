const axios = require('axios')
require('dotenv').config()

const HOOTSUITE_API_URL = 'https://platform.hootsuite.com/v1'

/**
 * Obtiene los perfiles y publicaciones (último mes) de Facebook e Instagram desde Hootsuite.
 * @returns {Object|null} Objeto con la información formateada para el frontend o null si hay error.
 */
async function getSocialMetrics() {
  const token = process.env.HOOTSUITE_ACCESS_TOKEN
  const fbId = process.env.PLUXEE_FB_ID
  const igId = process.env.PLUXEE_IG_ID

  // Verificación de seguridad: Si falta algún dato del .env, detenemos la función
  if (!token || !fbId || !igId) {
    console.error('⚠️ Faltan credenciales o IDs de Hootsuite en el archivo .env')
    return null
  }

  try {
    // Configuración base de autorización para todas las peticiones a Hootsuite
    const axiosConfig = {
      headers: { Authorization: `Bearer ${token}` },
    }

    // 1. Calcular el rango de fechas (Primer y último día del MES ANTERIOR)
    const startTime = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString()
    const endTime = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString()

    // 2. Obtener la información pública de los perfiles (Para extraer nombre de usuario y avatar)
    const fbResponse = await axios.get(`${HOOTSUITE_API_URL}/socialProfiles/${fbId}`, axiosConfig)
    const igResponse = await axios.get(`${HOOTSUITE_API_URL}/socialProfiles/${igId}`, axiosConfig)

    // 3. Obtener el historial de publicaciones enviadas (state=SENT) en el rango de fechas
    const fbPostsResponse = await axios.get(`${HOOTSUITE_API_URL}/messages?socialProfileIds=${fbId}&startTime=${startTime}&endTime=${endTime}&state=SENT`, axiosConfig)
    const igPostsResponse = await axios.get(`${HOOTSUITE_API_URL}/messages?socialProfileIds=${igId}&startTime=${startTime}&endTime=${endTime}&state=SENT`, axiosConfig)

    // 4. Extraer el contenido útil de las respuestas de la API
    const fbData = fbResponse.data.data
    const igData = igResponse.data.data
    const fbPosts = fbPostsResponse.data.data
    const igPosts = igPostsResponse.data.data

    // 5. Empaquetar los datos reales y traducirlos al formato que espera nuestro Dashboard en Vue
    return {
      facebook: {
        username: fbData.socialNetworkUsername,
        avatar: fbData.avatarUrl,
        realPosts: fbPosts,
      },
      instagram: {
        username: igData.socialNetworkUsername,
        avatar: igData.avatarUrl,
        realPosts: igPosts,
      },
    }
  } catch (error) {
    console.error('❌ Error consultando la API de Hootsuite:', error.response?.data || error.message)
    return null
  }
}

module.exports = { getSocialMetrics }
