const express = require('express')
const router = express.Router()
const { pool } = require('../utils/db')

// 1. OBTENER todos los compromisos
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM compromisos ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 2. AGREGAR un nuevo compromiso
router.post('/', async (req, res) => {
  const { compromiso } = req.body
  try {
    const [result] = await pool.query('INSERT INTO compromisos (compromiso) VALUES (?)', [compromiso])
    res.json({ id: result.insertId, compromiso })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 3. EDITAR un compromiso
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { compromiso } = req.body
  try {
    await pool.query('UPDATE compromisos SET compromiso = ? WHERE id = ?', [compromiso, id])
    res.json({ message: 'compromiso actualizado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// 4. BORRAR un compromiso
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM compromisos WHERE id = ?', [id])
    res.json({ message: 'compromiso eliminado' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
