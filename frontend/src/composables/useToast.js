import { ref } from 'vue'

const alert = ref({ show: false, message: '', type: 'success' })

export function useToast() {
  const showToast = (msg, type = 'success') => {
    alert.value = { show: true, message: msg, type }

    setTimeout(() => {
      alert.value.show = false
    }, 4000)
  }

  return { alert, showToast }
}
