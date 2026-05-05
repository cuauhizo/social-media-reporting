<template>
  <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4">
      <h2 class="text-2xl font-black text-gray-800 uppercase flex items-center">
        <ScanSearch class="w-7 h-7 mr-3 text-gray-800" stroke-width="2.5" />
        Auditoría de Métricas Globales
      </h2>
      <div class="flex gap-2 mt-4 md:mt-0 bg-gray-100 p-1 rounded-lg">
        <button @click="redSeleccionada = 'fb'" :class="redSeleccionada === 'fb' ? 'bg-[#1877F2] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'" class="px-4 py-1.5 rounded-md font-bold text-sm transition-colors">Facebook</button>
        <button
          @click="redSeleccionada = 'ig'"
          :class="redSeleccionada === 'ig' ? 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          class="px-4 py-1.5 rounded-md font-bold text-sm transition-colors">
          Instagram
        </button>
      </div>
    </div>

    <div v-if="!datosCargados" class="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <p class="text-gray-500 font-medium">
        No se encontraron datos de {{ redSeleccionada.toUpperCase() }} para el periodo
        <b>{{ selectedPeriod }}</b>
        .
      </p>
      <p class="text-sm text-gray-400 mt-2">Sube primero el CSV de "Overview" para poder editar sus métricas.</p>
    </div>

    <div v-else-if="redSeleccionada === 'fb'" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-blue-50 p-3 rounded-xl border border-blue-100">
        <label class="text-[10px] font-bold text-blue-800 uppercase block mb-1">Total Followers</label>
        <input v-model="formData.total_followers" type="number" class="w-full bg-white border border-blue-200 rounded px-2 py-1 outline-none focus:border-blue-500 font-bold text-gray-700" />
      </div>
      <div class="bg-blue-50 p-3 rounded-xl border border-blue-100">
        <label class="text-[10px] font-bold text-blue-800 uppercase block mb-1">Nuevos Followers</label>
        <input v-model="formData.new_followers" type="number" class="w-full bg-white border border-blue-200 rounded px-2 py-1 outline-none focus:border-blue-500 font-bold text-gray-700" />
      </div>
      <div class="bg-blue-50 p-3 rounded-xl border border-blue-100">
        <label class="text-[10px] font-bold text-blue-800 uppercase block mb-1">Engagement Rate (%)</label>
        <input v-model="formData.engagement_rate" type="number" step="0.01" class="w-full bg-white border border-blue-200 rounded px-2 py-1 outline-none focus:border-blue-500 font-bold text-gray-700" />
      </div>
      <div class="bg-blue-50 p-3 rounded-xl border border-blue-100">
        <label class="text-[10px] font-bold text-blue-800 uppercase block mb-1">Interacciones</label>
        <input v-model="formData.fb_interactions" type="number" class="w-full bg-white border border-blue-200 rounded px-2 py-1 outline-none focus:border-blue-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Clics (Link)</label>
        <input v-model="formData.fb_clics" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Shares</label>
        <input v-model="formData.fb_shares" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Comments (Responding)</label>
        <input v-model="formData.fb_comments" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Impresiones</label>
        <input v-model="formData.fb_post_impressions" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Alcance Orgánico</label>
        <input v-model="formData.fb_page_organic_reach" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Vistas: No Seguidores</label>
        <input v-model="formData.fb_page_no_followers_views" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Vistas: Seguidores</label>
        <input v-model="formData.fb_page_followers_views" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Tiempo de Respuesta</label>
        <input v-model="formData.fb_time_visualization" type="text" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-bold text-gray-700" />
      </div>
    </div>

    <div v-else-if="redSeleccionada === 'ig'" class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-pink-50 p-3 rounded-xl border border-pink-100">
        <label class="text-[10px] font-bold text-pink-800 uppercase block mb-1">Total Followers</label>
        <input v-model="formData.total_followers" type="number" class="w-full bg-white border border-pink-200 rounded px-2 py-1 outline-none focus:border-pink-500 font-bold text-gray-700" />
      </div>
      <div class="bg-pink-50 p-3 rounded-xl border border-pink-100">
        <label class="text-[10px] font-bold text-pink-800 uppercase block mb-1">Engagement Rate (%)</label>
        <input v-model="formData.engagement_rate" type="number" step="0.01" class="w-full bg-white border border-pink-200 rounded px-2 py-1 outline-none focus:border-pink-500 font-bold text-gray-700" />
      </div>
      <div class="bg-pink-50 p-3 rounded-xl border border-pink-100">
        <label class="text-[10px] font-bold text-pink-800 uppercase block mb-1">Post Saves</label>
        <input v-model="formData.ig_post_saves" type="number" class="w-full bg-white border border-pink-200 rounded px-2 py-1 outline-none focus:border-pink-500 font-bold text-gray-700" />
      </div>
      <div class="bg-pink-50 p-3 rounded-xl border border-pink-100">
        <label class="text-[10px] font-bold text-pink-800 uppercase block mb-1">Post Likes</label>
        <input v-model="formData.ig_post_likes" type="number" class="w-full bg-white border border-pink-200 rounded px-2 py-1 outline-none focus:border-pink-500 font-bold text-gray-700" />
      </div>
      <div class="bg-pink-50 p-3 rounded-xl border border-pink-100">
        <label class="text-[10px] font-bold text-pink-800 uppercase block mb-1">Impressions</label>
        <input v-model="formData.ig_post_impressions" type="number" class="w-full bg-white border border-pink-200 rounded px-2 py-1 outline-none focus:border-pink-500 font-bold text-gray-700" />
      </div>

      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Story: Taps Forward</label>
        <input v-model="formData.ig_story_taps_forward" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-pink-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Story: Taps Back</label>
        <input v-model="formData.ig_story_taps_back" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-pink-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Story: Exits</label>
        <input v-model="formData.ig_story_exits" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-pink-500 font-bold text-gray-700" />
      </div>

      <div class="col-span-2 md:col-span-4 mt-2">
        <h4 class="text-xs font-bold text-gray-400 uppercase border-b border-gray-200 pb-1 mb-3">Alcances Máximos</h4>
      </div>

      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Reach: Carousel</label>
        <input v-model="formData.ig_reach_carousel" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-pink-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Reach: Photo</label>
        <input v-model="formData.ig_reach_photo" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-pink-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Reach: Reel</label>
        <input v-model="formData.ig_reach_reel" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-pink-500 font-bold text-gray-700" />
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-200">
        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1">Reach: Story</label>
        <input v-model="formData.ig_reach_story" type="number" class="w-full bg-white border border-gray-300 rounded px-2 py-1 outline-none focus:border-pink-500 font-bold text-gray-700" />
      </div>
    </div>

    <div v-if="datosCargados" class="mt-6 flex justify-end">
      <button @click="guardarCambios" :disabled="isSaving" class="bg-gray-800 text-white px-8 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
        <Save class="w-5 h-5" />
        <span v-if="isSaving">Guardando...</span>
        <span v-else>Guardar Auditoría</span>
      </button>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useApi } from '@/composables/useApi'
  import { usePeriod } from '@/composables/usePeriod'
  import { useToast } from '@/composables/useToast'
  import { ScanSearch, Save } from 'lucide-vue-next'

  const { apiRequest, isSaving } = useApi()
  const { selectedPeriod } = usePeriod()
  const { showToast } = useToast()

  const redSeleccionada = ref('fb') // 'fb' o 'ig'
  const datosCargados = ref(false)
  const formData = ref({})

  // Cargar datos
  const fetchKpis = async () => {
    try {
      const data = await apiRequest(`/api/network-kpis?periodo=${selectedPeriod.value}&red_social=${redSeleccionada.value}`)

      if (Object.keys(data).length > 0 && data.id) {
        formData.value = { ...data }
        datosCargados.value = true
      } else {
        formData.value = {}
        datosCargados.value = false
      }
    } catch (error) {
      console.error('Error cargando KPIs:', error)
    }
  }

  // Guardar cambios
  const guardarCambios = async () => {
    try {
      await apiRequest('/api/network-kpis', {
        method: 'PUT',
        body: JSON.stringify({
          ...formData.value,
          periodo: selectedPeriod.value,
          red_social: redSeleccionada.value,
        }),
      })
      showToast(`Métricas de ${redSeleccionada.value.toUpperCase()} actualizadas con éxito.`, 'success')
    } catch (error) {
      showToast('Error al actualizar las métricas.', 'error')
    }
  }

  // Reactividad
  watch([selectedPeriod, redSeleccionada], () => {
    fetchKpis()
  })

  onMounted(() => {
    fetchKpis()
  })
</script>
