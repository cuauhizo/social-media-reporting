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
        frequency INT DEFAULT 0,
        interaction DECIMAL(5,1) DEFAULT 0.0,
        followers DECIMAL(5,1) DEFAULT 0.0,
        gained_followers DECIMAL(5,2) DEFAULT 0.00,
        is_main_brand TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `)

    // NUEVA TABLA: Conclusiones Finales
    await connection.query(`
      CREATE TABLE IF NOT EXISTS conclusiones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conclusion TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // NUEVA TABLA: Para reemplazar imágenes rotas de posts
    await connection.query(`
      CREATE TABLE IF NOT EXISTS post_images (
        post_id VARCHAR(100) PRIMARY KEY,
        image_url VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Posts de Facebook
    await connection.query(`
      CREATE TABLE IF NOT EXISTS fb_posts_metrics (
        id VARCHAR(100) PRIMARY KEY, -- Usaremos el ID del post o Permalink
        periodo VARCHAR(7) NOT NULL,
        mensaje TEXT,
        tipo_post VARCHAR(50),
        fecha DATETIME,
        alcance INT DEFAULT 0,
        interacciones INT DEFAULT 0,
        visitas INT DEFAULT 0,
        likes INT DEFAULT 0,
        shares INT DEFAULT 0,
        permalink TEXT,
        tags TEXT
      )
    `)

    // Posts de Instagram
    await connection.query(`
      CREATE TABLE IF NOT EXISTS ig_posts_metrics (
        id VARCHAR(100) PRIMARY KEY,
        periodo VARCHAR(7) NOT NULL,
        mensaje TEXT,
        tipo_post VARCHAR(50),
        fecha DATETIME,
        alcance INT DEFAULT 0,
        interacciones INT DEFAULT 0,
        visitas INT DEFAULT 0,
        likes INT DEFAULT 0,
        saves INT DEFAULT 0,
        shares INT DEFAULT 0,
        permalink TEXT,
        tags TEXT
      )
    `)

    // Resumen de Sentimientos (Inbound)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inbound_sentiment (
        id INT AUTO_INCREMENT PRIMARY KEY,
        periodo VARCHAR(7) NOT NULL,
        red_social VARCHAR(10) NOT NULL, -- 'fb' o 'ig'
        sentimiento VARCHAR(20) NOT NULL, -- 'positive', 'neutral', 'negative'
        cantidad INT DEFAULT 0
      )
    `)

    // 1. TABLA PARA TOTALES MENSUALES (La "caja fuerte" de los números grandes)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS network_kpis (
        id INT AUTO_INCREMENT PRIMARY KEY,
        periodo VARCHAR(7) NOT NULL,
        red_social VARCHAR(10) NOT NULL, -- 'fb' o 'ig'
        
        -- Datos compartidos
        total_followers INT DEFAULT 0,
        new_followers INT DEFAULT 0,
        engagement_rate DECIMAL(5,2) DEFAULT 0.00,
        
        -- Datos exclusivos de FB
        fb_interactions INT DEFAULT 0,
        fb_clics INT DEFAULT 0,
        fb_shares INT DEFAULT 0,
        fb_comments INT DEFAULT 0,
        fb_post_impressions INT DEFAULT 0,
        fb_page_organic_reach INT DEFAULT 0,
        fb_page_no_followers_views INT DEFAULT 0,
        fb_page_followers_views INT DEFAULT 0,
        fb_time_visualization VARCHAR(50),
        
        -- Datos exclusivos de IG
        ig_story_taps_forward INT DEFAULT 0,
        ig_story_taps_back INT DEFAULT 0,
        ig_story_exits INT DEFAULT 0,
        ig_post_saves INT DEFAULT 0,
        ig_post_likes INT DEFAULT 0,
        ig_post_impressions INT DEFAULT 0,
        ig_reach_carousel INT DEFAULT 0,
        ig_reach_photo INT DEFAULT 0,
        ig_reach_reel INT DEFAULT 0,
        ig_reach_story INT DEFAULT 0,
        
        UNIQUE KEY unique_period_network (periodo, red_social)
      )
    `)

    // 2. TABLA PARA HISTÓRICO DIARIO (Para alimentar las gráficas de crecimiento)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS historical_followers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        periodo VARCHAR(7) NOT NULL,
        red_social VARCHAR(10) NOT NULL,
        fecha DATE NOT NULL,
        followers INT DEFAULT 0,
        UNIQUE KEY unique_date_network (fecha, red_social)
      )
    `)

    // 3. TABLA PARA TOP CIUDADES
    await connection.query(`
      CREATE TABLE IF NOT EXISTS top_cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        periodo VARCHAR(7) NOT NULL,
        red_social VARCHAR(10) NOT NULL,
        city_name VARCHAR(100) NOT NULL,
        followers INT DEFAULT 0
      )
    `)

    connection.release()
    console.log('✅ Base de datos MySQL: Tablas de Tokens y Contexto listas.')
  } catch (error) {
    console.error('❌ Error inicializando tablas MySQL:', error.message)
  }
}

// initDB()

// Agrega esto en backend/utils/db.js antes de getTokens

async function actualizarTablasParaHistorial() {
  const tablas = ['contexto_rrss', 'quejas_rrss', 'propuestas', 'compromisos', 'casos_cs', 'benchmark_insights', 'benchmark_competitors', 'conclusiones']

  try {
    const connection = await pool.getConnection()
    console.log('⏳ Actualizando base de datos para la Fase 3 (Historial por meses)...')

    // Usamos el mes actual como valor por defecto para los registros viejos (ej. "2026-04")
    const hoy = new Date()
    // Le restamos 1 mes porque los reportes siempre son del mes vencido
    hoy.setMonth(hoy.getMonth() - 1)
    const defaultPeriod = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`

    for (const tabla of tablas) {
      try {
        // Intentamos agregar la columna. Si ya existe, MySQL arrojará un error que ignoraremos.
        await connection.query(`ALTER TABLE ${tabla} ADD COLUMN periodo VARCHAR(7) DEFAULT '${defaultPeriod}'`)
        console.log(`✅ Columna 'periodo' agregada a la tabla: ${tabla}`)
      } catch (err) {
        // El código de error 1060 significa "Columna duplicada" (ya existe)
        if (err.code !== 'ER_DUP_FIELDNAME') {
          console.error(`Error alterando la tabla ${tabla}:`, err.message)
        }
      }
    }

    // Para metricas_globales es distinto porque usa clave/valor. Añadiremos el periodo a la llave primaria
    try {
      await connection.query(`ALTER TABLE metricas_globales ADD COLUMN periodo VARCHAR(7) DEFAULT '${defaultPeriod}'`)
      // Quitamos la llave primaria vieja y creamos una compuesta (clave + periodo)
      await connection.query(`ALTER TABLE metricas_globales DROP PRIMARY KEY, ADD PRIMARY KEY (clave, periodo)`)
      console.log(`✅ Tabla metricas_globales adaptada para historial.`)
    } catch (err) {
      if (err.code !== 'ER_DUP_FIELDNAME' && !err.message.includes('Multiple primary key defined')) {
        console.error(`Error alterando metricas_globales:`, err.message)
      }
    }

    connection.release()
    console.log('🚀 ¡Base de datos lista para manejar meses dinámicos!')
  } catch (error) {
    console.error('Error conectando a la BD para actualizar:', error.message)
  }
}

// Descomenta esto, guarda el archivo (la terminal correrá la función), y luego lo vuelves a comentar.
// actualizarTablasParaHistorial()

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
