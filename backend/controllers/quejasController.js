const { pool } = require('../utils/db')

// 1. OBTENER
const getQuejas = async (req, res) => {
  const { periodo } = req.query // El frontend enviará ?periodo=2026-03
  if (!periodo) return res.status(400).json({ error: 'El periodo es necesario' })

  try {
    const [rows] = await pool.query('SELECT * FROM quejas_rrss WHERE periodo = ? ORDER BY id ASC', [periodo])
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
  const { queja, periodo } = req.body
  if (!periodo) return res.status(400).json({ error: 'El periodo es necesario' })

  try {
    const [result] = await pool.query('INSERT INTO quejas_rrss (queja, periodo) VALUES (?, ?)', [queja, periodo])
    res.json({ id: result.insertId, queja, periodo })
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
