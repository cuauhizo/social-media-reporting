<template>
  <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
    <div class="flex flex-col justify-between items-center mb-6 md:flex-row">
      <h2 class="text-2xl font-black mb-4 text-pluxeeBlue uppercase flex items-center">
        <Pin class="w-7 h-7 mr-3 text-pluxeeBlue" stroke-width="2.5" />
        Editar Conclusión Final
      </h2>
      <button @click="guardarConclusion" :disabled="isSaving" class="bg-pluxeeBlue text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
        <!-- {{ isSaving ? 'Guardando...' : '💾 Guardar Conclusión' }} -->
        <Save class="w-5 h-5" />
        <span v-if="isSaving">Guardando...</span>
        <span v-else>Guardar Conclusión</span>
      </button>
    </div>
    <textarea
      v-model="conclusionData.texto"
      rows="5"
      placeholder="Escribe el resumen o la conclusión final del reporte mensual aquí..."
      class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pluxeeBlue outline-none transition resize-none text-gray-700 font-medium leading-relaxed"
      :disabled="isSaving"></textarea>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useApi } from '@/composables/useApi'
  import { useToast } from '@/composables/useToast'
  import { usePeriod } from '@/composables/usePeriod'
  import { Pin, Save } from 'lucide-vue-next'

  const { apiRequest, isSaving } = useApi()
  const { showToast } = useToast()
  const { selectedPeriod } = usePeriod()

  const conclusionData = ref({ id: null, texto: '' })

  const fetchConclusiones = async () => {
    const data = await apiRequest(`/api/conclusiones?periodo=${selectedPeriod.value}`)
    if (data && data.length > 0) {
      conclusionData.value.id = data[0].id
      conclusionData.value.texto = data[0].conclusion
    } else {
      conclusionData.value.id = null
      conclusionData.value.texto = ''
    }
  }

  const guardarConclusion = async () => {
    if (!conclusionData.value.texto.trim()) return

    try {
      if (conclusionData.value.id) {
        await apiRequest(`/api/conclusiones/${conclusionData.value.id}`, {
          method: 'PUT',
          body: JSON.stringify({ conclusion: conclusionData.value.texto, periodo: selectedPeriod.value }),
        })
        showToast('Conclusión actualizada', 'success')
      } else {
        const result = await apiRequest('/api/conclusiones', {
          method: 'POST',
          body: JSON.stringify({ conclusion: conclusionData.value.texto, periodo: selectedPeriod.value }),
        })
        conclusionData.value.id = result.id
        showToast('Conclusión guardada', 'success')
      }
    } catch (error) {
      showToast('Error al guardar la conclusión', 'error')
    }
  }

  watch(selectedPeriod, () => {
    fetchConclusiones()
  })

  onMounted(() => {
    fetchConclusiones()
  })
</script>
