<template>
  <div class="bg-white">
    <div class="w-full h-32 bg-linear-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-inner">
      <h2 class="text-4xl font-black text-white tracking-widest uppercase">Instagram Metrics {{ data.username }}</h2>
    </div>
    <pre>{{ data }}</pre>
    <div class="py-12 px-8 max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div class="bg-gray-50 p-6 rounded-xl border-l-4 border-[#e1306c] shadow-sm">
          <p class="text-gray-500 text-sm font-bold">Followers</p>
          <h2 class="text-3xl font-black text-pluxeeBlue">{{ formatNumber(data.kpis.followers) }}</h2>
        </div>
        <div class="bg-gray-50 p-6 rounded-xl border-l-4 border-[#e1306c] shadow-sm">
          <p class="text-gray-500 text-sm font-bold">Page Engagement</p>
          <h2 class="text-3xl font-black text-pluxeeBlue">{{ data.kpis.page_engagement_rate }}</h2>
        </div>
        <div class="bg-gray-50 p-6 rounded-xl border-l-4 border-[#f56040] shadow-sm md:col-span-2 flex justify-between items-center">
          <div>
            <p class="text-gray-500 text-sm font-bold">Total Stories</p>
            <h2 class="text-3xl font-black text-pluxeeBlue">{{ formatNumber(data.kpis.stories_metrics.total) }}</h2>
            <!-- <h2 class="text-3xl font-black text-pluxeeBlue">{{ formatNumber(data.kpis.posts_total) }}</h2> -->
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

      <h3 class="text-2xl font-black text-pluxeeBlue mb-6 uppercase border-b-2 border-gray-100 pb-2">Top Stories</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        <div v-for="story in data.topInstagramPosts" :key="story.id" class="flex flex-col shadow-md rounded-lg overflow-hidden">
          <div class="bg-gray-900 h-64 flex justify-center items-center">
            <img :src="story.img" class="object-cover h-full w-full opacity-90 hover:opacity-100 transition-opacity" />
          </div>
          <div class="bg-pluxeeYellow p-3 text-pluxeeBlue text-sm">
            <p class="font-black text-xs mb-1">{{ story.type }}</p>
            <p>
              <strong>Vis:</strong>
              {{ story.reach }}
            </p>
            <p>
              <strong>Int:</strong>
              {{ story.interactions }}
            </p>
            <p>
              <strong>Share:</strong>
              {{ story.shares }}
            </p>
          </div>
        </div>
      </div>

      <h3 class="text-2xl font-black text-pluxeeBlue mb-6 uppercase border-b-2 border-gray-100 pb-2">Top Posts (Instagram)</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="post in data.topPosts" :key="post.id" class="flex flex-col shadow-md rounded-lg overflow-hidden">
          <div class="bg-pluxeeBlue h-48 flex justify-center items-center p-2">
            <img :src="post.img" class="object-contain h-full w-full" />
          </div>
          <div class="bg-pluxeeYellow p-3 text-pluxeeBlue text-sm">
            <p class="font-black text-xs mb-1">{{ post.type }}</p>
            <p>
              <strong>Vis:</strong>
              {{ post.views }}
            </p>
            <p>
              <strong>Int:</strong>
              {{ post.interactions }}
            </p>
            <p>
              <strong>Saved:</strong>
              {{ post.saved }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { formatNumber } from '@/utils/formatters'
  defineProps({
    data: Object,
  })
</script>
