const { pool } = require('../utils/db')

// 1. OBTENER LAS MÉTRICAS DE UNA RED EN UN MES
const getNetworkKpis = async (req, res) => {
  const { periodo, red_social } = req.query
  if (!periodo || !red_social) return res.status(400).json({ error: 'Faltan parámetros' })

  try {
    const [rows] = await pool.query('SELECT * FROM network_kpis WHERE periodo = ? AND red_social = ?', [periodo, red_social])
    // Si no hay datos, devolvemos un objeto vacío para que el Frontend no explote
    res.json(rows[0] || {})
  } catch (error) {
    console.error('Error en getNetworkKpis:', error)
    res.status(500).json({ error: 'Error interno al obtener los KPIs de la red.' })
  }
}

// 2. ACTUALIZAR LAS MÉTRICAS MANUALMENTE
const updateNetworkKpis = async (req, res) => {
  const { periodo, red_social } = req.body
  if (!periodo || !red_social) return res.status(400).json({ error: 'Faltan parámetros' })

  // Sacamos el periodo y la red social del objeto, nos quedamos solo con los números a actualizar
  const updateFields = { ...req.body }
  delete updateFields.periodo
  delete updateFields.red_social
  delete updateFields.id // Por seguridad, no permitimos cambiar el ID

  // Si nos mandaron un objeto vacío, no hacemos nada
  if (Object.keys(updateFields).length === 0) {
    return res.status(400).json({ error: 'No hay datos para actualizar' })
  }

  // Magia: Construimos el "SET fb_clics = ?, fb_shares = ?" de forma automática
  const setClause = Object.keys(updateFields)
    .map(key => `${key} = ?`)
    .join(', ')
  const values = Object.values(updateFields)

  try {
    const [result] = await pool.query(`UPDATE network_kpis SET ${setClause} WHERE periodo = ? AND red_social = ?`, [...values, periodo, red_social])

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No se encontraron métricas para ese mes. Sube primero el CSV.' })
    }

    res.json({ message: 'Métricas actualizadas correctamente' })
  } catch (error) {
    console.error('Error en updateNetworkKpis:', error)
    res.status(500).json({ error: 'Error interno al actualizar las métricas.' })
  }
}

module.exports = { getNetworkKpis, updateNetworkKpis }
