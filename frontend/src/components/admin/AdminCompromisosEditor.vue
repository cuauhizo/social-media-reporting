<template>
  <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
    <h2 class="text-2xl font-black text-pluxeePink uppercase mb-6 flex items-center">
      <span class="mr-3">🚀</span>
      Editar Compromisos (Next Steps)
    </h2>

    <div class="flex gap-4 mb-8">
      <input v-model="nuevoCompromiso" type="text" placeholder="Escribe una nuevo compromiso..." class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-pluxeeGreen outline-none transition" @keyup.enter="agregarCompromiso" />
      <button @click="agregarCompromiso" class="bg-pluxeePink text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95">Agregar +</button>
    </div>

    <div class="space-y-3">
      <div v-for="item in listaCompromisos" :key="item.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group">
        <div class="flex-1">
          <input v-model="item.compromiso" class="bg-transparent w-full font-medium text-gray-700 outline-none focus:text-pluxeeGreen" @change="actualizarCompromiso(item)" />
        </div>
        <button @click="borrarCompromiso(item.id)" class="text-red-400 hover:text-red-600 ml-4 opacity-0 group-hover:opacity-100 transition">🗑️ Borrar</button>
      </div>

      <div v-if="listaCompromisos.length === 0" class="text-center text-gray-400 py-4 italic">No hay compromisos definidos aún.</div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useApi } from '@/composables/useApi'
  import { useToast } from '@/composables/useToast'

  const { apiRequest, isSaving } = useApi()
  const { showToast } = useToast()

  const listaCompromisos = ref([])
  const nuevoCompromiso = ref('')

  const fetchCompromisos = async () => {
    listaCompromisos.value = await apiRequest('/api/compromisos')
  }

  const agregarCompromiso = async () => {
    if (!nuevoCompromiso.value.trim()) return
    try {
      await apiRequest('/api/compromisos', {
        method: 'POST',
        body: JSON.stringify({ compromiso: nuevoCompromiso.value }),
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
    if (!confirm('¿Seguro que quieres eliminar este compromiso?')) return
    try {
      await apiRequest(`/api/compromisos/${id}`, { method: 'DELETE' })
      fetchCompromisos()
      showToast('Compromiso eliminado', 'success')
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }

  onMounted(() => {
    fetchCompromisos()
  })
</script>
