import { ref } from 'vue'

export function useApi() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const isSaving = ref(false)

  const apiRequest = async (endpoint, options = {}) => {
    isSaving.value = true
    try {
      const token = localStorage.getItem('auth_token')
      const headers = { 'Content-Type': 'application/json' }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch(`${apiUrl}${endpoint}`, {
        headers,
        ...options,
      })

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
        throw new Error('Sesión expirada')
      }

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
