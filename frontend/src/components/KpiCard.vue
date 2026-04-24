<template>
  <div class="bg-white p-5 rounded-xl shadow-sm border-l-4" :class="borderColor">
    <p class="text-gray-500 text-sm">{{ title }}</p>
    <h2 class="text-3xl font-bold text-pluxeeBlue">{{ value }}</h2>
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
      default: 'border-pluxeeYellow', // Mantenemos el amarillo por defecto que ya usabas
    },
  })
</script>
