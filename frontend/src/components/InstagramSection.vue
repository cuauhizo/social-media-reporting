<template>
  <section class="pdf-page flex flex-col bg-white">
    <div class="w-full md:h-24 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] shrink-0 flex items-center justify-center shadow-inner p-4">
      <h2 class="text-4xl text-center font-black text-white tracking-widest uppercase">Instagram Metrics {{ data.username }}</h2>
    </div>
    <div class="flex-1 flex flex-col justify-center">
      <div class="max-w-7xl mx-auto p-4">
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <div class="bg-gray-50 p-6 rounded-xl border-l-4 border-[#e1306c] shadow-sm">
                <p class="text-gray-500 text-sm font-bold">Followers</p>
                <div class="flex items-baseline gap-3 mt-1 justify-start">
                  <h2 class="text-3xl font-black text-pluxeeBlue">{{ formatNumber(data.kpis.total_followers) }}</h2>
                  <span v-if="data.kpis.followers_diff" class="flex items-center rounded-full py-0.5 px-2 text-xs font-bold mb-0.5 gap-1" :class="data.kpis.followers_diff.increase ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'">
                    <TrendingUp v-if="data.kpis.followers_diff.increase" class="w-4 h-4" />
                    <TrendingDown v-else class="w-4 h-4" />
                    {{ data.kpis.followers_diff.pct }}
                  </span>
                </div>
              </div>
              <div class="bg-gray-50 p-6 rounded-xl border-l-4 border-[#e1306c] shadow-sm">
                <p class="text-gray-500 text-sm font-bold">Page Engagement</p>
                <h2 class="text-3xl font-black text-pluxeeBlue">{{ data.kpis.page_engagement_rate }}</h2>
              </div>
              <div class="bg-gray-50 p-6 rounded-xl border-l-4 border-[#f56040] shadow-sm md:col-span-2 flex justify-between items-center">
                <div>
                  <p class="text-gray-500 text-sm font-bold">Total Stories</p>
                  <h2 class="text-3xl font-black text-pluxeeBlue">{{ formatNumber(data.kpis.stories_metrics.total) }}</h2>
                </div>
                <div class="text-sm text-gray-700 space-y-1 text-right">
                  <p>
                    <strong>Story taps forward:</strong>
                    {{ formatNumber(data.kpis.stories_metrics.forward) }}
                  </p>
                  <p>
                    <strong>Story taps back:</strong>
                    {{ formatNumber(data.kpis.stories_metrics.back) }}
                  </p>
                  <p>
                    <strong>Story exit:</strong>
                    {{ formatNumber(data.kpis.stories_metrics.exit) }}
                  </p>
                </div>
              </div>
              <div class="bg-gray-50 p-6 rounded-xl border-l-4 border-[#e1306c] shadow-sm">
                <p class="text-gray-500 text-sm font-bold">Post Saves</p>
                <h2 class="text-3xl font-black text-pluxeeBlue">{{ formatNumber(data.kpis.post_saves) }}</h2>
              </div>
              <div class="bg-gray-50 p-6 rounded-xl border-l-4 border-[#e1306c] shadow-sm">
                <p class="text-gray-500 text-sm font-bold">Post Likes</p>
                <h2 class="text-3xl font-black text-pluxeeBlue">{{ formatNumber(data.kpis.post_likes) }}</h2>
              </div>
              <div class="bg-gray-50 p-6 rounded-xl border-l-4 border-[#e1306c] shadow-sm">
                <p class="text-gray-500 text-sm font-bold">Impressions</p>
                <div class="flex items-baseline gap-3 mt-1 justify-start">
                  <h2 class="text-3xl font-black text-pluxeeBlue">{{ formatNumber(data.kpis.post_impressions) }}</h2>
                  <span
                    v-if="data.kpis.post_impressions_diff"
                    class="flex items-center rounded-full py-0.5 px-2 text-xs font-bold mb-0.5 gap-1"
                    :class="data.kpis.post_impressions_diff.increase ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'">
                    <TrendingUp v-if="data.kpis.post_impressions_diff.increase" class="w-4 h-4" />
                    <TrendingDown v-else class="w-4 h-4" />
                    {{ data.kpis.post_impressions_diff.pct }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-6">
            <div class="h-full flex flex-col bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeGreen">
              <table class="w-full h-full text-left">
                <thead>
                  <tr class="text-gray-400 text-sm border-b border-gray-100">
                    <th class="pb-1.5 font-medium w-8 text-center">#</th>
                    <th class="pb-1.5 font-medium">City</th>
                    <th class="pb-1.5 font-medium text-right">Followers</th>
                  </tr>
                </thead>
                <tbody v-if="data.topCities && data.topCities.length > 0">
                  <tr v-for="(city, index) in data.topCities" :key="index" class="no-break border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td class="py-1 text-gray-400 font-medium text-center text-sm">{{ index + 1 }}</td>
                    <td class="py-1 pr-1">
                      <div class="text-sm text-gray-700">{{ city.name }}</div>
                    </td>
                    <td class="py-1 text-right text-pluxeeBlue font-bold">{{ formatNumber(city.followers) }}</td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td colspan="3" class="py-10 text-center text-gray-400 font-medium text-sm">No se encontraron datos de ciudades para este periodo.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="col-span-12 md:col-span-6 lg:col-span-3">
            <ReachChart class="h-full" :reachData="data.kpis.reach_by_type" />
          </div>
          <div class="col-span-12 md:col-span-6 lg:col-span-3">
            <SentimentChart class="h-full" :sentimentData="data.kpis.sentiment" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="pdf-page flex flex-col justify-center bg-gray-100">
    <div class="max-w-7xl mx-auto w-full p-4">
      <h2 class="text-2xl font-black text-pluxeeBlue mb-6 uppercase keep-with-next">Followers</h2>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 xl:col-span-7 xl:col-start-4">
          <!-- <pre>{{ data }}</pre> -->
          <div class="col-span-12 no-break">
            <FollowerGrowthChart color="#e1306c" class="" v-if="data.kpis && Array.isArray(data.kpis.historicalFollowers) && data.kpis.historicalFollowers.length > 0" :chartData="data.kpis.historicalFollowers" />
            <div v-else>
              <div class="bg-white rounded-2xl p-8 text-center border border-gray-100 mt-6 mb-8">
                <p class="text-gray-500 font-medium">No se encontraron seguidores en el feed de Instagram para este periodo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <template v-if="data.topPosts && data.topPosts.length > 0">
    <section v-for="(grupoPosts, index) in agruparPorFilas(data.topPosts, 10)" :key="'pagina-post-ig-' + index" class="pdf-page flex flex-col justify-start bg-gray-50">
      <div class="max-w-7xl mx-auto w-full p-4">
        <!-- <div v-if="index === 0"> -->
        <h3 class="text-2xl font-black text-pluxeeBlue mb-4 uppercase border-b-2 border-gray-100 pb-4 keep-with-next">Top Posts (Instagram)</h3>
        <!-- </div>
        <div v-else class="mt-12"></div> -->

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          <div v-for="post in grupoPosts" :key="post.id" class="flex flex-col w-full max-w-64 shadow-md rounded-lg overflow-hidden bg-white mx-auto">
            <div class="bg-pluxeeBlue h-40 flex justify-center items-center p-2">
              <img :src="getSafeImageUrl(post.img)" class="!w-full !h-full !object-cover !object-center" />
            </div>

            <div class="bg-pluxeeYellow p-3 text-pluxeeBlue text-sm flex-1 flex flex-col justify-between">
              <div>
                <p class="font-black text-xs mb-2 uppercase tracking-widest text-center">{{ post.type }}</p>
                <p>
                  <strong>Visualizaciones:</strong>
                  {{ formatNumber(post.views) }}
                </p>
                <p>
                  <strong>Interacciones:</strong>
                  {{ formatNumber(post.interactions) }}
                </p>
                <p>
                  <strong>Shared o Saved:</strong>
                  {{ formatNumber(post.saved) }}
                </p>
              </div>
              <p class="text-end mt-2">
                <a :href="post.postPermalink" target="_blank" class="hover:underline"><strong>Ver en línea</strong></a>
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

  <template v-if="data.topStories && data.topStories.length > 0">
    <section v-for="(grupoStories, index) in agruparPorFilas(data.topStories, 10)" :key="'pagina-story-' + index" class="pdf-page flex flex-col justify-start bg-white">
      <div class="max-w-7xl mx-auto w-full p-4">
        <!-- <div v-if="index === 0" class="no-break"> -->
        <h3 class="text-2xl font-black text-pluxeeBlue mb-4 uppercase border-b-2 border-gray-100 pb-4 keep-with-next">Top Stories</h3>
        <!-- </div>
        <div v-else class="mt-12"></div> -->

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <div v-for="story in grupoStories" :key="story.id" class="flex flex-col w-full max-w-64 shadow-sm border border-orange-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white mx-auto">
            <div class="bg-gray-100 h-44 flex justify-center items-center relative overflow-hidden p-1">
              <div class="w-full h-full rounded-xl p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600">
                <img :src="getSafeImageUrl(story.img)" @error="$event.target.src = 'https://placehold.co/300x400/17ccf9/ffffff?text=Story+Sin+Imagen'" class="!h-full !w-full !object-cover !object-center rounded-lg border-2 border-white" />
              </div>
              <span class="absolute top-4 right-4 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                {{ story.type }}
              </span>
            </div>

            <div class="p-4 flex flex-col gap-0.5 bg-orange-50/30 flex-1 justify-center">
              <div class="flex justify-between items-center">
                <span class="text-gray-500 text-sm font-medium">Views</span>
                <span class="text-lg font-black text-orange-600">{{ formatNumber(story.views) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500 text-sm font-medium">Reach</span>
                <span class="text-lg font-black text-orange-600">{{ formatNumber(story.reach) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-500 text-sm font-medium">Shares</span>
                <span class="text-lg font-black text-orange-600">{{ formatNumber(story.shares) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </template>

  <section v-else class="pdf-page flex flex-col justify-center min-h-screen bg-white p-8">
    <div class="max-w-7xl mx-auto w-full">
      <h3 class="text-2xl font-black text-pluxeeBlue mb-6 uppercase border-b-2 border-gray-100 pb-4">Top Stories</h3>
      <div class="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 mb-8">
        <p class="text-gray-500 font-medium">No se publicaron historias en Instagram durante este periodo.</p>
      </div>
    </div>
  </section>

  <TrendsInstagramSection :data="data" />

  <section class="pdf-page flex flex-col justify-center bg-gray-100">
    <div class="max-w-7xl mx-auto w-full p-4">
      <h2 class="text-2xl font-black text-pluxeeBlue mb-2 uppercase keep-with-next">Post metrics Tolko - Pluxee</h2>
      <TagsTable :tags="data.reachByTags" :topPosts="[...(data.topPosts || []), ...(data.topStories || [])]" />
    </div>
  </section>
</template>

<script setup>
  import { formatNumber } from '@/utils/formatters'
  import SentimentChart from './SentimentChart.vue'
  import TrendsInstagramSection from '@/components/TrendsInstagramSection.vue'
  import TagsTable from './TagsTable.vue'
  import { TrendingDown, TrendingUp } from 'lucide-vue-next'
  import ReachChart from './ReachChart.vue'
  import FollowerGrowthChart from '@/components/FollowerGrowthChart.vue'

  //  FUNCIÓN PARA AGRUPAR EN PÁGINAS Y FILAS
  const agruparPorFilas = (arreglo, tamañoFila) => {
    if (!arreglo || !arreglo.length) return []
    return Array.from({ length: Math.ceil(arreglo.length / tamañoFila) }, (v, i) => arreglo.slice(i * tamañoFila, i * tamañoFila + tamañoFila))
  }

  defineProps({
    data: Object,
  })

  // 🚀 Función para blindar las URLs de las imágenes de IG
  const getSafeImageUrl = url => {
    if (!url) return 'https://placehold.co/300x400/ff7375/ffffff?text=IG+Sin+Imagen'
    if (url.startsWith('http') || url.startsWith('data:')) return url
    const cleanUrl = url.replace(/\\/g, '/')
    const backendBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    return `${backendBaseUrl}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`
  }
</script>
