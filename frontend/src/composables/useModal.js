import { reactive } from 'vue'

const modalState = reactive({
  isOpen: false,
  title: '',
  message: '',
  type: 'confirm', // 'confirm' o 'prompt'
  expectedInput: '', // La palabra que deben escribir (Ej. el nombre del mes)
  inputValue: '', // Lo que va escribiendo el usuario
  confirmText: 'Aceptar',
  cancelText: 'Cancelar',
  resolvePromise: null,
})

export function useModal() {
  const showModal = options => {
    modalState.title = options.title || 'Confirmar'
    modalState.message = options.message || '¿Estás seguro de realizar esta acción?'
    modalState.type = options.type || 'confirm'
    modalState.expectedInput = options.expectedInput || ''
    modalState.inputValue = ''
    modalState.confirmText = options.confirmText || 'Sí, Aceptar'
    modalState.cancelText = options.cancelText || 'Cancelar'
    modalState.isOpen = true

    // Retornamos una promesa para que puedas usar await igual que con confirm()
    return new Promise(resolve => {
      modalState.resolvePromise = resolve
    })
  }

  const confirm = () => {
    if (modalState.resolvePromise) modalState.resolvePromise(true)
    modalState.isOpen = false
  }

  const cancel = () => {
    if (modalState.resolvePromise) modalState.resolvePromise(false)
    modalState.isOpen = false
  }

  return { modalState, showModal, confirm, cancel }
}
