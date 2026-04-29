const { pool } = require('../utils/db')

// 1. OBTENER
const getConclusiones = async (req, res) => {
  const { periodo } = req.query // El frontend enviará ?periodo=2026-03
  if (!periodo) return res.status(400).json({ error: 'El periodo es necesario' })

  try {
    const [rows] = await pool.query('SELECT * FROM conclusiones WHERE periodo = ? ORDER BY id ASC', [periodo])
    res.json(rows)
  } catch (error) {
    console.error('Error en getConclusiones:', error)
    res.status(500).json({ error: 'Error interno al obtener las propuestas.' })
  }
}

// 2. AGREGAR
const addConclusiones = async (req, res) => {
  const { conclusion, periodo } = req.body
  if (!periodo) return res.status(400).json({ error: 'El periodo es necesario' })

  try {
    const [result] = await pool.query('INSERT INTO conclusiones (conclusion, periodo) VALUES (?, ?)', [conclusion, periodo])
    res.json({ id: result.insertId, conclusion, periodo })
  } catch (error) {
    console.error('Error en addConclusiones:', error)
    res.status(500).json({ error: 'Error interno al guardar la conclusion.' })
  }
}

// 3. EDITAR
const updateConclusiones = async (req, res) => {
  const { id } = req.params
  const { conclusion } = req.body
  try {
    await pool.query('UPDATE conclusiones SET conclusion = ? WHERE id = ?', [conclusion, id])
    res.json({ message: 'Conclusión actualizada' })
  } catch (error) {
    console.error('Error en updateConclusiones:', error)
    res.status(500).json({ error: 'Error interno al actualizar conclusion.' })
  }
}

// 4. BORRAR
const deleteConclusiones = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM conclusiones WHERE id = ?', [id])
    res.json({ message: 'Conclusión eliminada' })
  } catch (error) {
    console.error('Error en deleteConclusiones:', error)
    res.status(500).json({ error: 'Error interno al eliminar compromiso.' })
  }
}

// Exportamos todas las funciones
module.exports = { getConclusiones, addConclusiones, updateConclusiones, deleteConclusiones }
