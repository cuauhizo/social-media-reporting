<template>
  <section class="pdf-page flex flex-col justify-center min-h-screen p-8 bg-white border-b border-gray-200">
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center w-full no-break">
      <div class="w-40 h-40 bg-pluxeeYellow shrink-0 flex justify-center items-center shadow-lg clip-x">
        <div class="w-32 h-32 bg-white transform rotate-45 flex justify-center items-center">
          <div class="w-24 h-24 bg-pluxeeYellow"></div>
        </div>
      </div>

      <div class="flex-1">
        <h2 class="text-4xl font-black text-pluxeeBlue mb-6 uppercase tracking-wide keep-with-next">
          {{ data.title || 'Contexto Actual (RRSS)' }}
        </h2>

        <ul class="space-y-4 text-gray-700 text-lg font-medium">
          <li v-for="item in puntosContexto" :key="item.id" class="flex items-start">
            <span class="text-pluxeeBlue font-black mr-4 text-2xl leading-none">•</span>
            <span>{{ item.punto }}</span>
          </li>
        </ul>

        <p v-if="puntosContexto.length === 0" class="text-gray-400 italic mt-4">Sin contexto actual...</p>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const puntosContexto = ref([])

  defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
  })

  onMounted(async () => {
    try {
      //  1. DECLARAMOS LA VARIABLE apiUrl AQUÍ TAMBIÉN
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      // 2. Hacemos la petición a MySQL
      const res = await fetch(`${apiUrl}/api/contexto`)
      if (!res.ok) throw new Error('Error al cargar el contexto')

      puntosContexto.value = await res.json()
    } catch (error) {
      console.error('Error cargando los puntos de contexto:', error)
    }
  })
</script>
