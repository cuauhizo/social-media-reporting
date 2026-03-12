<template>
  <div class="py-20 px-12 min-h-screen bg-white flex items-center border-b border-gray-200">
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
      <div class="w-40 h-40 bg-[#ffeb00] shrink-0 flex justify-center items-center shadow-lg clip-x">
        <div class="w-32 h-32 bg-white transform rotate-45 flex justify-center items-center">
          <div class="w-24 h-24 bg-[#ffeb00]"></div>
        </div>
      </div>

      <div>
        <h2 class="text-4xl font-black text-[#002d72] mb-6 uppercase tracking-wide">
          {{ data.title }}
        </h2>
        <ul class="space-y-4 text-gray-700 text-lg font-medium">
          <li v-for="(item, index) in data.insights" :key="index" class="flex items-start">
            <span class="text-[#002d72] font-black mr-4 text-2xl leading-none">•</span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    data: Object,
  })
</script>
