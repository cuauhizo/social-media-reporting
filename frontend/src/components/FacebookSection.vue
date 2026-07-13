<template>
  <section class="pdf-page flex flex-col bg-gray-100">
    <div class="w-full md:h-24 bg-[#1877F2] shrink-0 flex items-center justify-center shadow-inner p-4">
      <h2 class="text-4xl text-center font-black text-white tracking-widest uppercase">Facebook Metrics {{ data.username }}</h2>
    </div>
    <!-- <pre>{{ data }}</pre> -->
    <div class="flex-1 flex flex-col justify-start p-4 w-full">
      <div class="max-w-7xl mx-auto w-full">
        <h1 class="text-2xl font-bold text-pluxeeBlue">Social Media Report - {{ data.kpis.month }}</h1>
        <div class="w-full">
          <div class="max-w-7xl mx-auto py-4">
            <div class="w-full h-48 bg-gray-200 rounded-2xl overflow-hidden relative border-x border-b border-gray-200">
              <div v-if="data.coverImage" class="w-full h-full bg-cover bg-center bg-no-repeat" :style="{ backgroundImage: `url(${data.coverImage})` }"></div>
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400 bg-pluxeeBlue/10 text-center p-4">
                <span class="font-bold uppercase tracking-widest italic opacity-50">Sin foto de portada registrada para este periodo</span>
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 xl:col-span-9">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-center h-full">
              <KpiCard title="Page Engagement" :value="formatNumber(data.kpis.interactions)" />
              <KpiCard title="Total followers" :value="formatNumber(data.kpis.total_followers)" :diff="data.kpis.followers_diff" />
              <KpiCard title="Clicks organic Link" :value="formatNumber(data.kpis.clics)" />
              <KpiCard title="Post shares" :value="data.kpis.shares" />
              <KpiCard title="Responding" :value="data.kpis.responding" />
              <!-- <KpiCard title="Post engagement rate" :value="data.kpis.post_engagement_rate" :diff="data.kpis.post_engagement_rate_diff" /> -->
              <KpiCard title="Post engagement rate" :value="data.kpis.post_engagement_rate" />
              <KpiCard title="Post impressions" :value="formatNumber(data.kpis.post_impressions)" :diff="data.kpis.post_impressions_diff" />
              <KpiCard title="Response time" :value="data.kpis.response_time" />
              <KpiCard title="Page organic reach" :value="formatNumber(data.kpis.page_organic_reach)" />
              <KpiCard title="Views from non-followers" :value="formatNumber(data.kpis.page_no_followers_views)" />
              <KpiCard title="Views from followers" :value="formatNumber(data.kpis.page_followers_views)" />
              <KpiCard title="New followers" :value="formatNumber(data.kpis.new_followers)" :diff="data.kpis.new_followers_diff" />
            </div>
          </div>
          <div class="col-span-12 xl:col-span-3">
            <SentimentChart :sentimentData="data.kpis.sentiment" />
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="pdf-page flex flex-col justify-center bg-gray-100">
    <div class="max-w-7xl mx-auto p-4 w-full">
      <h2 class="text-2xl font-black text-pluxeeBlue mb-6 uppercase keep-with-next">Top Cities by Followers</h2>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 xl:col-span-5">
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
                  <td class="py-2 text-gray-400 font-medium text-center text-sm">{{ index + 1 }}</td>
                  <td class="py-2 pr-2">
                    <div class="text-sm text-gray-700">{{ city.name }}</div>
                  </td>
                  <td class="py-2 text-right text-pluxeeBlue font-bold">{{ formatNumber(city.followers) }}</td>
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

        <div class="col-span-12 xl:col-span-7">
          <FollowerGrowthChart color="#1877F2" class="h-full" v-if="data.kpis && Array.isArray(data.kpis.historicalFollowers) && data.kpis.historicalFollowers.length > 0" :chartData="data.kpis.historicalFollowers" />
        </div>
      </div>
    </div>
  </section>

  <template v-if="data.topPosts && data.topPosts.length > 0">
    <section v-for="(grupo, index) in agruparPorFilas(data.topPosts, 10)" :key="'pagina-post-' + index" class="pdf-page flex flex-col justify-start bg-gray-50">
      <div class="max-w-7xl mx-auto p-4 w-full">
        <div v-if="index === 0">
          <h2 class="text-2xl font-black text-pluxeeBlue mb-2 uppercase keep-with-next">Post Metrics</h2>
          <p class="text-sm text-gray-600 mb-2 font-bold">Ordenados de mayor a menor alcance en Facebook</p>
        </div>
        <div v-else class="mt-12"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          <PostCard v-for="post in grupo" :key="post.id" :post="post" />
        </div>
      </div>
    </section>
  </template>

  <section v-else class="pdf-page flex flex-col justify-center min-h-screen bg-gray-50 p-8">
    <div class="max-w-7xl mx-auto w-full">
      <h2 class="text-2xl font-black text-pluxeeBlue mb-2 uppercase">Post Metrics</h2>
      <div class="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 mt-6">
        <p class="text-gray-500 font-medium">No se encontraron publicaciones en Facebook para este periodo.</p>
      </div>
    </div>
  </section>

  <TrendsFacebookSection :data="data" />

  <section class="pdf-page flex flex-col justify-center bg-gray-100">
    <div class="max-w-7xl mx-auto w-full p-4">
      <h2 class="text-2xl font-black text-pluxeeBlue mb-2 uppercase keep-with-next">Post metrics Tolko - Pluxee</h2>
      <TagsTable :tags="data.reachByTags" :topPosts="data.topPosts" />
    </div>
  </section>
</template>

<script setup>
  import PostCard from '@/components/PostCard.vue'
  import SentimentChart from '@/components/SentimentChart.vue'
  import TrendsFacebookSection from '@/components/TrendsFacebookSection.vue'
  import TagsTable from './TagsTable.vue'
  import KpiCard from '@/components/KpiCard.vue'
  import FollowerGrowthChart from '@/components/FollowerGrowthChart.vue'
  import { formatNumber } from '@/utils/formatters'

  //  LA FUNCIÓN MATEMÁTICA QUE DIVIDE EL ARREGLO
  const agruparPorFilas = (arreglo, tamañoFila) => {
    if (!arreglo || !arreglo.length) return []
    return Array.from({ length: Math.ceil(arreglo.length / tamañoFila) }, (v, i) => arreglo.slice(i * tamañoFila, i * tamañoFila + tamañoFila))
  }

  defineProps({
    data: Object,
  })
</script>
