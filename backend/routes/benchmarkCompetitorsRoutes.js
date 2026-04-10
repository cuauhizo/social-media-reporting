const express = require('express')
const router = express.Router()
const { pool } = require('../utils/db')

// Obtener todos los competidores
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM benchmark_competitors ORDER BY is_main_brand DESC, followers DESC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Guardar o actualizar un competidor
router.post('/', async (req, res) => {
  const { brand_name, description, posts_count, frequency, interaction, followers, gained_followers, engagement_rate, is_main_brand } = req.body
  try {
    const [result] = await pool.query(
      `INSERT INTO benchmark_competitors 
      (brand_name, description, posts_count, frequency, interaction, followers, gained_followers, engagement_rate, is_main_brand) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [brand_name, description || '', posts_count || 0, frequency || 0, interaction || 0, followers || 0, gained_followers || 0, engagement_rate || 0, is_main_brand || 0],
    )
    res.json({ id: result.insertId, brand_name })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Eliminar un competidor
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM benchmark_competitors WHERE id = ?', [req.params.id])
    res.json({ message: 'Competidor eliminado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
