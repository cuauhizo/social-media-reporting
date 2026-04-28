const { pool } = require('../utils/db')

// 1. OBTENER
const getContexto = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contexto_rrss ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    console.error('Error en getContexto:', error)
    res.status(500).json({ error: 'Error interno al obtener el contexto.' }) // 🔒 Seguro
  }
}

// 2. AGREGAR
const addContexto = async (req, res) => {
  const { punto } = req.body
  try {
    const [result] = await pool.query('INSERT INTO contexto_rrss (punto) VALUES (?)', [punto])
    res.json({ id: result.insertId, punto })
  } catch (error) {
    console.error('Error en addContexto:', error)
    res.status(500).json({ error: 'Error interno al guardar el punto de contexto.' })
  }
}

// 3. EDITAR
const updateContexto = async (req, res) => {
  const { id } = req.params
  const { punto } = req.body
  try {
    await pool.query('UPDATE contexto_rrss SET punto = ? WHERE id = ?', [punto, id])
    res.json({ message: 'Punto actualizado' })
  } catch (error) {
    console.error('Error en updateContexto:', error)
    res.status(500).json({ error: 'Error interno al actualizar el contexto.' })
  }
}

// 4. BORRAR
const deleteContexto = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM contexto_rrss WHERE id = ?', [id])
    res.json({ message: 'Punto eliminado' })
  } catch (error) {
    console.error('Error en deleteContexto:', error)
    res.status(500).json({ error: 'Error interno al eliminar el contexto.' })
  }
}

// Exportamos todas las funciones
module.exports = { getContexto, addContexto, updateContexto, deleteContexto }
