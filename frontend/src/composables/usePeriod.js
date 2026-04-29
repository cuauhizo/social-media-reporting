import { ref } from 'vue'

// Calculamos el mes por defecto (El mes anterior al actual)
const hoy = new Date()
hoy.setMonth(hoy.getMonth() - 1)
const defaultPeriod = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`

// Al declararlo FUERA de la función, se vuelve una variable global
const selectedPeriod = ref(defaultPeriod)

export function usePeriod() {
  return { selectedPeriod }
}
