const express = require('express')
const router = express.Router()
const { pool } = require('../utils/db')

// 1. OBTENER todas las quejas
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM quejas_rrss ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 2. AGREGAR una nueva queja
router.post('/', async (req, res) => {
  const { queja } = req.body
  try {
    const [result] = await pool.query('INSERT INTO quejas_rrss (queja) VALUES (?)', [queja])
    res.json({ id: result.insertId, queja })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 3. EDITAR una queja
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { queja } = req.body
  try {
    await pool.query('UPDATE quejas_rrss SET queja = ? WHERE id = ?', [queja, id])
    res.json({ message: 'Queja actualizada' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 4. BORRAR una queja
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM quejas_rrss WHERE id = ?', [id])
    res.json({ message: 'Queja eliminada' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
