<template>
  <section class="pdf-page">
    <div class="w-full h-32 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center shadow-inner px-4">
      <h2 class="text-4xl text-center font-black text-white tracking-widest uppercase">Instagram Metrics {{ data.username }}</h2>
    </div>
    <div class="p-8 bg-white">
      <div class="max-w-7xl mx-auto min-h-screen">
        <!-- <pre>{{ data }}</pre> -->
        <div class="grid grid-cols-12 gap-4">
          <div class="col-span-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
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
          </div>
          <div class="col-span-12 lg:col-span-6">
            <div class="grid grid-cols-1 gap-6 mb-8">
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
          <div class="col-span-12 md:col-span-6 lg:col-span-3">
            <div class="grid grid-cols-1 md:col-3 gap-4">
              <ReachChart :reachData="data.kpis.reach_by_type" />
            </div>
          </div>
          <div class="col-span-12 md:col-span-6 lg:col-span-3">
            <div class="grid grid-cols-1 md:col-3 gap-4">
              <SentimentChart :sentimentData="data.kpis.sentiment" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="pdf-page">
    <div class="max-w-7xl mx-auto min-h-screen px-4">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12">
          <!-- <pre>{{ data.topPosts }}</pre> -->
          <h3 class="text-2xl font-black text-pluxeeBlue mb-6 uppercase border-b-2 border-gray-100 py-10">Top Posts (Instagram)</h3>
          <div v-if="data.topPosts && data.topPosts.length > 0" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <div v-for="post in data.topPosts" :key="post.id" class="flex flex-col shadow-md rounded-lg overflow-hidden no-break">
              <div class="bg-pluxeeBlue h-48 flex justify-center items-center p-2">
                <img :src="post.img" class="object-cover h-full w-full" />
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
          <div v-else class="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 mt-6 mb-8">
            <p class="text-gray-500 font-medium">No se encontraron publicaciones en el feed de Instagram para este periodo.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="pdf-page top-story">
    <div class="max-w-7xl mx-auto min-h-screen px-4">
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-12">
          <!-- <pre>{{ data.topStories }}</pre> -->
          <h3 class="text-2xl font-black text-pluxeeBlue mb-6 uppercase border-b-2 border-gray-100 py-10">Top Stories</h3>

          <div v-if="data.topStories && data.topStories.length > 0" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            <div v-for="story in data.topStories" :key="story.id" class="flex flex-col shadow-sm border border-orange-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white">
              <div class="bg-gray-100 h-80 flex justify-center items-center relative overflow-hidden p-1">
                <div class="w-full h-full rounded-xl p-1 bg-linear-to-tr from-yellow-400 via-red-500 to-fuchsia-600">
                  <img :src="story.img" class="object-cover h-full w-full rounded-lg border-2 border-white" />
                </div>
                <span class="absolute top-4 right-4 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-md backdrop-blur-sm">
                  {{ story.type }}
                </span>
              </div>

              <div class="p-5 flex flex-col gap-2 bg-orange-50/30">
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

          <div v-else class="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100 mb-8">
            <p class="text-gray-500 font-medium">No se publicaron historias en Instagram durante este periodo.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="pdf-page">
    <div class="bg-gray-100">
      <div class="max-w-7xl mx-auto min-h-screen px-4">
        <h2 class="text-2xl font-black text-pluxeeBlue mb-2 uppercase">Post metrics Tolko - Pluxee</h2>
        <TagsTable :tags="data.reachByTags" :topPosts="data.topPosts" />
      </div>
    </div>
  </section>
</template>

<script setup>
  import { formatNumber } from '@/utils/formatters'
  import SentimentChart from './SentimentChart.vue'
  import TagsTable from './TagsTable.vue'
  import ReachChart from './ReachChart.vue'
  defineProps({
    data: Object,
  })
</script>
