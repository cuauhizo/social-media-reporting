<template>
  <div class="bg-white p-5 rounded-xl shadow-sm border-l-4" :class="borderColor">
    <p class="text-gray-500 text-sm">{{ title }}</p>
    <div class="flex items-baseline gap-3 mt-1 justify-center">
      <h2 class="text-3xl font-black text-pluxeeBlue leading-none">{{ value }}</h2>
      <div class="flex items-baseline gap-3 mt-1 justify-center">
        <span v-if="diff" class="rounded-full py-0.5 px-2 text-sm font-medium text-green-600" :class="diff.increase ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'">{{ diff.increase ? '↑' : '↓' }} {{ diff.pct }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
  defineProps({
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [String, Number],
      required: true,
    },
    borderColor: {
      type: String,
      default: 'border-pluxeeYellow',
    },
    diff: { type: Object, default: null },
  })
</script>
