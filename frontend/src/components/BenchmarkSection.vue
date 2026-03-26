<template>
  <div class="py-12 px-8 bg-white font-sans text-gray-800 min-h-screen">
    <div class="max-w-7xl mx-auto min-h-screen">
      <h2 class="text-3xl font-black text-pluxeeBlue mb-8 uppercase">Benchmark: Pluxee vs. Competitors</h2>

      <!-- <pre>{{ data }}</pre> -->

      <div class="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-pluxeeBlue text-white">
              <th class="p-4 font-bold uppercase text-sm">Página</th>
              <th class="p-4 font-bold uppercase text-sm text-center">Seguidores</th>
              <th class="p-4 font-bold uppercase text-sm text-center">Seguimiento</th>
              <th class="p-4 font-bold uppercase text-sm text-center">Contenido Publicado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="comp in data" :key="comp.id" :class="['border-b border-gray-200 hover:bg-gray-50 transition-colors', comp.isClient ? 'bg-pluxeeYellow bg-opacity-20 font-bold' : 'bg-white']">
              <td class="p-4">
                <div class="text-pluxeeBlue text-lg">{{ comp.name }}</div>
                <div class="text-xs text-gray-500 font-normal truncate max-w-xs">{{ comp.description }}</div>
              </td>
              <td class="p-4 text-center text-gray-800">{{ comp.followers }}</td>
              <td class="p-4 text-center text-gray-800">{{ comp.following }}</td>
              <td class="p-4 text-center text-xl text-pluxeeBlue font-black">{{ comp.posts }}</td>
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
  defineProps({
    data: Object,
  })
</script>
