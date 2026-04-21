<template>
  <div class="flex flex-col w-full max-w-60 shadow-lg rounded-lg overflow-hidden mx-auto">
    <div class="bg-pluxeeBlue p-4 flex justify-center items-center h-36">
      <img :src="post.img" class="object-cover h-full w-full" />
    </div>
    <!-- <pre>{{ post }}</pre> -->
    <div class="bg-pluxeeYellow p-4 text-pluxeeBlue font-sans">
      <div class="font-bold text-xs mb-1 uppercase tracking-widest text-center">
        {{ post.type }}
      </div>
      <div class="text-sm space-y-0.5">
        <p>
          <strong>Visualizaciones:</strong>
          {{ formatNumber(post.views) }}
        </p>
        <p>
          <strong>Alcance:</strong>
          {{ post.reach }}
        </p>
        <p>
          <strong>Interactions:</strong>
          {{ post.interactions }}
        </p>
        <p>
          <strong>Shared o saved:</strong>
          {{ post.saved }}
        </p>
        <p class="text-end">
          <a :href="post.postPermalink" target="_blank"><strong>Ver en línea</strong></a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { formatNumber } from '@/utils/formatters'
  defineProps({
    post: {
      type: Object,
      required: true,
    },
  })
</script>
