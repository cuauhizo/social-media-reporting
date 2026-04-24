import { ref } from 'vue'

export function useApi() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const isSaving = ref(false)

  const apiRequest = async (endpoint, options = {}) => {
    isSaving.value = true
    try {
      const response = await fetch(`${apiUrl}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      })
      if (!response.ok) throw new Error(`Error en ${endpoint}`)
      return await response.json()
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      isSaving.value = false
    }
  }

  return { apiRequest, isSaving, apiUrl }
}
