<template>
  <div class="p-8 bg-gray-100">
    <div class="max-w-7xl mx-auto min-h-screen">
      <!-- <pre>{{ data.kpis }}</pre> -->
      <h1 class="text-2xl font-bold text-blue-900 mb-6">Social Media Report - {{ data.kpis.month }}</h1>

      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12 xl:col-span-9">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Page Engagement</p>
              <h2 class="text-3xl font-bold text-blue-900">{{ formatNumber(data.kpis.page_engagement) }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Total followers</p>
              <h2 class="text-3xl font-bold text-blue-900">{{ formatNumber(data.kpis.followers) }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Clicks organic Link</p>
              <h2 class="text-3xl font-bold text-blue-900">{{ formatNumber(data.kpis.clics) }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Post shares</p>
              <h2 class="text-3xl font-bold text-blue-900">{{ data.kpis.shares }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Responding</p>
              <h2 class="text-3xl font-bold text-blue-900">{{ data.kpis.responding }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Post engagement rate</p>
              <h2 class="text-3xl font-bold text-blue-900">{{ data.kpis.post_engagement_rate }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Post impressions</p>
              <h2 class="text-3xl font-bold text-blue-900">{{ formatNumber(data.kpis.post_impressions) }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Response time</p>
              <h2 class="text-3xl font-bold text-blue-900">{{ data.kpis.response_time }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Page organic reach</p>
              <h2 class="text-3xl font-bold text-blue-900">{{ formatNumber(data.kpis.page_organic_reach) }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Views from non-followers</p>
              <h2 class="text-3xl font-bold text-blue-900">{{ formatNumber(data.kpis.page_no_followers_views) }}</h2>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeeYellow">
              <p class="text-gray-500 text-sm">Views from followers</p>
              <h2 class="text-3xl font-bold text-blue-900">{{ formatNumber(data.kpis.page_followers_views) }}</h2>
            </div>
          </div>
        </div>
        <div class="col-span-12 xl:col-span-3">
          <SentimentChart />
        </div>
      </div>
    </div>
  </div>
  <div class="p-10 bg-gray-50">
    <div class="max-w-7xl mx-auto min-h-screen">
      <h2 class="text-2xl font-black text-pluxeeBlue mb-2 uppercase">Post Metrics</h2>
      <p class="text-sm text-gray-600 mb-8 font-bold">Ordenados de mayor a menor alcance en Facebook</p>
      <!-- <pre>{{ data.topPosts }}</pre> -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <PostCard v-for="post in data.topPosts" :key="post.id" :post="post" />
      </div>
    </div>
  </div>
</template>

<script setup>
  import PostCard from '@/components/PostCard.vue'
  import SentimentChart from '@/components/SentimentChart.vue'
  import { formatNumber } from '@/utils/formatters'

  defineProps({
    data: Object,
  })
</script>
