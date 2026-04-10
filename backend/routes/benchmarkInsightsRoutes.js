const express = require('express')
const router = express.Router()
const { pool } = require('../utils/db')

// OBTENER todos los insights de benchmark
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM benchmark_insights ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// AGREGAR
router.post('/', async (req, res) => {
  const { insight } = req.body
  try {
    const [result] = await pool.query('INSERT INTO benchmark_insights (insight) VALUES (?)', [insight])
    res.json({ id: result.insertId, insight })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// EDITAR
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { insight } = req.body
  try {
    await pool.query('UPDATE benchmark_insights SET insight = ? WHERE id = ?', [insight, id])
    res.json({ message: 'Insight actualizado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// BORRAR
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM benchmark_insights WHERE id = ?', [id])
    res.json({ message: 'Insight eliminado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
