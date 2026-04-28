const { pool } = require('../utils/db')

// 1. OBTENER
const getBenchmarkInsights = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM benchmark_insights ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    console.error('Error en getBenchmarkInsights:', error)
    res.status(500).json({ error: 'Error interno al obtener las BenchmarkInsights.' })
  }
}

// 2. AGREGAR
const addBenchmarkInsights = async (req, res) => {
  const { insight } = req.body
  try {
    const [result] = await pool.query('INSERT INTO benchmark_insights (insight) VALUES (?)', [insight])
    res.json({ id: result.insertId, insight })
  } catch (error) {
    console.error('Error en addBenchmarkInsights:', error)
    res.status(500).json({ error: 'Error interno al guardar la insight.' })
  }
}

// 3. EDITAR
const updateBenchmarkInsights = async (req, res) => {
  const { id } = req.params
  const { insight } = req.body
  try {
    await pool.query('UPDATE benchmark_insights SET insight = ? WHERE id = ?', [insight, id])
    res.json({ message: 'Insight actualizado' })
  } catch (error) {
    console.error('Error en updateBenchmarkInsights:', error)
    res.status(500).json({ error: 'Error interno al actualizar Insight.' })
  }
}

// 4. BORRAR
const deleteBenchmarkInsights = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM benchmark_insights WHERE id = ?', [id])
    res.json({ message: 'Insight eliminado' })
  } catch (error) {
    console.error('Error en deleteBenchmarkInsights:', error)
    res.status(500).json({ error: 'Error interno al eliminar Insight.' })
  }
}

// Exportamos todas las funciones
module.exports = { getBenchmarkInsights, addBenchmarkInsights, updateBenchmarkInsights, deleteBenchmarkInsights }
