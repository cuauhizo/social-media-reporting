<template>
  <div class="py-16 px-8 bg-white border-t border-gray-200">
    <div class="max-w-7xl mx-auto min-h-screen">
      <h2 class="text-4xl font-black text-pluxeeBlue mb-12 text-center uppercase tracking-widest">Next Steps</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div class="bg-gray-50 p-8 rounded-2xl border-l-8 border-pluxeeYellow shadow-sm hover:shadow-md transition-shadow">
          <h3 class="text-2xl font-bold text-pluxeeBlue mb-6 flex items-center">
            <span class="text-3xl mr-3">💡</span>
            Propuestas
          </h3>
          <ul class="space-y-4">
            <li v-for="(item, index) in data.proposals" :key="'p' + index" class="flex items-start">
              <span class="text-pluxeeYellow font-black text-xl mr-3">+</span>
              <span class="text-gray-700 font-medium text-lg leading-relaxed">{{ item }}</span>
            </li>
          </ul>
        </div>

        <div class="bg-gray-50 p-8 rounded-2xl border-l-8 border-pluxeeGreen shadow-sm hover:shadow-md transition-shadow">
          <h3 class="text-2xl font-bold text-pluxeeBlue mb-6 flex items-center">
            <span class="text-3xl mr-3">🤝</span>
            Compromisos
          </h3>
          <ul class="space-y-4">
            <li v-for="(item, index) in data.commitments" :key="'c' + index" class="flex items-start">
              <span class="text-pluxeeBlue font-black text-xl mr-3">•</span>
              <span class="text-gray-700 font-medium text-lg leading-relaxed">{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="flex justify-center bg-tolkoRed text-white py-12 text-center min-h-screen">
    <div class="content-center items-center text-center">
      <h2 class="text-5xl font-black mb-4 uppercase">Thank You!</h2>
      <img src="@/assets/img/tolko-logo-blanco.png" alt="" class="m-auto w-40" />
    </div>
  </div>
</template>

<script setup>
  const props = defineProps({
    data: Object,
  })
</script>
