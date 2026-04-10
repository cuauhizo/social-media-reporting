const express = require('express')
const router = express.Router()
const { pool } = require('../utils/db')

// 1. OBTENER todas las métricas en formato de Objeto (Ej: { cs_total: 99, msj_fb: 50 })
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT clave, valor FROM metricas_globales')
    // Transformamos el arreglo de BD a un objeto de JS más fácil de leer en Vue
    const metricasObj = rows.reduce((acc, row) => {
      acc[row.clave] = row.valor
      return acc
    }, {})
    res.json(metricasObj)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 2. ACTUALIZAR múltiples métricas a la vez
router.post('/', async (req, res) => {
  const metricas = req.body // Esperamos un objeto { cs_total: 100, msj_fb: 60 }
  try {
    const connection = await pool.getConnection()

    // Iteramos sobre las llaves del objeto y actualizamos MySQL
    for (const [clave, valor] of Object.entries(metricas)) {
      await connection.query(
        `
        INSERT INTO metricas_globales (clave, valor) 
        VALUES (?, ?) 
        ON DUPLICATE KEY UPDATE valor = VALUES(valor)
      `,
        [clave, parseInt(valor) || 0],
      )
    }

    connection.release()
    res.json({ message: 'Métricas actualizadas correctamente' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
