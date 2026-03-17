const axios = require('axios')
require('dotenv').config()

const HOOTSUITE_API_URL = 'https://platform.hootsuite.com/v1'

async function getSocialMetrics() {
  const token = process.env.HOOTSUITE_USER_TOKEN

  if (!token) return null

  try {
    // 1. Obtenemos la lista de IDs (lo que ya hiciste)
    const response = await axios.get(`${HOOTSUITE_API_URL}/me/socialProfiles`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // 2. Extraemos los primeros 5 IDs para no saturar la API
    const perfiles = response.data.data.slice(0, 50)

    console.log('=========================================')
    console.log('🔍 TRADUCIENDO LOS IDs A NOMBRES REALES...')

    // 3. Vamos uno por uno preguntando su nombre
    for (let perfil of perfiles) {
      try {
        const detalle = await axios.get(`${HOOTSUITE_API_URL}/socialProfiles/${perfil.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const datos = detalle.data.data
        console.log(`📌 ID: ${datos.id} | Red: ${datos.type} | Cuenta: ${datos.socialNetworkUsername}`)
      } catch (err) {
        console.log(`No se pudo leer el ID ${perfil.id}`)
      }
    }
    console.log('=========================================')

    return response.data
  } catch (error) {
    console.error('Error consultando la API de Hootsuite:', error.response?.data || error.message)
    return null
  }
}

module.exports = { getSocialMetrics }
