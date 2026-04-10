const express = require('express')
const router = express.Router()
const { pool } = require('../utils/db')

// 1. OBTENER todos los casos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM casos_cs ORDER BY cantidad DESC') // Los ordenamos de mayor a menor
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 2. AGREGAR un nuevo caso
router.post('/', async (req, res) => {
  const { motivo, cantidad } = req.body
  try {
    const [result] = await pool.query('INSERT INTO casos_cs (motivo, cantidad) VALUES (?, ?)', [motivo, cantidad || 0])
    res.json({ id: result.insertId, motivo, cantidad })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 3. EDITAR un caso (Motivo o Cantidad)
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { motivo, cantidad } = req.body
  try {
    await pool.query('UPDATE casos_cs SET motivo = ?, cantidad = ? WHERE id = ?', [motivo, cantidad, id])
    res.json({ message: 'Caso actualizado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 4. BORRAR un caso
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM casos_cs WHERE id = ?', [id])
    res.json({ message: 'Caso eliminado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
