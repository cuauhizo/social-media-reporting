// backend/controllers/postsController.js
const { pool } = require('../utils/db')

// 1. OBTENER POSTS CRUDOS PARA EDITAR
const getPosts = async (req, res) => {
  const { periodo, red_social } = req.query
  if (!periodo || !red_social) return res.status(400).json({ error: 'Faltan parámetros' })

  const tabla = red_social === 'fb' || red_social === 'facebook' ? 'fb_posts_metrics' : 'ig_posts_metrics'

  try {
    const [rows] = await pool.query(`SELECT * FROM ${tabla} WHERE periodo = ? ORDER BY fecha DESC`, [periodo])
    res.json(rows)
  } catch (error) {
    console.error('Error en getPosts:', error)
    res.status(500).json({ error: 'Error interno al obtener los posts.' })
  }
}

// 2. ACTUALIZAR UN POST INDIVIDUAL
const updatePost = async (req, res) => {
  const { id } = req.params
  // 🚀 ¡Agregamos 'tags' a la lista de variables que recibimos!
  const { red_social, tags, alcance, interacciones, visitas, likes, shares, saves } = req.body

  if (!id || !red_social) return res.status(400).json({ error: 'Faltan parámetros (id o red_social)' })

  const tabla = red_social === 'fb' || red_social === 'facebook' ? 'fb_posts_metrics' : 'ig_posts_metrics'

  try {
    if (tabla === 'fb_posts_metrics') {
      await pool.query(
        // 🚀 Quitamos 'mensaje' y 'tipo_post', agregamos 'tags'
        `UPDATE fb_posts_metrics SET tags = ?, alcance = ?, interacciones = ?, visitas = ?, likes = ?, shares = ? WHERE id = ?`,
        [tags, alcance, interacciones, visitas, likes, shares, id],
      )
    } else {
      await pool.query(`UPDATE ig_posts_metrics SET tags = ?, alcance = ?, interacciones = ?, visitas = ?, likes = ?, shares = ?, saves = ? WHERE id = ?`, [tags, alcance, interacciones, visitas, likes, shares, saves || 0, id])
    }
    res.json({ message: 'Post actualizado correctamente' })
  } catch (error) {
    console.error('Error en updatePost:', error)
    res.status(500).json({ error: 'Error al actualizar el post.' })
  }
}
module.exports = { getPosts, updatePost }
