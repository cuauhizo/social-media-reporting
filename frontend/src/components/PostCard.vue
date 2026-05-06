<template>
  <div class="flex flex-col w-full max-w-64 shadow-lg rounded-lg overflow-hidden mx-auto">
    <div class="bg-pluxeeBlue p-2 h-36">
      <div class="w-full h-full bg-cover bg-center bg-no-repeat rounded-sm" :style="{ backgroundImage: `url(${getImageUrl})` }"></div>
    </div>
    <div class="bg-pluxeeYellow p-3 text-pluxeeBlue font-sans">
      <div class="font-bold text-xs mb-1 uppercase tracking-widest text-center">
        {{ post.type }}
      </div>
      <div class="text-sm space-y-0.5">
        <p>
          <strong>Visualizaciones:</strong>
          {{ formatNumber(post.views) }}
        </p>
        <p>
          <strong>Alcance:</strong>
          {{ post.reach }}
        </p>
        <p>
          <strong>Interactions:</strong>
          {{ post.interactions }}
        </p>
        <p>
          <strong>Shared o saved:</strong>
          {{ post.saved }}
        </p>
        <p class="text-end">
          <a :href="post.postPermalink" target="_blank"><strong>Ver en línea</strong></a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { formatNumber } from '@/utils/formatters'
  const props = defineProps({
    post: Object,
  })

  // ✨ NUEVA FUNCIÓN: Formatea la ruta de la imagen
  const getImageUrl = computed(() => {
    const url = props.post.img

    // 1. Si no hay imagen, regresamos un placeholder gris
    if (!url) return '/favicon.ico' // O la ruta a tu logo gris

    // 2. Si la URL ya viene completa de Hootsuite (ej. https://scontent...)
    if (url.startsWith('http')) return url

    // 3. Si la ruta viene con barras invertidas de Windows (\), las cambiamos por normales (/)
    const cleanUrl = url.replace(/\\/g, '/')

    // 4. Le pegamos la URL de tu backend (Ajusta el puerto si tu backend no es el 3000)
    const backendBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

    // Aseguramos que haya un "/" entre el backend y la ruta
    return `${backendBaseUrl}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`
  })
</script>
