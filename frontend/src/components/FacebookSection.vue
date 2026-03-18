<template>
  <div class="p-8 bg-gray-100">
    <div class="max-w-7xl mx-auto min-h-screen">
      <!-- <pre>{{ data }}</pre> -->
      <h1 class="text-2xl font-bold text-blue-900 mb-6">Social Media Report - {{ data.kpis.month }}</h1>
      <h2>{{ data.username }} Metrics</h2>
      <img :src="data.avatar" :alt="data.username" />

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-400">
          <p class="text-gray-500 text-sm">Total Followers</p>
          <h2 class="text-3xl font-bold text-blue-900">{{ data.kpis.followers }}</h2>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-600">
          <p class="text-gray-500 text-sm">Engagement Rate</p>
          <h2 class="text-3xl font-bold text-blue-900">{{ data.kpis.engagement }}</h2>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p class="text-gray-500 text-sm">Organic Reach</p>
          <h2 class="text-3xl font-bold text-blue-900">{{ data.kpis.reach }}</h2>
        </div>
      </div>
    </div>
  </div>
  <div class="p-10 bg-gray-50">
    <div class="max-w-7xl mx-auto min-h-screen">
      <h2 class="text-2xl font-black text-pluxeeBlue mb-2 uppercase">Post Metrics</h2>
      <p class="text-sm text-gray-600 mb-8 font-bold">Ordenados de mayor a menor alcance en Facebook</p>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <PostCard v-for="post in data.topPosts" :key="post.id" :post="post" />
        <SentimentChart />
      </div>
    </div>
  </div>
</template>

<script setup>
  import PostCard from '@/components/PostCard.vue'
  import SentimentChart from '@/components/SentimentChart.vue'

  defineProps({
    data: Object,
  })
</script>
