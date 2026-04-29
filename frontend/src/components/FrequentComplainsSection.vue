<template>
  <section class="pdf-page flex flex-col justify-center bg-white">
    <div class="max-w-7xl mx-auto w-full p-4">
      <h2 class="text-3xl font-black text-pluxeeBlue mb-8 uppercase keep-with-next">Frequent Complains</h2>
      <div class="no-break">
        <h3 class="text-xl text-center font-bold text-gray-800 mb-4 keep-with-next">Temas recurrentes escalados durante el mes</h3>

        <div class="grid grid-cols-12">
          <div class="col-span-12 md:col-span-8 md:col-start-3">
            <div class="bg-gray-50 p-6 rounded-xl shadow-md border-t-4 border-yellow-400">
              <ul class="space-y-3">
                <li v-for="(item, index) in listaQuejas" :key="item.id" class="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-200 no-break">
                  <div class="w-8 h-8 rounded-full bg-pluxeeBlue text-white flex justify-center items-center font-bold mr-4 shrink-0">
                    {{ index + 1 }}
                  </div>
                  <span class="text-gray-700 font-medium text-lg w-full">{{ item.queja }}</span>
                </li>
                <li v-if="listaQuejas.length === 0" class="text-gray-400 italic text-center p-4">No hay quejas registradas.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { usePeriod } from '@/composables/usePeriod'

  // Ya no dependemos de 'props', todo es reactivo a la base de datos
  const listaQuejas = ref([])
  const { selectedPeriod } = usePeriod()

  const loadData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      // MAGIA: Disparamos las peticiones
      const [resQuejas] = await Promise.all([fetch(`${apiUrl}/api/quejas?periodo=${selectedPeriod.value}`)])

      // 1. Llenamos las Quejas
      if (resQuejas.ok) listaQuejas.value = await resQuejas.json()
    } catch (error) {
      console.error('Error cargando la sección de Customer Service:', error)
    }
  }

  watch(selectedPeriod, loadData)
  onMounted(loadData)
</script>
