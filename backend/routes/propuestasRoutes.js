const express = require('express')
const router = express.Router()
const { pool } = require('../utils/db')

// 1. OBTENER todas las propuestas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM propuestas ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 2. AGREGAR una nueva propuesta
router.post('/', async (req, res) => {
  const { propuesta } = req.body
  try {
    const [result] = await pool.query('INSERT INTO propuestas (propuesta) VALUES (?)', [propuesta])
    res.json({ id: result.insertId, propuesta })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 3. EDITAR un propuesta
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { propuesta } = req.body
  try {
    await pool.query('UPDATE propuestas SET propuesta = ? WHERE id = ?', [propuesta, id])
    res.json({ message: 'propuesta actualizado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 4. BORRAR un propuesta
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM propuestas WHERE id = ?', [id])
    res.json({ message: 'propuesta eliminada' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
