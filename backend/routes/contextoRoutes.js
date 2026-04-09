const express = require('express')
const router = express.Router()
const { pool } = require('../utils/db')

// 1. OBTENER todos los puntos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contexto_rrss ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 2. AGREGAR un nuevo punto
router.post('/', async (req, res) => {
  const { punto } = req.body
  try {
    const [result] = await pool.query('INSERT INTO contexto_rrss (punto) VALUES (?)', [punto])
    res.json({ id: result.insertId, punto })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 3. EDITAR un punto existente
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { punto } = req.body
  try {
    await pool.query('UPDATE contexto_rrss SET punto = ? WHERE id = ?', [punto, id])
    res.json({ message: 'Punto actualizado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 4. BORRAR un punto
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM contexto_rrss WHERE id = ?', [id])
    res.json({ message: 'Punto eliminado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
