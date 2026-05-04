const jwt = require('jsonwebtoken')
require('dotenv').config()

const protectWriteRoutes = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'OPTIONS' || req.originalUrl.includes('/login')) {
    return next()
  }

  const tokenHeader = req.headers.authorization
  if (!tokenHeader || !tokenHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Acceso denegado. Inicia sesión en el Admin.' })
  }

  const token = tokenHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Sesión expirada o inválida. Vuelve a iniciar sesión.' })
  }
}

module.exports = { protectWriteRoutes }
