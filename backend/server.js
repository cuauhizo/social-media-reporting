require('dotenv').config()
const express = require('express')
const cors = require('cors')

// Importamos nuestras rutas ordenadas
const reportRoutes = require('./routes/reportRoutes')
const authRoutes = require('./routes/authRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const contextoRoutes = require('./routes/contextoRoutes')
const quejasRoutes = require('./routes/quejasRoutes')
const propuestasRoutes = require('./routes/propuestasRoutes')
const compromisosRoutes = require('./routes/compromisosRoutes')

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
app.use('/api/quejas', quejasRoutes)
app.use('/api/propuestas', propuestasRoutes)
app.use('/api/compromisos', compromisosRoutes)

// Iniciamos el servidor con puerto dinámico (Mejor práctica para Producción)
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Backend centralizado corriendo perfectamente en el puerto ${PORT}`)
})
