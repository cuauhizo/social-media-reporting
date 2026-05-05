<template>
  <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
    <h2 class="text-2xl font-black text-red-500 uppercase mb-6 flex items-center">
      <TriangleAlert class="w-7 h-7 mr-3 text-red-500" stroke-width="2.5" />
      Editar Principales Quejas (CS)
    </h2>

    <div class="flex flex-col gap-4 mb-8 md:flex-row">
      <input
        v-model="nuevaQueja"
        type="text"
        placeholder="Escribe una nueva queja recurrente..."
        class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition"
        @keyup.enter="agregarQueja"
        :disabled="isSaving" />
      <button @click="agregarQueja" :disabled="isSaving" class="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
        {{ isSaving ? 'Guardando...' : 'Agregar +' }}
      </button>
    </div>

    <div class="space-y-3">
      <div v-for="item in listaQuejas" :key="item.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group">
        <div class="flex-1">
          <input v-model="item.queja" class="bg-transparent w-full font-medium text-gray-700 outline-none focus:text-red-500" @change="actualizarQueja(item)" :disabled="isSaving" />
        </div>
        <button @click="borrarQueja(item.id)" class="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 ml-4 transition flex items-center gap-1">
          <Trash2 class="w-5 h-5" />
          Borrar
        </button>
      </div>

      <div v-if="listaQuejas.length === 0" class="text-center text-gray-400 py-4 italic">No hay quejas registradas. ¡Excelente trabajo del equipo!</div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useApi } from '@/composables/useApi'
  import { useToast } from '@/composables/useToast'
  import { usePeriod } from '@/composables/usePeriod'
  import { useModal } from '@/composables/useModal'
  import { TriangleAlert, Trash2 } from 'lucide-vue-next'

  const { apiRequest, isSaving } = useApi()
  const { showModal } = useModal()
  const { showToast } = useToast()
  const { selectedPeriod } = usePeriod()

  const listaQuejas = ref([])
  const nuevaQueja = ref('')

  const fetchQuejas = async () => {
    listaQuejas.value = await apiRequest(`/api/quejas?periodo=${selectedPeriod.value}`)
  }

  const agregarQueja = async () => {
    if (!nuevaQueja.value.trim()) return
    try {
      await apiRequest('/api/quejas', {
        method: 'POST',
        body: JSON.stringify({
          queja: nuevaQueja.value,
          periodo: selectedPeriod.value,
        }),
      })
      nuevaQueja.value = ''
      fetchQuejas()
      showToast('Queja agregada con éxito', 'success')
    } catch (error) {
      showToast('Error al agregar la queja', 'error')
    }
  }

  const actualizarQueja = async item => {
    try {
      await apiRequest(`/api/quejas/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ queja: item.queja }),
      })
      showToast('Cambio guardado', 'success')
    } catch (error) {
      showToast('Error al guardar', 'error')
    }
  }

  const borrarQueja = async id => {
    const isConfirmed = await showModal({
      message: `¿Seguro que quieres eliminar esta queja?`,
    })

    if (!isConfirmed) {
      showToast('Operación cancelada.', 'error')
      return
    }

    try {
      await apiRequest(`/api/quejas/${id}`, { method: 'DELETE' })
      fetchQuejas()
      showToast('Queja eliminada', 'success')
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }

  watch(selectedPeriod, () => {
    fetchQuejas()
  })

  onMounted(() => {
    fetchQuejas()
  })
</script>
