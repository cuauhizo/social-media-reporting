<template>
  <section class="pdf-page">
    <div class="w-full h-32 bg-[#1877F2] flex items-center justify-center shadow-inner px-4">
      <h2 class="text-4xl text-center font-black text-white tracking-widest uppercase">Facebook Metrics {{ data.username }}</h2>
    </div>
    <div class="p-8 bg-gray-100">
      <div class="max-w-7xl mx-auto min-h-screen">
        <!-- <pre>{{ data }}</pre> -->
        <h1 class="text-2xl font-bold text-pluxeeBlue mb-6">Social Media Report - {{ data.kpis.month }}</h1>

        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12 xl:col-span-9">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <KpiCard title="Page Engagement" :value="formatNumber(data.kpis.interactions)" />
              <KpiCard title="Total followers" :value="formatNumber(data.kpis.followers)" />
              <KpiCard title="Clicks organic Link" :value="formatNumber(data.kpis.clics)" />
              <KpiCard title="Post shares" :value="data.kpis.shares" />
              <KpiCard title="Responding" :value="data.kpis.responding" />
              <KpiCard title="Post engagement rate" :value="data.kpis.post_engagement_rate" />
              <KpiCard title="Post impressions" :value="formatNumber(data.kpis.post_impressions)" />
              <KpiCard title="Response time" :value="data.kpis.response_time" />
              <KpiCard title="Page organic reach" :value="formatNumber(data.kpis.page_organic_reach)" />
              <KpiCard title="Views from non-followers" :value="formatNumber(data.kpis.page_no_followers_views)" />
              <KpiCard title="Views from followers" :value="formatNumber(data.kpis.page_followers_views)" />
            </div>
            <div class="grid grid-cols-1 gap-8 mt-4">
              <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeGreen">
                <table class="w-full text-left">
                  <thead>
                    <tr class="text-gray-400 text-sm border-b border-gray-100">
                      <th class="pb-1.5 font-medium w-8 text-center">#</th>
                      <th class="pb-1.5 font-medium">City</th>
                      <th class="pb-1.5 font-medium text-right">Followers</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(city, index) in data.topCities" :key="index" class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td class="py-2 text-gray-400 font-medium text-center text-sm">{{ index + 1 }}</td>
                      <td class="py-2 pr-2">
                        <div class="text-sm text-gray-700">{{ city.name }}</div>
                      </td>
                      <td class="py-2 text-right text-pluxeeBlue">{{ formatNumber(city.followers) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="col-span-12 xl:col-span-3">
            <SentimentChart :sentimentData="data.kpis.sentiment" />
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="pdf-page">
    <div class="bg-gray-50">
      <div class="max-w-7xl mx-auto min-h-screen px-4">
        <h2 class="text-2xl font-black text-pluxeeBlue mb-2 uppercase">Post Metrics</h2>
        <p class="text-sm text-gray-600 mb-8 font-bold">Ordenados de mayor a menor alcance en Facebook</p>
        <!-- <pre>{{ data.topPosts }}</pre> -->
        <div v-if="data.topPosts && data.topPosts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          <PostCard v-for="post in data.topPosts" :key="post.id" :post="post" class="no-break" />
        </div>

        <div v-else class="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 mt-6">
          <p class="text-gray-500 font-medium">No se encontraron publicaciones en Facebook para este periodo.</p>
        </div>
      </div>
    </div>
  </section>
  <section class="pdf-page">
    <div class="bg-gray-100 min-h-screen">
      <div class="max-w-7xl mx-auto px-4">
        <h2 class="text-2xl font-black text-pluxeeBlue mb-2 uppercase">Post metrics Tolko - Pluxee</h2>
        <TagsTable :tags="data.reachByTags" :topPosts="data.topPosts" />
      </div>
    </div>
  </section>
</template>

<script setup>
  import PostCard from '@/components/PostCard.vue'
  import SentimentChart from '@/components/SentimentChart.vue'
  import TagsTable from './TagsTable.vue'
  import KpiCard from '@/components/KpiCard.vue'
  import { formatNumber } from '@/utils/formatters'

  defineProps({
    data: Object,
  })
</script>
