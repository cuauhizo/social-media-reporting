<template>
  <section class="pdf-page flex flex-col justify-center py-60 bg-white">
    <div class="max-w-5xl mx-auto p-4 flex flex-col md:flex-row gap-12 items-center w-full">
      <!-- <img src="../../public/pluxee.svg" class="w-40" alt="pluxee" /> -->
      <img src="../../public/x.svg" class="w-80" alt="pluxee" />
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

        <p v-if="puntosContexto.length === 0" class="text-gray-400 italic mt-4">No hay puntos registrados.</p>
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
