# Social Media Reporting

Plataforma de reportes mensuales de redes sociales para la agencia.

## 📋 Requisitos previos

- Node.js 20.19+ o 22.12+
- MySQL 5.7+
- Credenciales OAuth de Hootsuite

## 🚀 Instalación

### 1. Backend

\`\`\`bash
cd backend
cp .env.example .env # Edita con tus credenciales
npm install
npm run dev # Inicia en puerto 3000
\`\`\`

### 2. Frontend

\`\`\`bash
cd frontend
npm install
npm run dev # Inicia en puerto 5173
\`\`\`

## 🔑 Autorización Hootsuite (Primera vez)

1. Entra a `http://localhost:3000/api/auth/login`
2. Autoriza la aplicación
3. Los tokens se guardan automáticamente en MySQL
4. Listo — El sistema ya puede leer datos de Hootsuite

## 🏗️ Estructura

- \`/backend\` — Node.js + Express + MySQL
- \`/frontend\` — Vue 3 + Vite + Tailwind CSS

## 📄 API Endpoints

### Públicos (GET)

- \`GET /api/reports/:periodId\` — Obtiene el reporte del mes

### Protegidos (JWT required)

- \`POST /api/auth/login\` — Autenticación admin
- \`POST /api/posts/:id\` — Edita post
- \`POST /api/post-images\` — Sube imagen de post

## 🛡️ Seguridad

- JWT para admin
- CORS whitelist (solo dominios autorizados)
- Tokens Hootsuite renovados automáticamente
- Validación de tipos de archivo (Multer)

## 📞 Soporte

Contacta a admin para problemas.
