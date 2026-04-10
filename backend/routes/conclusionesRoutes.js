const express = require('express')
const router = express.Router()
const { pool } = require('../utils/db')

// OBTENER
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM conclusiones ORDER BY id ASC')
    res.json(rows)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// AGREGAR
router.post('/', async (req, res) => {
  const { conclusion } = req.body
  try {
    const [result] = await pool.query('INSERT INTO conclusiones (conclusion) VALUES (?)', [conclusion])
    res.json({ id: result.insertId, conclusion })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// EDITAR
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { conclusion } = req.body
  try {
    await pool.query('UPDATE conclusiones SET conclusion = ? WHERE id = ?', [conclusion, id])
    res.json({ message: 'Conclusión actualizada' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// BORRAR
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM conclusiones WHERE id = ?', [id])
    res.json({ message: 'Conclusión eliminada' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
