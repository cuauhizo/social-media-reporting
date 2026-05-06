const express = require('express')
const axios = require('axios')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { saveTokens } = require('../utils/db')

router.get('/login', (req, res) => {
  const redirectUri = `${process.env.BACKEND_URL}/api/auth/callback`
  const authUrl = `https://platform.hootsuite.com/oauth2/auth?response_type=code&client_id=${process.env.HOOTSUITE_CLIENT_ID}&scope=offline&redirect_uri=${redirectUri}`
  res.redirect(authUrl)
})

router.get('/callback', async (req, res) => {
  const code = req.query.code
  const redirectUri = `${process.env.BACKEND_URL}/api/auth/callback`
  const credentials = Buffer.from(`${process.env.HOOTSUITE_CLIENT_ID}:${process.env.HOOTSUITE_CLIENT_SECRET}`).toString('base64')

  try {
    const response = await axios.post('https://platform.hootsuite.com/oauth2/token', `grant_type=authorization_code&code=${code}&redirect_uri=${redirectUri}`, {
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    // GUARDAMOS EL TOKEN DIRECTO EN MySQL
    await saveTokens(response.data.access_token, response.data.refresh_token)

    console.log('✅ ¡Nuevos Tokens guardados en la Base de Datos MySQL!')
    res.send('¡Autorización exitosa! Tus tokens ya están en MySQL. Puedes cerrar esta ventana.')
  } catch (error) {
    res.send('Error en la autorización: ' + (error.response?.data?.errors[0]?.message || error.message))
  }
})

// NUEVA RUTA: Para renovar el token caducado sin iniciar sesión
// router.get('/refresh', async (req, res) => {
//   const refreshToken = process.env.HOOTSUITE_REFRESH_TOKEN
//   const credentials = Buffer.from(`${process.env.HOOTSUITE_CLIENT_ID}:${process.env.HOOTSUITE_CLIENT_SECRET}`).toString('base64')

//   if (!refreshToken) {
//     return res.status(400).send('No hay REFRESH_TOKEN en el archivo .env')
//   }

//   try {
//     const response = await axios.post('https://platform.hootsuite.com/oauth2/token', `grant_type=refresh_token&refresh_token=${refreshToken}`, {
//       headers: {
//         Authorization: `Basic ${credentials}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     })

//     console.log('=========================================')
//     console.log('🔄 ¡TOKEN RENOVADO EXITOSAMENTE!')
//     console.log('HOOTSUITE_ACCESS_TOKEN=', response.data.access_token)
//     console.log('HOOTSUITE_REFRESH_TOKEN=', response.data.refresh_token)
//     console.log('=========================================')

//     // Aquí, en un sistema avanzado, guardarías estos nuevos valores en una base de datos.
//     // Por ahora, solo los imprimimos para que los actualices en tu .env

//     res.send('Token renovado. Revisa la consola y actualiza tu .env con los nuevos valores.')
//   } catch (error) {
//     res.status(500).send('Error renovando el token: ' + (error.response?.data?.errors[0]?.message || error.message))
//   }
// })

// Login del Administrador
router.post('/login', (req, res) => {
  const { username, password } = req.body
  console.log('Intentando login...')
  console.log('Frontend mandó:', username, password)
  console.log('El .env tiene:', process.env.ADMIN_USER, process.env.ADMIN_PASS)

  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    const token = jwt.sign({ role: 'admin', user: username }, process.env.JWT_SECRET, { expiresIn: '8h' })

    res.json({ token, message: '¡Bienvenido al Panel de Control!' })
  } else {
    res.status(401).json({ error: 'Usuario o contraseña incorrectos' })
  }
})

module.exports = router
