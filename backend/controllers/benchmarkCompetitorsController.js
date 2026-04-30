const { pool } = require('../utils/db')

// 1. OBTENER
const getCompetitors = async (req, res) => {
  const { periodo } = req.query // El frontend enviará ?periodo=2026-03
  if (!periodo) return res.status(400).json({ error: 'El periodo es necesario' })

  try {
    const [rows] = await pool.query('SELECT * FROM benchmark_competitors WHERE periodo = ? ORDER BY is_main_brand DESC, followers DESC', [periodo])

    res.json(rows)
  } catch (error) {
    console.error('Error en getCompetitors:', error)
    res.status(500).json({ error: 'Error al obtener los competidores.' })
  }
}

// 2. AGREGAR
const addCompetitor = async (req, res) => {
  const { brand_name, description, posts_count, frequency, interaction, followers, gained_followers, is_main_brand, periodo } = req.body
  try {
    const [result] = await pool.query(
      `INSERT INTO benchmark_competitors 
      (brand_name, description, posts_count, frequency, interaction, followers, gained_followers, is_main_brand, periodo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [brand_name, description || '', posts_count || 0, frequency || 0, interaction || 0, followers || 0, gained_followers || 0, is_main_brand || 0, periodo],
    )
    res.json({ id: result.insertId, brand_name, description, posts_count, frequency, interaction, followers, gained_followers, is_main_brand, periodo })
  } catch (error) {
    console.error('Error en addCompetitor:', error)
    res.status(500).json({ error: 'Error al guardar el competidor.' })
  }
}

// 3. EDITAR
const updateCompetitor = async (req, res) => {
  const { id } = req.params
  const { brand_name, description, posts_count, frequency, interaction, followers, gained_followers, is_main_brand } = req.body
  try {
    await pool.query(
      `UPDATE benchmark_competitors 
       SET brand_name=?, description=?, posts_count=?, frequency=?, 
           interaction=?, followers=?, gained_followers=?, is_main_brand=? 
       WHERE id=?`,
      [brand_name, description, posts_count, frequency, interaction, followers, gained_followers, is_main_brand ? 1 : 0, id],
    )
    res.json({ message: 'Competidor actualizado' })
  } catch (error) {
    console.error('Error en updateCompetitor:', error)
    res.status(500).json({ error: 'Error al actualizar el competidor.' })
  }
}

// 4. BORRAR
const deleteCompetitor = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM benchmark_competitors WHERE id = ?', [id])
    res.json({ message: 'Competidor eliminado' })
  } catch (error) {
    console.error('Error en deleteCompetitor:', error)
    res.status(500).json({ error: 'Error al eliminar el competidor.' })
  }
}

// CLONAR COMPETIDORES DEL MES ANTERIOR
const cloneCompetitors = async (req, res) => {
  const { fromPeriod, toPeriod } = req.body
  if (!fromPeriod || !toPeriod) return res.status(400).json({ error: 'Faltan periodos' })

  try {
    // Primero borramos si ya había algo en este mes para no duplicar
    await pool.query('DELETE FROM benchmark_competitors WHERE periodo = ?', [toPeriod])

    // Copiamos la info del mes anterior al nuevo usando TUS columnas reales
    const [result] = await pool.query(
      `INSERT INTO benchmark_competitors 
      (periodo, brand_name, description, posts_count, frequency, interaction, followers, gained_followers, is_main_brand)
       SELECT ?, brand_name, description, posts_count, frequency, interaction, followers, gained_followers, is_main_brand 
       FROM benchmark_competitors WHERE periodo = ?`,
      [toPeriod, fromPeriod],
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `No se encontraron competidores en ${fromPeriod} para clonar.` })
    }

    res.json({ message: 'Competidores importados con éxito.' })
  } catch (error) {
    console.error('Error al clonar competidores:', error)
    res.status(500).json({ error: 'Error interno al clonar.' })
  }
}

// Exportamos todas las funciones
module.exports = { getCompetitors, addCompetitor, updateCompetitor, deleteCompetitor, cloneCompetitors }
