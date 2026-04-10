<template>
  <div class="py-12 px-8 bg-white font-sans text-gray-800 min-h-screen">
    <div class="max-w-7xl mx-auto min-h-screen">
      <h2 class="text-3xl font-black text-pluxeeBlue mb-8 uppercase">Benchmark: Pluxee vs. Competitors</h2>

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
          <tbody>
            <tr v-for="comp in listaCompetidores" :key="comp.id" :class="['border-b border-gray-200 hover:bg-gray-50 transition-colors', comp.is_main_brand ? 'bg-pluxeeYellow bg-opacity-20 font-bold' : 'bg-white']">
              <td class="p-4">
                <div class="text-pluxeeBlue text-lg">{{ comp.brand_name }}</div>
                <div class="text-xs text-gray-500 font-normal truncate max-w-xs">{{ comp.description }}</div>
              </td>

              <td class="p-4 text-center text-xl text-pluxeeBlue font-black">{{ comp.posts_count }}</td>
              <td class="p-4 text-center text-gray-800">{{ comp.frequency || 0 }} publicaciones/día</td>
              <td class="p-4 text-center text-gray-800">{{ comp.interaction || 0 }}</td>
              <td class="p-4 text-center text-gray-800">{{ comp.followers }}</td>

              <td class="p-4 align-middle">
                <div class="flex justify-center items-center w-full">
                  <TableCellSparkline :value="comp.gained_followers || 0" :dailyData="[]" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 space-y-2 text-sm text-pluxeeBlue font-medium">
        <p v-for="item in listaInsights" :key="item.id">✅ {{ item.insight }}</p>
      </div>

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
          <tbody>
            <tr v-for="comp in data" :key="comp.id" :class="['border-b border-gray-200 hover:bg-gray-50 transition-colors', comp.isClient ? 'bg-pluxeeYellow bg-opacity-20 font-bold' : 'bg-white']">
              <td class="p-4">
                <div class="text-pluxeeBlue text-lg">{{ comp.name }}</div>
                <div class="text-xs text-gray-500 font-normal truncate max-w-xs">{{ comp.description }}</div>
              </td>
              <td class="p-4 text-center text-xl text-pluxeeBlue font-black">{{ comp.posts }}</td>
              <td class="p-4 text-center text-gray-800">{{ comp.frequency || 0 }} publicaciones/día</td>
              <td class="p-4 text-center text-gray-800">{{ comp.Interaction || 0 }}</td>
              <td class="p-4 text-center text-gray-800">{{ comp.followers }}</td>
              <td class="p-4 align-middle">
                <div class="flex justify-center items-center w-full">
                  <TableCellSparkline :value="comp.gainedFollowers?.total || comp.gainedFollowers || 0" :dailyData="comp.gainedFollowers?.dailyHistory || []" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import TableCellSparkline from '@/components/TableCellSparkline.vue'

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

  // Quitamos los props porque ahora el componente se alimenta solo
  const listaInsights = ref([])
  const listaCompetidores = ref([])

  onMounted(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      // Hacemos el fetch a las rutas que acabamos de crear
      const [resInsights, resComps] = await Promise.all([fetch(`${apiUrl}/api/benchmark-insights`), fetch(`${apiUrl}/api/benchmark-competitors`)])

      if (resInsights.ok) listaInsights.value = await resInsights.json()
      if (resComps.ok) listaCompetidores.value = await resComps.json()
    } catch (error) {
      console.error('Error cargando la sección de Benchmark:', error)
    }
  })
</script>
