<template>
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
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Page Engagement</p>
              <h2 class="text-3xl font-bold text-pluxeeBlue">{{ formatNumber(data.kpis.interactions) }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Total followers</p>
              <h2 class="text-3xl font-bold text-pluxeeBlue">{{ formatNumber(data.kpis.followers) }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Clicks organic Link</p>
              <h2 class="text-3xl font-bold text-pluxeeBlue">{{ formatNumber(data.kpis.clics) }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Post shares</p>
              <h2 class="text-3xl font-bold text-pluxeeBlue">{{ data.kpis.shares }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Responding</p>
              <h2 class="text-3xl font-bold text-pluxeeBlue">{{ data.kpis.responding }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Post engagement rate</p>
              <h2 class="text-3xl font-bold text-pluxeeBlue">{{ data.kpis.post_engagement_rate }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Post impressions</p>
              <h2 class="text-3xl font-bold text-pluxeeBlue">{{ formatNumber(data.kpis.post_impressions) }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Response time</p>
              <h2 class="text-3xl font-bold text-pluxeeBlue">{{ data.kpis.response_time }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Page organic reach</p>
              <h2 class="text-3xl font-bold text-pluxeeBlue">{{ formatNumber(data.kpis.page_organic_reach) }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Views from non-followers</p>
              <h2 class="text-3xl font-bold text-pluxeeBlue">{{ formatNumber(data.kpis.page_no_followers_views) }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Views from followers</p>
              <h2 class="text-3xl font-bold text-pluxeeBlue">{{ formatNumber(data.kpis.page_followers_views) }}</h2>
            </div>
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
                  <!-- <tr v-for="(city, index) in data.topCities.slice(0, 5)" :key="index" class="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"> -->
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
  <div class="p-10 bg-gray-50">
    <div class="max-w-7xl mx-auto min-h-screen">
      <h2 class="text-2xl font-black text-pluxeeBlue mb-2 uppercase">Post Metrics</h2>
      <p class="text-sm text-gray-600 mb-8 font-bold">Ordenados de mayor a menor alcance en Facebook</p>
      <!-- <pre>{{ data.topPosts }}</pre> -->
      <div v-if="data.topPosts && data.topPosts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <PostCard v-for="post in data.topPosts" :key="post.id" :post="post" />
      </div>

      <div v-else class="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 mt-6">
        <p class="text-gray-500 font-medium">No se encontraron publicaciones en Facebook para este periodo.</p>
      </div>
    </div>
  </div>
  <div class="p-10 bg-gray-100">
    <div class="max-w-7xl mx-auto min-h-screen">
      <h2 class="text-2xl font-black text-pluxeeBlue mb-2 uppercase">Post metrics Tolko - Pluxee</h2>
      <TagsTable :tags="data.reachByTags" :topPosts="data.topPosts" />
    </div>
  </div>
</template>

<script setup>
  import PostCard from '@/components/PostCard.vue'
  import SentimentChart from '@/components/SentimentChart.vue'
  import TagsTable from './TagsTable.vue'
  import { formatNumber } from '@/utils/formatters'

  defineProps({
    data: Object,
  })
</script>
