<template>
  <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
    <h2 class="text-2xl font-black text-pluxeeBlue uppercase mb-6 flex items-center">
      <span class="mr-3">📝</span>
      Editar Contexto Actual (RRSS)
    </h2>

    <div class="flex flex-col gap-4 mb-8 md:flex-row">
      <input v-model="nuevoPunto" type="text" placeholder="Escribe un nuevo hallazgo..." class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-pluxeeBlue outline-none" @keyup.enter="agregarPunto" />
      <button @click="agregarPunto" :disabled="isSaving" class="bg-pluxeeBlue text-white px-6 py-2 rounded-xl font-bold hover:scale-105 disabled:opacity-50">
        {{ isSaving ? 'Cargando...' : 'Agregar +' }}
      </button>
    </div>

    <div class="space-y-3">
      <div v-for="item in listaContexto" :key="item.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border group">
        <input v-model="item.punto" class="bg-transparent flex-1 outline-none focus:text-pluxeeBlue" @change="actualizarPunto(item)" />
        <button @click="borrarPunto(item.id)" class="text-red-400 opacity-0 group-hover:opacity-100 ml-4">🗑️ Borrar</button>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useApi } from '@/composables/useApi'
  import { useToast } from '@/composables/useToast' // 👈 1. Importamos el Toast

  const { apiRequest, isSaving } = useApi()
  const { showToast } = useToast() // 👈 2. Lo inicializamos

  const listaContexto = ref([])
  const nuevoPunto = ref('')

  const fetchContexto = async () => {
    listaContexto.value = await apiRequest('/api/contexto')
  }

  const agregarPunto = async () => {
    if (!nuevoPunto.value.trim()) return
    try {
      await apiRequest('/api/contexto', {
        method: 'POST',
        body: JSON.stringify({ punto: nuevoPunto.value }),
      })
      nuevoPunto.value = ''
      fetchContexto()
      showToast('Punto agregado con éxito', 'success') // 👈 3. Usamos showToast directamente
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
    if (!confirm('¿Seguro que quieres eliminar este punto?')) return
    try {
      await apiRequest(`/api/contexto/${id}`, { method: 'DELETE' })
      fetchContexto()
      showToast('Punto eliminado', 'success') // 👈 3. Usamos showToast
    } catch (error) {
      showToast('Error al eliminar', 'error')
    }
  }

  onMounted(() => {
    fetchContexto()
  })
</script>
