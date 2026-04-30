<template>
  <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
    <h2 class="text-2xl font-black text-pluxeeBlue uppercase mb-6 flex items-center">
      <span class="mr-3">🏆</span>
      Benchmark: Competidores e Insights
    </h2>

    <h3 class="font-bold text-gray-500 mb-4 text-sm uppercase">Agregar / Editar Competidores</h3>

    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 items-end">
      <div class="col-span-2 lg:col-span-2">
        <label class="text-[10px] font-bold text-gray-500 uppercase">Marca</label>
        <input v-model="nuevoComp.brand_name" type="text" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" :disabled="isSaving" />
      </div>
      <div class="col-span-2 lg:col-span-2">
        <label class="text-[10px] font-bold text-gray-500 uppercase">Descripción</label>
        <input v-model="nuevoComp.description" type="text" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" placeholder="Ej: Supermercado" :disabled="isSaving" />
      </div>
      <div>
        <label class="text-[10px] font-bold text-gray-500 uppercase">Posts</label>
        <input v-model="nuevoComp.posts_count" type="number" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" :disabled="isSaving" />
      </div>
      <div>
        <label class="text-[10px] font-bold text-gray-500 uppercase">Frecuencia</label>
        <input v-model="nuevoComp.frequency" type="number" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" :disabled="isSaving" />
      </div>
      <div>
        <label class="text-[10px] font-bold text-gray-500 uppercase">Interacción</label>
        <input v-model="nuevoComp.interaction" type="number" step="0.01" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" :disabled="isSaving" />
      </div>
      <div>
        <label class="text-[10px] font-bold text-gray-500 uppercase">Seguidores</label>
        <input v-model="nuevoComp.followers" type="number" step="0.01" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" :disabled="isSaving" />
      </div>
      <div>
        <label class="text-[10px] font-bold text-gray-500 uppercase">Aumento Seg.</label>
        <input v-model="nuevoComp.gained_followers" type="number" step="0.01" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" :disabled="isSaving" />
      </div>

      <div class="flex items-center justify-center bg-white border p-2 rounded-lg h-[38px]">
        <label class="text-[10px] font-bold text-pluxeeBlue uppercase flex items-center cursor-pointer">
          <input v-model="nuevoComp.is_main_brand" type="checkbox" class="mr-1" :disabled="isSaving" />
          Pluxee?
        </label>
      </div>
      <div>
        <button @click="agregarCompetidor" :disabled="isSaving" class="bg-pluxeeBlue text-white p-2 rounded-lg font-bold text-sm w-full hover:scale-105 active:scale-95 transition disabled:opacity-50 h-[38px]">Guardar</button>
      </div>
      <div class="col-span-2 lg:col-span-2">
        <button @click="clonarMesAnterior" :disabled="isSaving" class="bg-pluxeePink text-white p-2 rounded-lg font-bold text-sm w-full hover:scale-105 active:scale-95 transition disabled:opacity-50 h-[38px]">Importar mes anterior</button>
      </div>
    </div>

    <!-- 
    agregarCompetidor
    -->

    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm border-collapse">
        <thead>
          <tr class="text-gray-400 text-xs uppercase border-b-2">
            <th class="pb-2">Marca</th>
            <th class="pb-2">Posts</th>
            <th class="pb-2">Frecuencia</th>
            <th class="pb-2">Interacción</th>
            <th class="pb-2">Seguidores</th>
            <th class="pb-2">Aumento</th>
            <th class="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="comp in listaCompetidores" :key="comp.id" class="border-b hover:bg-gray-50 transition-colors" :class="comp.is_main_brand ? 'bg-yellow-50' : ''">
            <td class="py-3 pr-2">
              <div class="flex items-center">
                <span v-if="comp.is_main_brand" class="text-pluxeeBlue text-xs mr-1">★</span>
                <input v-model="comp.brand_name" class="bg-transparent font-bold w-full outline-none focus:text-pluxeeBlue border-b border-transparent focus:border-gray-300" @change="actualizarCompetidor(comp)" :disabled="isSaving" />
              </div>
              <input
                v-model="comp.description"
                class="bg-transparent text-xs font-normal text-gray-500 w-full outline-none focus:text-pluxeeBlue border-b border-transparent focus:border-gray-300"
                @change="actualizarCompetidor(comp)"
                :disabled="isSaving" />
            </td>
            <td class="py-3 pr-2">
              <input type="number" v-model="comp.posts_count" class="bg-transparent w-16 outline-none focus:text-pluxeeBlue border-b border-transparent focus:border-gray-300" @change="actualizarCompetidor(comp)" :disabled="isSaving" />
            </td>
            <td class="py-3 pr-2">
              <input type="number" v-model="comp.frequency" class="bg-transparent w-16 outline-none focus:text-pluxeeBlue border-b border-transparent focus:border-gray-300" @change="actualizarCompetidor(comp)" :disabled="isSaving" />
            </td>
            <td class="py-3 pr-2">
              <input type="number" step="0.01" v-model="comp.interaction" class="bg-transparent w-20 outline-none focus:text-pluxeeBlue border-b border-transparent focus:border-gray-300" @change="actualizarCompetidor(comp)" :disabled="isSaving" />
            </td>
            <td class="py-3 pr-2">
              <input type="number" step="0.01" v-model="comp.followers" class="bg-transparent w-24 outline-none focus:text-pluxeeBlue border-b border-transparent focus:border-gray-300" @change="actualizarCompetidor(comp)" :disabled="isSaving" />
            </td>
            <td class="py-3 pr-2 font-bold flex items-center" :class="comp.gained_followers >= 0 ? 'text-green-600' : 'text-red-600'">
              <span v-if="comp.gained_followers > 0">+</span>
              <input
                type="number"
                v-model="comp.gained_followers"
                step="0.01"
                class="bg-transparent w-20 outline-none border-b border-transparent ml-1 transition-colors"
                :class="comp.gained_followers >= 0 ? 'focus:text-green-800 focus:border-green-300' : 'focus:text-red-800 focus:border-red-300'"
                @change="actualizarCompetidor(comp)"
                :disabled="isSaving" />
            </td>
            <td class="py-3 text-right">
              <button @click="borrarCompetidor(comp.id)" class="text-red-400 hover:text-red-600 transition-transform hover:scale-110">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr class="my-12 border-gray-200" />

    <div class="mb-8">
      <h3 class="font-bold text-gray-500 mb-2 text-sm uppercase">Insights de la competencia</h3>
      <div class="flex flex-col gap-2 mb-4 md:flex-row">
        <input
          v-model="nuevoBenchmarkInsight"
          type="text"
          placeholder="Nuevo insight..."
          class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-pluxeeBlue outline-none transition"
          @keyup.enter="agregarBenchmarkInsight"
          :disabled="isSaving" />
        <button @click="agregarBenchmarkInsight" :disabled="isSaving" class="bg-pluxeeBlue text-white px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-50">Agregar Insight</button>
      </div>
      <div class="space-y-2">
        <div v-for="item in listaBenchmarkInsights" :key="item.id" class="flex gap-2 bg-gray-50 p-2 rounded-lg group text-sm border border-transparent hover:border-gray-200">
          <input v-model="item.insight" class="bg-transparent flex-1 outline-none focus:text-pluxeeBlue" @change="actualizarBenchmarkInsight(item)" :disabled="isSaving" />
          <button @click="borrarBenchmarkInsight(item.id)" class="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
        </div>
        <div v-if="listaBenchmarkInsights.length === 0" class="text-center text-gray-400 py-4 italic">No hay insights registrados.</div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useApi } from '@/composables/useApi'
  import { useToast } from '@/composables/useToast'
  import { usePeriod } from '@/composables/usePeriod'

  const { apiRequest, isSaving } = useApi()
  const { showToast } = useToast()
  const { selectedPeriod } = usePeriod()

  // Estados de Competidores
  const listaCompetidores = ref([])
  const nuevoComp = ref({
    brand_name: '',
    description: '',
    posts_count: 0,
    frequency: 0,
    interaction: 0,
    followers: 0,
    gained_followers: 0,
    is_main_brand: false,
  })

  // Estados de Insights
  const listaBenchmarkInsights = ref([])
  const nuevoBenchmarkInsight = ref('')

  // === LÓGICA COMPETIDORES ===
  const fetchCompetidores = async () => {
    listaCompetidores.value = await apiRequest(`/api/benchmark-competitors?periodo=${selectedPeriod.value}`)
  }

  const agregarCompetidor = async () => {
    if (!nuevoComp.value.brand_name.trim()) return
    try {
      const dataToSave = { ...nuevoComp.value, is_main_brand: nuevoComp.value.is_main_brand ? 1 : 0, periodo: selectedPeriod.value }
      await apiRequest('/api/benchmark-competitors', {
        method: 'POST',
        body: JSON.stringify(dataToSave),
      })
      nuevoComp.value = { brand_name: '', description: '', posts_count: 0, frequency: 0, interaction: 0, followers: 0, gained_followers: 0, is_main_brand: false }
      fetchCompetidores()
      showToast('Competidor agregado', 'success')
    } catch (error) {
      showToast('Error al agregar competidor', 'error')
    }
  }

  const actualizarCompetidor = async comp => {
    try {
      const dataToSave = { ...comp, is_main_brand: comp.is_main_brand ? 1 : 0 }
      await apiRequest(`/api/benchmark-competitors/${comp.id}`, {
        method: 'PUT',
        body: JSON.stringify(dataToSave),
      })
      showToast('Competidor actualizado', 'success')
    } catch (error) {
      showToast('Error al actualizar competidor', 'error')
    }
  }

  const borrarCompetidor = async id => {
    if (!confirm('¿Eliminar competidor?')) return
    try {
      await apiRequest(`/api/benchmark-competitors/${id}`, { method: 'DELETE' })
      fetchCompetidores()
      showToast('Competidor eliminado', 'success')
    } catch (error) {
      showToast('Error al eliminar competidor', 'error')
    }
  }

  const clonarMesAnterior = async () => {
    // Calculamos matemáticamente cuál fue el mes anterior
    const [year, month] = selectedPeriod.value.split('-')
    const d = new Date(year, month - 1, 1)
    d.setMonth(d.getMonth() - 1)
    const mesAnterior = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`

    if (!confirm(`¿Estás seguro de querer importar los competidores de ${mesAnterior} hacia ${selectedPeriod.value}? Esto borrará los que tengas actualmente en este mes.`)) return

    try {
      await apiRequest('/api/benchmark-competitors/clone', {
        method: 'POST',
        body: JSON.stringify({ fromPeriod: mesAnterior, toPeriod: selectedPeriod.value }),
      })
      showToast('Competidores importados', 'success')
      fetchCompetidores() // Recargamos la tabla
    } catch (error) {
      showToast(error.message || 'No se encontraron datos en el mes anterior', 'error')
    }
  }

  // === LÓGICA BENCHMARK INSIGHTS ===
  const fetchBenchmarkInsights = async () => {
    listaBenchmarkInsights.value = await apiRequest(`/api/benchmark-insights?periodo=${selectedPeriod.value}`)
  }

  const agregarBenchmarkInsight = async () => {
    if (!nuevoBenchmarkInsight.value.trim()) return
    try {
      await apiRequest('/api/benchmark-insights', {
        method: 'POST',
        body: JSON.stringify({ insight: nuevoBenchmarkInsight.value, periodo: selectedPeriod.value }),
      })
      nuevoBenchmarkInsight.value = ''
      fetchBenchmarkInsights()
      showToast('Insight agregado', 'success')
    } catch (error) {
      showToast('Error al agregar insight', 'error')
    }
  }

  const actualizarBenchmarkInsight = async item => {
    try {
      await apiRequest(`/api/benchmark-insights/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ insight: item.insight }),
      })
      showToast('Insight actualizado', 'success')
    } catch (error) {
      showToast('Error al actualizar insight', 'error')
    }
  }

  const borrarBenchmarkInsight = async id => {
    if (!confirm('¿Eliminar insight?')) return
    try {
      await apiRequest(`/api/benchmark-insights/${id}`, { method: 'DELETE' })
      fetchBenchmarkInsights()
      showToast('Insight eliminado', 'success')
    } catch (error) {
      showToast('Error al eliminar insight', 'error')
    }
  }

  watch(selectedPeriod, () => {
    fetchCompetidores()
    fetchBenchmarkInsights()
  })

  onMounted(() => {
    fetchCompetidores()
    fetchBenchmarkInsights()
  })
</script>
