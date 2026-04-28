const { pool } = require('../utils/db')

// 1. OBTENER
const getPropuestas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM propuestas ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    console.error('Error en getPropuestas:', error)
    res.status(500).json({ error: 'Error interno al obtener las propuestas.' })
  }
}

// 2. AGREGAR
const addPropuesta = async (req, res) => {
  const { propuesta } = req.body
  try {
    const [result] = await pool.query('INSERT INTO propuestas (propuesta) VALUES (?)', [propuesta])
    res.json({ id: result.insertId, propuesta })
  } catch (error) {
    console.error('Error en addPropuesta:', error)
    res.status(500).json({ error: 'Error interno al guardar la propuesta.' })
  }
}

// 3. EDITAR
const updatePropuesta = async (req, res) => {
  const { id } = req.params
  const { propuesta } = req.body
  try {
    await pool.query('UPDATE propuestas SET propuesta = ? WHERE id = ?', [propuesta, id])
    res.json({ message: 'propuesta actualizado' })
  } catch (error) {
    console.error('Error en updatePropuesta:', error)
    res.status(500).json({ error: 'Error interno al actualizar la propuesta.' })
  }
}

// 4. BORRAR
const deletePropuesta = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM propuestas WHERE id = ?', [id])
    res.json({ message: 'propuesta eliminada' })
  } catch (error) {
    console.error('Error en deletePropuesta:', error)
    res.status(500).json({ error: 'Error interno al eliminar la propuesta.' })
  }
}

// Exportamos todas las funciones
module.exports = { getPropuestas, addPropuesta, updatePropuesta, deletePropuesta }
