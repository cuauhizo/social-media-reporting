const axios = require('axios')
require('dotenv').config()

const HOOTSUITE_API_URL = 'https://platform.hootsuite.com/v1'

// 1. Función para obtener el Token de acceso
async function getAccessToken() {
  try {
    // Hootsuite usa OAuth 2.0. Codificamos las credenciales en Base64
    const credentials = Buffer.from(`${process.env.HOOTSUITE_CLIENT_ID}:${process.env.HOOTSUITE_CLIENT_SECRET}`).toString('base64')

    const response = await axios.post(
      'https://platform.hootsuite.com/oauth2/token',
      'grant_type=client_credentials', // El tipo de permiso para servidores
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    return response.data.access_token
  } catch (error) {
    console.error('Error obteniendo el token de Hootsuite:', error.message)
    return null
  }
}

// 2. Función para obtener métricas reales de tus perfiles
async function getSocialMetrics() {
  const token = await getAccessToken()

  if (!token) {
    // Si no hay token (porque aún no tienes las llaves), devolvemos null
    return null
  }

  try {
    // Ejemplo: Pidiendo la lista de perfiles sociales conectados
    const response = await axios.get(`${HOOTSUITE_API_URL}/socialProfiles`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // Aquí procesarías los datos de Hootsuite para que encajen en tu reporte
    return response.data
  } catch (error) {
    console.error('Error consultando la API de Hootsuite:', error.message)

    // Agregamos esta validación para ver el JSON real del error que manda Hootsuite
    if (error.response) {
      console.error('Detalle de Hootsuite:', error.response.data)
    }

    return null
  }
}

module.exports = { getSocialMetrics }
