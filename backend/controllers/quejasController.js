const { pool } = require('../utils/db')

// 1. OBTENER
const getQuejas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM quejas_rrss ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    // 🛡️ SEGURIDAD: El error real se queda en la terminal de tu servidor (para ti)
    console.error('Error en getQuejas:', error)
    // 🛡️ SEGURIDAD: El usuario solo recibe un mensaje genérico
    res.status(500).json({ error: 'Error interno al obtener las quejas.' })
  }
}

// 2. AGREGAR
const addQueja = async (req, res) => {
  const { queja } = req.body
  try {
    const [result] = await pool.query('INSERT INTO quejas_rrss (queja) VALUES (?)', [queja])
    res.json({ id: result.insertId, queja })
  } catch (error) {
    console.error('Error en addQueja:', error)
    res.status(500).json({ error: 'Error interno al guardar la queja.' })
  }
}

// 3. EDITAR
const updateQueja = async (req, res) => {
  const { id } = req.params
  const { queja } = req.body
  try {
    await pool.query('UPDATE quejas_rrss SET queja = ? WHERE id = ?', [queja, id])
    res.json({ message: 'Queja actualizada' })
  } catch (error) {
    console.error('Error en updateQueja:', error)
    res.status(500).json({ error: 'Error interno al actualizar la queja.' })
  }
}

// 4. BORRAR
const deleteQueja = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM quejas_rrss WHERE id = ?', [id])
    res.json({ message: 'Queja eliminada' })
  } catch (error) {
    console.error('Error en deleteQueja:', error)
    res.status(500).json({ error: 'Error interno al eliminar la queja.' })
  }
}

// Exportamos todas las funciones
module.exports = { getQuejas, addQueja, updateQueja, deleteQueja }
