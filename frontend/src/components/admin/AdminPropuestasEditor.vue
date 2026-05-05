<template>
  <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
    <h2 class="text-2xl font-black text-pluxeeGreen uppercase mb-6 flex items-center">
      <MessageSquareCheck class="w-7 h-7 mr-3 text-pluxeeGreen" stroke-width="2.5" />
      Editar Propuestas (Next Steps)
    </h2>

    <div class="flex flex-col gap-4 mb-8 md:flex-row">
      <input
        v-model="nuevaPropuesta"
        type="text"
        placeholder="Escribe una nueva estrategia o acción..."
        class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-pluxeeGreen outline-none transition"
        @keyup.enter="agregarPropuesta"
        :disabled="isSaving" />
      <button @click="agregarPropuesta" :disabled="isSaving" class="bg-pluxeeGreen text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
        {{ isSaving ? 'Guardando...' : 'Agregar +' }}
      </button>
    </div>

    <div class="space-y-3">
      <div v-for="item in listaPropuestas" :key="item.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group">
        <div class="flex-1">
          <input v-model="item.propuesta" class="bg-transparent w-full font-medium text-gray-700 outline-none focus:text-pluxeeGreen" @change="actualizarPropuesta(item)" :disabled="isSaving" />
        </div>
        <button @click="borrarPropuesta(item.id)" class="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 ml-4 transition flex items-center gap-1">
          <Trash2 class="w-5 h-5" />
          Borrar
        </button>
      </div>

      <div v-if="listaPropuestas.length === 0" class="text-center text-gray-400 py-4 italic">No hay propuestas definidas aún.</div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useApi } from '@/composables/useApi'
  import { useToast } from '@/composables/useToast'
  import { usePeriod } from '@/composables/usePeriod'
  import { useModal } from '@/composables/useModal'
  import { MessageSquareCheck, Trash2 } from 'lucide-vue-next'

  const { apiRequest, isSaving } = useApi()
  const { showModal } = useModal()
  const { showToast } = useToast()
  const { selectedPeriod } = usePeriod()

  const listaPropuestas = ref([])
  const nuevaPropuesta = ref('')

  const fetchPropuestas = async () => {
    listaPropuestas.value = await apiRequest(`/api/propuestas?periodo=${selectedPeriod.value}`)
  }

  const agregarPropuesta = async () => {
    if (!nuevaPropuesta.value.trim()) return
    try {
      await apiRequest('/api/propuestas', {
        method: 'POST',
        body: JSON.stringify({ propuesta: nuevaPropuesta.value, periodo: selectedPeriod.value }),
      })
      nuevaPropuesta.value = ''
      fetchPropuestas()
      showToast('Paso agregado con éxito', 'success')
    } catch (error) {
      showToast('Error al agregar paso', 'error')
    }
  }

  const actualizarPropuesta = async item => {
    try {
      await apiRequest(`/api/propuestas/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ propuesta: item.propuesta }),
      })
      showToast('Cambio guardado', 'success')
    } catch (error) {
      showToast('Error al guardar', 'error')
    }
  }

  const borrarPropuesta = async id => {
    const isConfirmed = await showModal({
      message: `¿Seguro que quieres eliminar esta propuesta?`,
    })

    if (!isConfirmed) {
      showToast('Operación cancelada.', 'error')
      return
    }

    try {
      await apiRequest(`/api/propuestas/${id}`, { method: 'DELETE' })
      fetchPropuestas()
      showToast('Propuesta eliminada', 'success')
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }

  watch(selectedPeriod, () => {
    fetchPropuestas()
  })

  onMounted(() => {
    fetchPropuestas()
  })
</script>
