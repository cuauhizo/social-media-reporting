// frontend/src/utils/formatters.js

/**
 * Formatea un número agregando comas de miles.
 * Si recibe algo que no es un número (como "19.01%" o "+58"), lo devuelve intacto.
 */
export const formatNumber = num => {
  if (num === null || num === undefined) return '0'

  // Intentamos convertirlo a número
  const parsed = Number(num)

  // Si no es un número válido (ej. tiene el signo de %), lo regresamos como estaba
  if (isNaN(parsed)) return num

  // Si sí es un número, le ponemos sus comas
  return parsed.toLocaleString('en-US')
}

export const formatDate = dateString => {
  // 1. Validamos que la fecha exista y no sea nuestro texto de respaldo
  if (!dateString || dateString === 'Sin fecha' || dateString === 'Desconocida') {
    return dateString
  }

  try {
    // 2. Le agregamos 'T12:00:00' para evitar que Node/El Navegador le reste un día por la zona horaria (UTC)
    const date = new Date(`${dateString}T12:00:00`)

    // 3. Usamos la API nativa de Javascript para formatear en español (México)
    // Esto convertirá "2026-02-26" en "26 feb 2026"
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: '2-digit', // Cambia a 'long' si quieres que diga "febrero" completo
      year: 'numeric',
    }).format(date)
  } catch (error) {
    // Si la fecha viene rota, devolvemos el valor original para que no crashee la app
    return dateString
  }
}
