const { pool } = require('../utils/db')

// 1. OBTENER
const getMetricas = async (req, res) => {
  const { periodo } = req.query // El frontend enviará ?periodo=2026-03
  if (!periodo) return res.status(400).json({ error: 'El periodo es necesario' })

  try {
    const [rows] = await pool.query('SELECT clave, valor FROM metricas_globales WHERE periodo = ?', [periodo])
    // Transformamos el arreglo de BD a un objeto de JS más fácil de leer en Vue
    const metricasObj = rows.reduce((acc, row) => {
      acc[row.clave] = row.valor
      return acc
    }, {})
    res.json(metricasObj)
  } catch (error) {
    console.error('Error en getMetricas:', error)
    res.status(500).json({ error: 'Error interno al obtener getMetricas.' })
  }
}

// 3. EDITAR
const updateMetricas = async (req, res) => {
  const { periodo, ...valoresMetricas } = req.body
  if (!periodo) return res.status(400).json({ error: 'El periodo es necesario' })

  try {
    const connection = await pool.getConnection()

    // Iteramos sobre las llaves del objeto y actualizamos MySQL
    for (const [clave, valor] of Object.entries(valoresMetricas)) {
      await connection.query(
        `
        INSERT INTO metricas_globales (clave, valor, periodo) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE valor = VALUES(valor)
      `,
        [clave, parseInt(valor) || 0, periodo],
      )
    }

    connection.release()
    res.json({ message: 'Métricas actualizadas correctamente' })
  } catch (error) {
    console.error('Error en updateMetricas:', error)
    res.status(500).json({ error: 'Error interno al actualizar caso.' })
  }
}

// Exportamos todas las funciones
module.exports = { getMetricas, updateMetricas }
