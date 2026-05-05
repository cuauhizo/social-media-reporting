<template>
  <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
    <h2 class="text-2xl font-black text-pluxeeBlue uppercase mb-6 flex items-center">
      <PencilLine class="w-7 h-7 mr-3 text-pluxeeBlue" stroke-width="2.5" />
      Editar Contexto Actual (RRSS)
    </h2>

    <div class="flex flex-col gap-4 mb-8 md:flex-row">
      <input v-model="nuevoPunto" type="text" placeholder="Escribe un nuevo hallazgo..." class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-pluxeeBlue outline-none" @keyup.enter="agregarPunto" :disabled="isSaving" />
      <button @click="agregarPunto" :disabled="isSaving" class="bg-pluxeeBlue text-white px-6 py-2 rounded-xl font-bold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
        {{ isSaving ? 'Cargando...' : 'Agregar +' }}
      </button>
    </div>

    <div class="space-y-3">
      <div v-for="item in listaContexto" :key="item.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border group">
        <input v-model="item.punto" class="bg-transparent flex-1 outline-none focus:text-pluxeeBlue" @change="actualizarPunto(item)" :disabled="isSaving" />
        <button @click="borrarPunto(item.id)" class="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 ml-4 transition flex items-center gap-1">
          <Trash2 class="w-5 h-5" />
          Borrar
        </button>
      </div>
      <div v-if="listaContexto.length === 0" class="text-center text-gray-400 py-4 italic">No hay contexto definidas aún.</div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useApi } from '@/composables/useApi'
  import { useToast } from '@/composables/useToast'
  import { usePeriod } from '@/composables/usePeriod'
  import { useModal } from '@/composables/useModal'
  import { PencilLine, Trash2 } from 'lucide-vue-next'

  const { apiRequest, isSaving } = useApi()
  const { showModal } = useModal()
  const { showToast } = useToast()
  const { selectedPeriod } = usePeriod()

  const listaContexto = ref([])
  const nuevoPunto = ref('')

  const fetchContexto = async () => {
    listaContexto.value = await apiRequest(`/api/contexto?periodo=${selectedPeriod.value}`)
  }

  const agregarPunto = async () => {
    if (!nuevoPunto.value.trim()) return
    try {
      await apiRequest('/api/contexto', {
        method: 'POST',
        body: JSON.stringify({ punto: nuevoPunto.value, periodo: selectedPeriod.value }),
      })
      nuevoPunto.value = ''
      fetchContexto()
      showToast('Punto agregado con éxito', 'success')
    } catch (error) {
      showToast('Error al agregar el punto', 'error')
    }
  }

  const actualizarPunto = async item => {
    try {
      await apiRequest(`/api/contexto/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ punto: item.punto }),
      })
      showToast('Cambio guardado', 'success') // 👈 3. Usamos showToast
    } catch (error) {
      showToast('Error al guardar', 'error')
    }
  }

  const borrarPunto = async id => {
    const isConfirmed = await showModal({
      message: `¿Seguro que quieres eliminar este punto?`,
    })

    if (!isConfirmed) {
      showToast('Operación cancelada.', 'error')
      return
    }

    try {
      await apiRequest(`/api/contexto/${id}`, { method: 'DELETE' })
      fetchContexto()
      showToast('Punto eliminado', 'success') // 👈 3. Usamos showToast
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }

  watch(selectedPeriod, () => {
    fetchContexto()
  })

  onMounted(() => {
    fetchContexto()
  })
</script>
