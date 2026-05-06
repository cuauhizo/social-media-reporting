<template>
  <section class="pdf-page w-full min-h-screen bg-pluxeeGreen relative overflow-hidden text-white">
    <div class="absolute top-10 right-10 w-32 h-32 border-4 border-pluxeeYellow rounded-full opacity-50 z-0"></div>
    <div class="absolute -bottom-12 -left-12 w-64 h-64 bg-pluxeeBlue rounded-full opacity-10 z-0"></div>

    <div class="absolute inset-0 flex justify-center pointer-events-none">
      <div class="w-full max-w-5xl h-full flex flex-col justify-between p-12 z-10 pointer-events-auto">
        <div>
          <h2 class="text-4xl font-light tracking-widest uppercase">{{ metadata.client }}</h2>
        </div>

        <div class="flex-1 flex flex-col justify-center">
          <h1 class="text-7xl font-black leading-tight">
            SOCIAL MEDIA
            <br />
            <span class="text-pluxeeYellow">REPORT</span>
          </h1>
          <p class="text-2xl mt-4 font-light tracking-wide">{{ metadata.period }}</p>
        </div>

        <div class="flex justify-between items-end">
          <div class="text-sm font-mono tracking-tighter">{{ metadata.agency }}</div>
          <div class="bg-pluxeeYellow p-4 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-pluxeeBlue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  defineProps({
    metadata: Object,
  })
</script>
