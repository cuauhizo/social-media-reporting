<template>
  <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
    <h2 class="text-2xl font-black text-pluxeePink uppercase mb-6 flex items-center">
      <Handshake class="w-7 h-7 mr-3 text-pluxeePink" stroke-width="2.5" />
      Editar Compromisos (Next Steps)
    </h2>

    <div class="flex flex-col gap-4 mb-8 md:flex-row">
      <input
        v-model="nuevoCompromiso"
        type="text"
        placeholder="Escribe una nuevo compromiso..."
        class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-pluxeeGreen outline-none transition"
        @keyup.enter="agregarCompromiso"
        :disabled="isSaving" />
      <button @click="agregarCompromiso" :disabled="isSaving" class="bg-pluxeePink text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
        {{ isSaving ? 'Guardando...' : 'Agregar +' }}
      </button>
    </div>

    <div class="space-y-3">
      <div v-for="item in listaCompromisos" :key="item.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group">
        <div class="flex-1">
          <input v-model="item.compromiso" class="bg-transparent w-full font-medium text-gray-700 outline-none focus:text-pluxeeGreen" @change="actualizarCompromiso(item)" :disabled="isSaving" />
        </div>
        <button @click="borrarCompromiso(item.id)" class="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 ml-4 transition flex items-center gap-1">
          <Trash2 class="w-5 h-5" />
          Borrar
        </button>
      </div>

      <div v-if="listaCompromisos.length === 0" class="text-center text-gray-400 py-4 italic">No hay compromisos definidos aún.</div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useApi } from '@/composables/useApi'
  import { useToast } from '@/composables/useToast'
  import { usePeriod } from '@/composables/usePeriod'
  import { useModal } from '@/composables/useModal'
  import { Handshake, Trash2 } from 'lucide-vue-next'

  const { apiRequest, isSaving } = useApi()
  const { showModal } = useModal()
  const { showToast } = useToast()
  const { selectedPeriod } = usePeriod()

  const listaCompromisos = ref([])
  const nuevoCompromiso = ref('')

  const fetchCompromisos = async () => {
    listaCompromisos.value = await apiRequest(`/api/compromisos?periodo=${selectedPeriod.value}`)
  }

  const agregarCompromiso = async () => {
    if (!nuevoCompromiso.value.trim()) return
    try {
      await apiRequest('/api/compromisos', {
        method: 'POST',
        body: JSON.stringify({ compromiso: nuevoCompromiso.value, periodo: selectedPeriod.value }),
      })
      nuevoCompromiso.value = ''
      fetchCompromisos()
      showToast('Compromiso agregado con éxito', 'success')
    } catch (error) {
      showToast('Error al agregar compromiso', 'error')
    }
  }

  const actualizarCompromiso = async item => {
    try {
      await apiRequest(`/api/compromisos/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ compromiso: item.compromiso }),
      })
      showToast('Cambio guardado', 'success')
    } catch (error) {
      showToast('Error al guardar', 'error')
    }
  }

  const borrarCompromiso = async id => {
    const isConfirmed = await showModal({
      message: `¿Seguro que quieres eliminar este compromiso?`,
    })

    if (!isConfirmed) {
      showToast('Operación cancelada.', 'error')
      return
    }

    try {
      await apiRequest(`/api/compromisos/${id}`, { method: 'DELETE' })
      fetchCompromisos()
      showToast('Compromiso eliminado', 'success')
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }

  watch(selectedPeriod, () => {
    fetchCompromisos()
  })

  onMounted(() => {
    fetchCompromisos()
  })
</script>
