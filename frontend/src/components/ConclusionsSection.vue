<template>
  <section class="pdf-page flex flex-col justify-center bg-gray-50 border-t border-gray-200">
    <div class="max-w-4xl mx-auto w-full p-4 no-break">
      <div class="text-center mb-10">
        <h2 class="text-4xl font-black text-pluxeeBlue uppercase tracking-wide keep-with-next">Conclusión del Mes</h2>
        <div class="h-1 w-24 bg-pluxeeYellow mx-auto mt-6"></div>
      </div>

      <div class="bg-white p-10 md:p-14 rounded-3xl shadow-xl border border-gray-100 text-center relative overflow-hidden">
        <div class="absolute -top-10 -left-10 text-9xl text-gray-100 font-serif opacity-50">"</div>

        <p v-if="textoConclusion" class="text-gray-700 text-xl font-medium leading-relaxed relative z-10">
          {{ textoConclusion }}
        </p>
        <p v-else class="text-gray-400 italic relative z-10">Sin conclusión aún...</p>

        <div class="absolute -bottom-16 -right-10 text-9xl text-gray-100 font-serif opacity-50">"</div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { usePeriod } from '@/composables/usePeriod'

  const textoConclusion = ref('')
  const { selectedPeriod } = usePeriod()

  const loadData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const res = await fetch(`${apiUrl}/api/conclusiones?periodo=${selectedPeriod.value}`)

      if (res.ok) {
        const data = await res.json()
        // Como solo queremos un párrafo, tomamos el texto del primer elemento del arreglo
        if (data.length > 0) {
          textoConclusion.value = data[0].conclusion
        }
      }
    } catch (error) {
      console.error('Error cargando la conclusión:', error)
    }
  }

  watch(selectedPeriod, loadData)
  onMounted(loadData)
</script>
