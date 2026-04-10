const path = require('path')
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
const metricasRoutes = require('./routes/metricasRoutes')
const casosCSRoutes = require('./routes/casosCSRoutes')
const benchmarkInsightsRoutes = require('./routes/benchmarkInsightsRoutes')
const benchmarkCompetitorsRoutes = require('./routes/benchmarkCompetitorsRoutes')
const conclusionesRoutes = require('./routes/conclusionesRoutes')
const postImagesRoutes = require('./routes/postImagesRoutes')

const app = express()

// Middlewares
app.use(cors())
app.use(express.json())
// Exponer la carpeta de imágenes públicamente
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

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
app.use('/api/metricas', metricasRoutes)
app.use('/api/casos-cs', casosCSRoutes)
app.use('/api/benchmark-insights', benchmarkInsightsRoutes)
app.use('/api/benchmark-competitors', benchmarkCompetitorsRoutes)
app.use('/api/conclusiones', conclusionesRoutes)
app.use('/api/post-images', postImagesRoutes)

// Iniciamos el servidor con puerto dinámico (Mejor práctica para Producción)
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Backend centralizado corriendo perfectamente en el puerto ${PORT}`)
})
