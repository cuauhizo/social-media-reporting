const mysql = require('mysql2/promise')
require('dotenv').config()

// 1. Creamos el "Pool" de conexión a MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// 2. Inicializamos la tabla automáticamente si no existe
async function initDB() {
  try {
    const connection = await pool.getConnection()

    // Tabla de Tokens (la que ya tenías)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        id INT PRIMARY KEY,
        access_token TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)

    //  NUEVA TABLA: Para los puntos del Contexto de RRSS
    await connection.query(`
      CREATE TABLE IF NOT EXISTS contexto_rrss (
        id INT AUTO_INCREMENT PRIMARY KEY,
        punto TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    //  NUEVA TABLA: Para las quejas de Servicio al Cliente
    await connection.query(`
      CREATE TABLE IF NOT EXISTS quejas_rrss (
        id INT AUTO_INCREMENT PRIMARY KEY,
        queja TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    //  NUEVA TABLA: Para las Propuestas (Next Steps)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS propuestas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        propuesta TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    //  NUEVA TABLA: Para los Compromisos (Next Steps)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS compromisos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        compromiso TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // NUEVA TABLA: Para las Métricas Globales (Números fijos)
    // Usamos 'clave' como llave primaria para evitar duplicados
    await connection.query(`
      CREATE TABLE IF NOT EXISTS metricas_globales (
        clave VARCHAR(50) PRIMARY KEY,
        valor INT NOT NULL DEFAULT 0
      )
    `)

    // NUEVA TABLA: Para los Casos variables de Customer Service
    await connection.query(`
      CREATE TABLE IF NOT EXISTS casos_cs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        motivo VARCHAR(255) NOT NULL,
        cantidad INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // NUEVA TABLA: Insights de Benchmark (Puntos estratégicos)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS benchmark_insights (
        id INT AUTO_INCREMENT PRIMARY KEY,
        insight TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // NUEVA TABLA: Competidores (Tabla comparativa)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS benchmark_competitors (
        id INT AUTO_INCREMENT PRIMARY KEY,
        brand_name VARCHAR(100) NOT NULL,
        description VARCHAR(255),
        posts_count INT DEFAULT 0,
        frequency DECIMAL(5,2) DEFAULT 0.00,
        interaction INT DEFAULT 0,
        followers INT DEFAULT 0,
        gained_followers INT DEFAULT 0,
        is_main_brand TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `)

    connection.release()
    console.log('✅ Base de datos MySQL: Tablas de Tokens y Contexto listas.')
  } catch (error) {
    console.error('❌ Error inicializando tablas MySQL:', error.message)
  }
}

initDB()

// 3. Función para OBTENER el token actual
const getTokens = async () => {
  const [rows] = await pool.query('SELECT access_token, refresh_token FROM auth_tokens WHERE id = 1')
  return rows[0] || null // Devuelve el objeto con los tokens, o null si está vacía
}

// 4. Función para GUARDAR o ACTUALIZAR el token
const saveTokens = async (accessToken, refreshToken) => {
  // En MySQL usamos ON DUPLICATE KEY UPDATE para sobrescribir el registro 1 siempre
  await pool.query(
    `
    INSERT INTO auth_tokens (id, access_token, refresh_token) 
    VALUES (1, ?, ?)
    ON DUPLICATE KEY UPDATE 
    access_token = VALUES(access_token), 
    refresh_token = VALUES(refresh_token)
  `,
    [accessToken, refreshToken],
  )
}

module.exports = { getTokens, saveTokens, pool }
