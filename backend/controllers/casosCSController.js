const { pool } = require('../utils/db')

// 1. OBTENER
const getCasosCS = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM casos_cs ORDER BY cantidad DESC') // Los ordenamos de mayor a menor
    res.json(rows)
  } catch (error) {
    console.error('Error en getCasosCS:', error)
    res.status(500).json({ error: 'Error interno al obtener getCasosCS.' })
  }
}

// 2. AGREGAR
const addCasosCS = async (req, res) => {
  const { motivo, cantidad } = req.body
  try {
    const [result] = await pool.query('INSERT INTO casos_cs (motivo, cantidad) VALUES (?, ?)', [motivo, cantidad || 0])
    res.json({ id: result.insertId, motivo, cantidad })
  } catch (error) {
    console.error('Error en addCasosCS:', error)
    res.status(500).json({ error: 'Error interno al guardar la CasosCS.' })
  }
}

// 3. EDITAR
const updateCasosCS = async (req, res) => {
  const { id } = req.params
  const { motivo, cantidad } = req.body
  try {
    await pool.query('UPDATE casos_cs SET motivo = ?, cantidad = ? WHERE id = ?', [motivo, cantidad, id])
    res.json({ message: 'Caso actualizado' })
  } catch (error) {
    console.error('Error en updateCasosCS:', error)
    res.status(500).json({ error: 'Error interno al actualizar caso.' })
  }
}

// 4. BORRAR
const deleteCasosCS = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM casos_cs WHERE id = ?', [id])
    res.json({ message: 'Caso eliminado' })
  } catch (error) {
    console.error('Error en deleteCasosCS:', error)
    res.status(500).json({ error: 'Error interno al eliminar Caso.' })
  }
}

// Exportamos todas las funciones
module.exports = { getCasosCS, addCasosCS, updateCasosCS, deleteCasosCS }
