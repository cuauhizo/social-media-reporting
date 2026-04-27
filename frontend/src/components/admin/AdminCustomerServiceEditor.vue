<template>
  <div>
    <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
      <div class="flex flex-col justify-between items-center mb-6 md:flex-row">
        <h2 class="text-2xl font-black mb-4 text-pluxeeBlue uppercase flex items-center">
          <span class="mr-3">📊</span>
          Métricas de Customer Service
        </h2>
        <button @click="guardarMetricas" :disabled="isSaving" class="bg-pluxeeBlue text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isSaving ? 'Guardando...' : '💾 Guardar Métricas' }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label class="block text-sm font-bold text-gray-500 mb-2">Casos Escalados</label>
          <input v-model="metricas.cs_escalated" type="number" class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-pluxeeBlue font-bold text-lg text-gray-800" />
        </div>
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label class="block text-sm font-bold text-gray-500 mb-2">Mensajes Facebook</label>
          <input v-model="metricas.msj_fb" type="number" class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-pluxeeBlue font-bold text-lg text-gray-800" />
        </div>
        <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <label class="block text-sm font-bold text-gray-500 mb-2">Mensajes Instagram</label>
          <input v-model="metricas.msj_ig" type="number" class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-pluxeeBlue font-bold text-lg text-gray-800" />
        </div>
      </div>
    </section>

    <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
      <h2 class="text-2xl font-black text-orange-500 uppercase mb-6 flex items-center">
        <span class="mr-3">🎧</span>
        Editar Casos de Atención (Tipos)
      </h2>

      <div class="flex flex-col gap-4 mb-8 md:flex-row">
        <input v-model="nuevoMotivo" type="text" placeholder="Ej: Actualización de datos" class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-orange-500 outline-none transition" />
        <input v-model="nuevaCantidad" type="number" placeholder="Cantidad" class="w-32 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-orange-500 outline-none transition" @keyup.enter="agregarCasoCS" />
        <button @click="agregarCasoCS" :disabled="isSaving" class="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isSaving ? 'Guardando...' : 'Agregar +' }}
        </button>
      </div>

      <div class="space-y-3">
        <div v-for="item in listaCasosCS" :key="item.id" class="flex flex-col items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group md:flex-row">
          <div class="flex-1 flex flex-col w-full gap-4 md:flex-row">
            <input v-model="item.motivo" class="bg-transparent flex-1 font-medium text-gray-700 outline-none focus:text-orange-500 border-b border-transparent focus:border-orange-300" @change="actualizarCasoCS(item)" :disabled="isSaving" />
            <input
              v-model="item.cantidad"
              type="number"
              class="bg-transparent w-20 text-center font-black text-gray-700 outline-none focus:text-orange-500 border-b border-transparent focus:border-orange-300"
              @change="actualizarCasoCS(item)"
              :disabled="isSaving" />
          </div>
          <button @click="borrarCasoCS(item.id)" class="text-red-400 hover:text-red-600 ml-4 opacity-0 group-hover:opacity-100 transition">🗑️ Borrar</button>
        </div>
        <div v-if="listaCasosCS.length === 0" class="text-center text-gray-400 py-4 italic">No hay casos registrados.</div>
      </div>
    </section>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useApi } from '@/composables/useApi'
  import { useToast } from '@/composables/useToast'

  const { apiRequest, isSaving } = useApi()
  const { showToast } = useToast()

  // Estado para Métricas
  const metricas = ref({ cs_escalated: 0, msj_fb: 0, msj_ig: 0 })

  // Estado para Casos Dinámicos
  const listaCasosCS = ref([])
  const nuevoMotivo = ref('')
  const nuevaCantidad = ref('')

  // Lógica de Métricas
  const fetchMetricas = async () => {
    const data = await apiRequest('/api/metricas')
    metricas.value = { ...metricas.value, ...data }
  }

  const guardarMetricas = async () => {
    try {
      await apiRequest('/api/metricas', {
        method: 'POST',
        body: JSON.stringify(metricas.value),
      })
      showToast('Métricas globales guardadas con éxito', 'success')
    } catch (error) {
      showToast('Error al guardar métricas', 'error')
    }
  }

  // Lógica de Casos CS
  const fetchCasosCS = async () => {
    listaCasosCS.value = await apiRequest('/api/casos-cs')
  }

  const agregarCasoCS = async () => {
    if (!nuevoMotivo.value.trim() || nuevaCantidad.value === '') return
    try {
      await apiRequest('/api/casos-cs', {
        method: 'POST',
        body: JSON.stringify({ motivo: nuevoMotivo.value, cantidad: nuevaCantidad.value }),
      })
      nuevoMotivo.value = ''
      nuevaCantidad.value = ''
      fetchCasosCS()
      showToast('Caso agregado con éxito', 'success')
    } catch (error) {
      showToast('Error al agregar el caso', 'error')
    }
  }

  const actualizarCasoCS = async item => {
    try {
      await apiRequest(`/api/casos-cs/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ motivo: item.motivo, cantidad: item.cantidad }),
      })
      showToast('Caso actualizado', 'success')
    } catch (error) {
      showToast('Error al actualizar el caso', 'error')
    }
  }

  const borrarCasoCS = async id => {
    if (!confirm('¿Seguro que quieres eliminar este tipo de caso?')) return
    try {
      await apiRequest(`/api/casos-cs/${id}`, { method: 'DELETE' })
      fetchCasosCS()
      showToast('Caso eliminado', 'success')
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }

  onMounted(() => {
    fetchMetricas()
    fetchCasosCS()
  })
</script>
