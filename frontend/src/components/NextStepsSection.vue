<template>
  <section class="pdf-page">
    <div class="py-16 px-8 bg-white border-t border-gray-200">
      <div class="max-w-7xl mx-auto min-h-screen">
        <h2 class="text-4xl font-black text-pluxeeBlue mb-12 text-center uppercase tracking-widest">Next Steps</h2>
        <!-- <pre>{{ data }}</pre> -->
        <!-- <pre>{{ listaPropuestas }}</pre> -->
        <!-- <pre>{{ listaCompromisos }}</pre> -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div class="bg-gray-50 p-8 rounded-2xl border-l-8 border-pluxeeYellow shadow-sm hover:shadow-md transition-shadow">
            <h3 class="text-2xl font-bold text-pluxeeBlue mb-6 flex items-center">
              <span class="text-3xl mr-3">💡</span>
              Propuestas
            </h3>
            <ul class="space-y-4">
              <li v-for="item in listaPropuestas" :key="item.id" class="flex items-start">
                <span class="text-pluxeeYellow font-black text-xl mr-3">+</span>
                <span class="text-gray-700 font-medium text-lg leading-relaxed">{{ item.propuesta }}</span>
              </li>
            </ul>
          </div>

          <div class="bg-gray-50 p-8 rounded-2xl border-l-8 border-pluxeeGreen shadow-sm hover:shadow-md transition-shadow">
            <h3 class="text-2xl font-bold text-pluxeeBlue mb-6 flex items-center">
              <span class="text-3xl mr-3">🤝</span>
              Compromisos
            </h3>
            <ul class="space-y-4">
              <li v-for="item in listaCompromisos" :key="item.id" class="flex items-start">
                <span class="text-pluxeeBlue font-black text-xl mr-3">•</span>
                <span class="text-gray-700 font-medium text-lg leading-relaxed">{{ item.compromiso }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const listaPropuestas = ref([])
  const listaCompromisos = ref([])
  const props = defineProps({
    data: Object,
  })

  onMounted(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const resProuetas = await fetch(`${apiUrl}/api/propuestas`)
      const resCompromisos = await fetch(`${apiUrl}/api/compromisos`)
      if (!resProuetas.ok) throw new Error('Error al cargar propuestas')
      if (!resCompromisos.ok) throw new Error('Error al cargar Compromisos')

      listaPropuestas.value = await resProuetas.json()
      listaCompromisos.value = await resCompromisos.json()
    } catch (error) {
      console.error('Error cargando propuestas:', error)
    }
  })
</script>
