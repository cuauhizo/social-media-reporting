const axios = require('axios')
const { getTokens, saveTokens } = require('./utils/db') //  IMPORTAMOS MySQL
require('dotenv').config()

const HOOTSUITE_API_URL = 'https://platform.hootsuite.com/v1'

//  RENOVACIÓN SILENCIOSA
async function autoRenewToken(oldRefreshToken) {
  console.log('🔄 Token caducado. Solicitando uno nuevo a Hootsuite silenciosamente...')
  const credentials = Buffer.from(`${process.env.HOOTSUITE_CLIENT_ID}:${process.env.HOOTSUITE_CLIENT_SECRET}`).toString('base64')

  const response = await axios.post('https://platform.hootsuite.com/oauth2/token', `grant_type=refresh_token&refresh_token=${oldRefreshToken}`, {
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  const newAccess = response.data.access_token
  const newRefresh = response.data.refresh_token

  await saveTokens(newAccess, newRefresh) // Actualizamos MySQL
  console.log('✅ ¡Token renovado en MySQL con éxito!')

  return newAccess
}

async function getSocialMetrics() {
  const fbId = process.env.PLUXEE_FB_ID
  const igId = process.env.PLUXEE_IG_ID

  // 1. LEEMOS EL TOKEN DESDE MySQL
  const tokens = await getTokens()
  if (!tokens || !tokens.access_token) {
    console.error('⚠️ No hay tokens en MySQL. Por favor entra a /api/auth/login en tu navegador primero.')
    return null
  }

  let currentToken = tokens.access_token

  try {
    const fetchHootsuiteData = async tokenString => {
      const axiosConfig = { headers: { Authorization: `Bearer ${tokenString}` } }
      const startTime = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString()
      const endTime = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString()

      const [fbProfile, igProfile, fbPosts, igPosts] = await Promise.all([
        axios.get(`${HOOTSUITE_API_URL}/socialProfiles/${fbId}`, axiosConfig),
        axios.get(`${HOOTSUITE_API_URL}/socialProfiles/${igId}`, axiosConfig),
        axios.get(`${HOOTSUITE_API_URL}/messages?socialProfileIds=${fbId}&startTime=${startTime}&endTime=${endTime}&state=SENT`, axiosConfig),
        axios.get(`${HOOTSUITE_API_URL}/messages?socialProfileIds=${igId}&startTime=${startTime}&endTime=${endTime}&state=SENT`, axiosConfig),
      ])

      return {
        facebook: { username: fbProfile.data.data.socialNetworkUsername, avatar: fbProfile.data.data.avatarUrl, realPosts: fbPosts.data.data },
        instagram: { username: igProfile.data.data.socialNetworkUsername, avatar: igProfile.data.data.avatarUrl, realPosts: igPosts.data.data },
      }
    }

    try {
      // 2. INTENTAMOS USAR EL TOKEN ACTUAL DE MYSQL
      return await fetchHootsuiteData(currentToken)
    } catch (error) {
      // 3. SI CADUCÓ, RENOVAMOS Y REINTENTAMOS
      const isUnauthorized = error.response?.status === 401 || error.response?.data?.error === 'request_forbidden' || error.response?.data?.error === 'invalid_token'

      if (isUnauthorized) {
        currentToken = await autoRenewToken(tokens.refresh_token)
        return await fetchHootsuiteData(currentToken)
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('❌ Error consultando la API de Hootsuite:', error.response?.data || error.message)
    return null
  }
}

module.exports = { getSocialMetrics }
