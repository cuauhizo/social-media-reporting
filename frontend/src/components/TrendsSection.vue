<template>
  <section class="pdf-page flex flex-col min-h-screen bg-white">
    <div class="w-full h-32 bg-gradient-to-r from-[#fcb045] via-[#fcb045] to-[#fcb045] shrink-0 flex items-center justify-center shadow-inner px-4">
      <h2 class="text-4xl text-center font-black text-white tracking-widest uppercase">Trends</h2>
    </div>
    <template v-if="data.topPosts && data.topPosts.length > 0">
      <section v-for="(grupoPosts, index) in agruparPorFilas(data.topPosts, 10)" :key="'pagina-post-ig-' + index" class="pdf-page flex flex-col justify-start min-h-screen bg-gray-50 p-8">
        <div class="max-w-7xl mx-auto w-full">
          <!-- <div v-if="index === 0"> -->
          <h3 class="text-2xl font-black text-pluxeeBlue mb-6 uppercase border-b-2 border-gray-100 py-4 keep-with-next">Top Posts (Instagram)</h3>
          <!-- </div>
        <div v-else class="mt-12"></div> -->

          <div v-for="(fila, indiceFila) in agruparPorFilas(grupoPosts, 5)" :key="'fila-post-ig-' + index + '-' + indiceFila" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <div v-for="post in fila" :key="post.id" class="flex flex-col shadow-md rounded-lg overflow-hidden">
              <div class="bg-pluxeeBlue h-40 flex justify-center items-center p-2">
                <img :src="post.img" class="object-contain h-full w-full" />
              </div>
              <div class="bg-pluxeeYellow p-3 text-pluxeeBlue text-sm">
                <p class="font-black text-xs mb-1">{{ post.type }}</p>
                <p>
                  <strong>Visualizaciones:</strong>
                  {{ formatNumber(post.views) }}
                </p>
                <p>
                  <strong>Interacciones:</strong>
                  {{ formatNumber(post.interactions) }}
                </p>
                <p>
                  <strong>shared o Saved:</strong>
                  {{ formatNumber(post.saved) }}
                </p>
                <p class="text-end">
                  <a :href="post.postPermalink" target="_blank"><strong>Ver en línea</strong></a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <section v-else class="pdf-page flex flex-col justify-center min-h-screen bg-gray-50 p-8">
      <div class="max-w-7xl mx-auto w-full">
        <h3 class="text-2xl font-black text-pluxeeBlue mb-6 uppercase border-b-2 border-gray-100 pb-4">Top Posts (Instagram)</h3>
        <div class="bg-white rounded-2xl p-8 text-center border border-gray-100 mt-6 mb-8">
          <p class="text-gray-500 font-medium">No se encontraron publicaciones en el feed de Instagram para este periodo.</p>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup>
  import { formatNumber } from '@/utils/formatters'

  //  FUNCIÓN PARA AGRUPAR EN PÁGINAS Y FILAS
  const agruparPorFilas = (arreglo, tamañoFila) => {
    if (!arreglo || !arreglo.length) return []
    return Array.from({ length: Math.ceil(arreglo.length / tamañoFila) }, (v, i) => arreglo.slice(i * tamañoFila, i * tamañoFila + tamañoFila))
  }

  defineProps({
    data: Object,
  })
</script>
