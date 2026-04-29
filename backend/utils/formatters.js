const generarIdEstable = (postExcel, prefijo) => {
  // 1. Buscamos cualquier llave que contenga la palabra "ID" o "id"
  const keys = Object.keys(postExcel)
  const idKey = keys.find(k => k.toLowerCase().includes('post id') || k.toLowerCase().trim() === 'id')

  if (idKey && postExcel[idKey]) {
    return String(postExcel[idKey]).trim() // Lo devolvemos limpiecito
  }

  // 2. Si Hootsuite no mandó ID, usamos su Link como ID (El link es único y no cambia al recargar)
  const link = postExcel['Post URL'] || postExcel.postPermalink || postExcel.permalink || ''
  if (link) {
    // Tomamos los últimos 15 caracteres del link para hacerlo un ID válido
    return prefijo + '_' + link.replace(/[^a-zA-Z0-9]/g, '').slice(-15)
  }

  // 3. Último recurso absoluto: usamos un pedacito de su texto
  const texto = postExcel.mensaje || postExcel['Message'] || 'sin_texto'
  return prefijo + '_' + texto.replace(/[^a-zA-Z0-9]/g, '').substring(0, 20)
}

const formatCasData = kpisManuales => {
  const dynamicCas = []
  if (kpisManuales) {
    for (const key in kpisManuales) {
      if (key.startsWith('cas_')) {
        let label = key.replace('cas_', '').replace(/_/g, ' ')
        label = label.charAt(0).toUpperCase() + label.slice(1)
        dynamicCas.push({
          label: label,
          value: parseFloat(kpisManuales[key]) || 0,
        })
      }
    }
  }
  return dynamicCas.sort((a, b) => b.value - a.value)
}

module.exports = {
  formatCasData,
}
