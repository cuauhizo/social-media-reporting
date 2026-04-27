<template>
  <template v-if="data && data.trendPosts && data.trendPosts.length > 0">
    <section v-for="(grupo, index) in agruparPorFilas(data.trendPosts, 10)" :key="'trend-ig-pg-' + index" class="pdf-page flex flex-col bg-white">
      <div v-if="index === 0">
        <div class="w-full md:h-24 bg-pluxeePink shrink-0 flex items-center justify-center shadow-inner p-4">
          <h2 class="text-4xl text-center font-black text-white tracking-widest uppercase">Trends</h2>
        </div>
      </div>
      <div v-else class="mt-12"></div>
      <div class="flex-1 flex flex-col justify-start w-full">
        <!-- <pre>{{ data.trendPosts }}</pre> -->
        <div class="max-w-7xl mx-auto w-full p-4">
          <div v-for="(fila, iFila) in agruparPorFilas(grupo, 5)" :key="'fila-trend-ig-' + index + '-' + iFila" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
            <PostCard v-for="post in fila" :key="post.id" :post="post" />
          </div>
        </div>
      </div>
    </section>
  </template>
</template>

<script setup>
  import PostCard from '@/components/PostCard.vue'

  const props = defineProps({
    data: Object, // Recibe el objeto 'data.instagram'
  })

  const agruparPorFilas = (arreglo, tamaño) => {
    if (!arreglo || !arreglo.length) return []
    return Array.from({ length: Math.ceil(arreglo.length / tamaño) }, (v, i) => arreglo.slice(i * tamaño, i * tamaño + tamaño))
  }
</script>
