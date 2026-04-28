const { pool } = require('../utils/db')

// 1. OBTENER
const getCompromisos = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM compromisos ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    console.error('Error en getCompromisos:', error)
    res.status(500).json({ error: 'Error interno al obtener las propuestas.' })
  }
}

// 2. AGREGAR
const addCompromiso = async (req, res) => {
  const { compromiso } = req.body
  try {
    const [result] = await pool.query('INSERT INTO compromisos (compromiso) VALUES (?)', [compromiso])
    res.json({ id: result.insertId, compromiso })
  } catch (error) {
    console.error('Error en addCompromiso:', error)
    res.status(500).json({ error: 'Error interno al guardar la compromiso.' })
  }
}

// 3. EDITAR
const updateCompromiso = async (req, res) => {
  const { id } = req.params
  const { compromiso } = req.body
  try {
    await pool.query('UPDATE compromisos SET compromiso = ? WHERE id = ?', [compromiso, id])
    res.json({ message: 'compromiso actualizado' })
  } catch (error) {
    console.error('Error en updateCompromiso:', error)
    res.status(500).json({ error: 'Error interno al actualizar compromiso.' })
  }
}

// 4. BORRAR
const deleteCompromiso = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM compromisos WHERE id = ?', [id])
    res.json({ message: 'compromiso eliminado' })
  } catch (error) {
    console.error('Error en deleteCompromiso:', error)
    res.status(500).json({ error: 'Error interno al eliminar compromiso.' })
  }
}

// Exportamos todas las funciones
module.exports = { getCompromisos, addCompromiso, updateCompromiso, deleteCompromiso }
