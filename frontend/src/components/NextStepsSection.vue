<template>
  <section class="pdf-page flex flex-col justify-center bg-white border-t border-gray-200">
    <div class="max-w-7xl mx-auto w-full p-4">
      <h2 class="text-4xl font-black text-pluxeeBlue mb-10 text-center uppercase tracking-widest keep-with-next">Next Steps</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div class="no-break bg-gray-50 p-8 rounded-2xl border-l-4 border-pluxeeYellow shadow-sm hover:shadow-md transition-shadow">
          <h3 class="text-2xl font-bold text-pluxeeBlue mb-6 flex items-center">
            <span class="text-3xl mr-3">💡</span>
            Propuestas
          </h3>
          <ul v-if="listaCompromisos && listaCompromisos.length > 0" class="space-y-4">
            <li v-for="item in listaPropuestas" :key="item.id" class="flex items-start">
              <span class="text-pluxeeYellow font-black text-xl mr-3">+</span>
              <span class="text-gray-700 font-medium text-lg leading-relaxed">{{ item.propuesta }}</span>
            </li>
          </ul>
          <ul v-else>
            <li>
              <span class="text-pluxeeYellow font-black text-xl mr-3">+</span>
              <span class="text-gray-700 font-medium text-lg leading-relaxed">No hay propuestas definidas aún.</span>
            </li>
          </ul>
        </div>

        <div class="no-break bg-gray-50 p-8 rounded-2xl border-l-4 border-pluxeeGreen shadow-sm hover:shadow-md transition-shadow">
          <h3 class="text-2xl font-bold text-pluxeeBlue mb-6 flex items-center">
            <span class="text-3xl mr-3">🤝</span>
            Compromisos
          </h3>
          <ul v-if="listaCompromisos && listaCompromisos.length > 0" class="space-y-4">
            <li v-for="item in listaCompromisos" :key="item.id" class="flex items-start">
              <span class="text-pluxeeBlue font-black text-xl mr-3">•</span>
              <span class="text-gray-700 font-medium text-lg leading-relaxed">{{ item.compromiso }}</span>
            </li>
          </ul>
          <ul v-else>
            <li>
              <span class="text-pluxeeBlue font-black text-xl mr-3">•</span>
              <span class="text-gray-700 font-medium text-lg leading-relaxed">No hay compromisos definidos aún.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { usePeriod } from '@/composables/usePeriod'

  const { selectedPeriod } = usePeriod()
  const listaPropuestas = ref([])
  const listaCompromisos = ref([])
  const props = defineProps({
    data: Object,
  })

  const loadData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const resProuetas = await fetch(`${apiUrl}/api/propuestas?periodo=${selectedPeriod.value}`)
      const resCompromisos = await fetch(`${apiUrl}/api/compromisos?periodo=${selectedPeriod.value}`)
      if (!resProuetas.ok) throw new Error('Error al cargar propuestas')
      if (!resCompromisos.ok) throw new Error('Error al cargar Compromisos')

      listaPropuestas.value = await resProuetas.json()
      listaCompromisos.value = await resCompromisos.json()
    } catch (error) {
      console.error('Error cargando propuestas:', error)
    }
  }

  watch(selectedPeriod, loadData)
  onMounted(loadData)
</script>
