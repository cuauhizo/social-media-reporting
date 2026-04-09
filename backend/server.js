require('dotenv').config()
const express = require('express')
const cors = require('cors')

// Importamos nuestras rutas ordenadas
const reportRoutes = require('./routes/reportRoutes')
const authRoutes = require('./routes/authRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const contextoRoutes = require('./routes/contextoRoutes')

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())

// ==========================================
// REGISTRO DE RUTAS (ROUTER)
// ==========================================
app.use('/api/reports', reportRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/contexto', contextoRoutes)

// Iniciamos el servidor con puerto dinámico (Mejor práctica para Producción)
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Backend centralizado corriendo perfectamente en el puerto ${PORT}`)
})
