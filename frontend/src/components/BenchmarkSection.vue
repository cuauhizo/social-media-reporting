<template>
  <section class="pdf-page flex flex-col justify-center bg-white font-sans text-gray-800">
    <div class="max-w-7xl mx-auto w-full p-4">
      <h2 class="text-3xl font-black text-pluxeeBlue mb-8 uppercase keep-with-next">Benchmark: Pluxee vs. Competitors</h2>

      <div class="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-pluxeeBlue text-white">
              <th class="p-4 font-bold uppercase text-sm">Página</th>
              <th class="p-4 font-bold uppercase text-sm text-center">Publicaciones</th>
              <th class="p-4 font-bold uppercase text-sm text-center">Frecuencia de publicación</th>
              <th class="p-4 font-bold uppercase text-sm text-center">Interacción media</th>
              <th class="p-4 font-bold uppercase text-sm text-center">Seguidores</th>
              <th class="p-4 font-bold uppercase text-sm text-center">Aumento de la audiencia</th>
            </tr>
          </thead>
          <tbody v-if="listaCompetidores && listaCompetidores.length > 0">
            <tr v-for="comp in listaCompetidores" :key="comp.id" :class="['no-break border-b border-gray-200 hover:bg-gray-50 transition-colors', comp.is_main_brand ? 'bg-pluxeeYellow bg-opacity-20 font-bold' : 'bg-white']">
              <td class="p-4">
                <div class="text-pluxeeBlue text-lg">{{ comp.brand_name }}</div>
                <div class="text-xs text-gray-500 font-normal truncate max-w-xs py-1">{{ comp.description }}</div>
              </td>

              <td class="p-4 text-center text-xl text-pluxeeBlue font-black">{{ comp.posts_count }}</td>
              <td class="p-4 text-center text-gray-800">{{ comp.frequency || 0 }} publicaciones/día</td>
              <td class="p-4 text-center text-gray-800">{{ comp.interaction || 0 }}</td>
              <td class="p-4 text-center text-gray-800">{{ comp.followers }} mil</td>

              <td class="p-4 align-middle">
                <div class="flex justify-center items-center w-full">
                  <TableCellSparkline
                    :value="comp.gained_followers || 0"
                    :dailyData="[
                      comp.gained_followers * 0.2,
                      comp.gained_followers * -0.23,
                      comp.gained_followers * 0.5,
                      comp.gained_followers * -0.53,
                      comp.gained_followers * 0.9,
                      comp.gained_followers * -0.3,
                      comp.gained_followers * 0.8,
                      comp.gained_followers,
                    ]" />
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="6" class="py-10 text-center text-gray-400 font-medium text-sm">No se encontraron datos de competidores para este periodo.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 space-y-2 text-sm text-pluxeeBlue font-medium no-break">
        <p v-for="item in listaInsights" :key="item.id">✅ {{ item.insight }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import TableCellSparkline from '@/components/TableCellSparkline.vue'
  import { usePeriod } from '@/composables/usePeriod'

  const props = defineProps({
    data: {
      type: Array,
      default: () => [],
    },
    insights: {
      type: Array,
      default: () => [],
    },
  })

  const { selectedPeriod } = usePeriod()
  // Quitamos los props porque ahora el componente se alimenta solo
  const listaInsights = ref([])
  const listaCompetidores = ref([])

  const loadData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      // Hacemos el fetch a las rutas que acabamos de crear
      const [resInsights, resComps] = await Promise.all([fetch(`${apiUrl}/api/benchmark-insights?periodo=${selectedPeriod.value}`), fetch(`${apiUrl}/api/benchmark-competitors?periodo=${selectedPeriod.value}`)])

      if (resInsights.ok) listaInsights.value = await resInsights.json()
      if (resComps.ok) listaCompetidores.value = await resComps.json()
    } catch (error) {
      console.error('Error cargando la sección de Benchmark:', error)
    }
  }

  watch(selectedPeriod, () => {
    loadData()
  })

  onMounted(() => {
    loadData()
  })
</script>
