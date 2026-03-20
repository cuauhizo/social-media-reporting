const express = require('express')
const axios = require('axios')
const router = express.Router()

router.get('/login', (req, res) => {
  const redirectUri = 'http://localhost:3000/api/auth/callback'
  const authUrl = `https://platform.hootsuite.com/oauth2/auth?response_type=code&client_id=${process.env.HOOTSUITE_CLIENT_ID}&scope=offline&redirect_uri=${redirectUri}`
  res.redirect(authUrl)
})

router.get('/callback', async (req, res) => {
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

    console.log('=========================================')
    console.log('¡ÉXITO! TU NUEVO TOKEN DE USUARIO ES:')
    console.log(response.data.access_token)
    console.log('=========================================')

    res.send('¡Autorización exitosa! Revisa tu terminal en VS Code para copiar tu Token. Ya puedes cerrar esta ventana.')
  } catch (error) {
    res.send('Error en la autorización: ' + (error.response?.data?.errors[0]?.message || error.message))
  }
})

module.exports = router
