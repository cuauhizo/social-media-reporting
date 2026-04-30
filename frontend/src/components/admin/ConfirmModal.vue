<template>
  <div v-if="modalState.isOpen" class="fixed inset-0 z-[100] flex items-center justify-center bg-pluxeeBlue/80 backdrop-blur-sm px-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 transform transition-all scale-100 opacity-100">
      <h3 class="text-2xl font-black text-gray-800 mb-3">{{ modalState.title }}</h3>
      <p class="text-gray-600 font-medium mb-6 whitespace-pre-line">{{ modalState.message }}</p>

      <div v-if="modalState.type === 'prompt'" class="mb-6">
        <input
          v-model="modalState.inputValue"
          type="text"
          class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-red-500 outline-none text-center font-bold text-lg"
          placeholder="Escribe aquí para confirmar..."
          @keyup.enter="isConfirmDisabled ? null : confirm()" />
      </div>

      <div class="flex justify-end gap-3">
        <button @click="cancel" class="px-6 py-2 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">
          {{ modalState.cancelText }}
        </button>
        <button
          @click="confirm"
          :disabled="isConfirmDisabled"
          class="px-6 py-2 rounded-xl font-bold text-white transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          :class="modalState.type === 'prompt' ? 'bg-red-600 hover:bg-red-700' : 'bg-pluxeeBlue hover:bg-opacity-90'">
          {{ modalState.confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { useModal } from '@/composables/useModal'

  const { modalState, confirm, cancel } = useModal()

  // Evitamos que puedan darle click a "Confirmar" si no han escrito la palabra secreta en el Prompt
  const isConfirmDisabled = computed(() => {
    if (modalState.type === 'prompt') {
      return modalState.inputValue !== modalState.expectedInput
    }
    return false
  })
</script>
