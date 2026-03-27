<template>
  <div class="py-12 px-8 bg-white font-sans text-gray-800 min-h-screen">
    <div class="max-w-7xl mx-auto min-h-screen">
      <h2 class="text-3xl font-black text-pluxeeBlue mb-8 uppercase">Benchmark: Pluxee vs. Competitors</h2>

      <div v-if="clientData" class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <BenchmarkKpiCard
          title="Aumento de la Audiencia"
          :value="`+${clientData.gainedFollowers?.total || clientData.gainedFollowers || 0}`"
          subtitle="Seguidores ganados"
          :percentage="clientData.gainedFollowers?.comparePercent || '0%'"
          :increase="true"
          :dailyData="clientData.gainedFollowers?.dailyHistory || []"
          valueColor="text-green-500"
          graphColor="#10b981" />

        <BenchmarkKpiCard
          title="Publicaciones en el Periodo"
          :value="clientData.postsGained?.total || clientData.posts || 0"
          subtitle="Posts realizados"
          :percentage="clientData.postsGained?.comparePercent || '0%'"
          :increase="true"
          :dailyData="clientData.postsGained?.dailyHistory || []"
          valueColor="text-pluxeeBlue"
          graphColor="#002d72" />
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
              <td class="p-4 flex justify-center items-center">
                <TableCellSparkline :value="comp.gainedFollowers?.total || comp.gainedFollowers || 0" :dailyData="comp.gainedFollowers?.dailyHistory || []" :color="comp.isClient ? '#002d72' : '#cc0032'" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6 space-y-2 text-sm text-pluxeeBlue font-medium">
        <p>✅ Seguimos siendo la cuenta con más posts orgánicos vs. los competidores.</p>
        <p>✅ Nos mantenemos con buenas interacciones por parte de publicaciones orgánicas, lo que refleja una comunidad activa.</p>
        <p>🛡️ Tras un nuevo ataque de bots, se lograron mantener resultados positivos y se observan señales de mejora.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue' // ✨ NECESITAMOS IMPORTAR COMPUTED
  import BenchmarkKpiCard from '@/components/BenchmarkKpiCard.vue'
  import TableCellSparkline from '@/components/TableCellSparkline.vue' // ✨ NUEVA IMPORTACIÓN

  const props = defineProps({
    data: {
      type: Array, // Cambiado a Array ya que lo usas en un v-for
      default: () => [],
    },
  })

  // ✨ BUSCAMOS AUTOMÁTICAMENTE LOS DATOS DE NUESTRO CLIENTE (Pluxee) ✨
  const clientData = computed(() => {
    if (!props.data || props.data.length === 0) return null
    return props.data.find(brand => brand.isClient)
  })
</script>
