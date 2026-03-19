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
