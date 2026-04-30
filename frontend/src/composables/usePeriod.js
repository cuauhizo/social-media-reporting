import { ref, watch } from 'vue'

// Intentamos recuperar el mes guardado previamente,
// si no existe, calculamos el mes pasado por defecto.
const getInitialPeriod = () => {
  const saved = localStorage.getItem('report_period')
  if (saved) return saved

  const hoy = new Date()
  // Si hoy es Mayo, el reporte por defecto es Abril (04)
  hoy.setMonth(hoy.getMonth() - 1)
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`
}

const selectedPeriod = ref(getInitialPeriod())

// 🚀 MAGIA: Cada vez que el usuario cambie el mes, lo guardamos en el disco duro del navegador
watch(selectedPeriod, newVal => {
  localStorage.setItem('report_period', newVal)
})

export function usePeriod() {
  return {
    selectedPeriod,
  }
}
