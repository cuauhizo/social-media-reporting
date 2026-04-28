const { pool } = require('../utils/db')

// 1. OBTENER
const getMetricas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT clave, valor FROM metricas_globales')
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
    console.error('Error en updateMetricas:', error)
    res.status(500).json({ error: 'Error interno al actualizar caso.' })
  }
}

// Exportamos todas las funciones
module.exports = { getMetricas, updateMetricas }
