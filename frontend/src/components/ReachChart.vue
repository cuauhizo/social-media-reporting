<template>
  <div class="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto">
    <h3 class="text-pluxeeBlue font-bold mb-4 text-center">Post Reach</h3>
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { Doughnut } from 'vue-chartjs'
  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

  ChartJS.register(ArcElement, Tooltip, Legend)

  const props = defineProps({
    reachData: {
      type: Object,
      default: () => ({ carousel: 0, photo: 0, reel: 0, story: 0 }),
    },
  })

  // Mapeamos los datos con sus colores representativos
  const chartItems = computed(() =>
    [
      { label: 'Reels', value: props.reachData.reel, color: '#e1306c' }, // Magenta IG
      { label: 'Carousel', value: props.reachData.carousel, color: '#fcb045' }, // Naranja
      { label: 'Stories', value: props.reachData.story, color: '#f56040' }, // Rojo anaranjado
      { label: 'Photos', value: props.reachData.photo, color: '#833ab4' }, // Morado
    ].sort((a, b) => b.value - a.value),
  ) // Los ordenamos de mayor a menor alcance

  const chartData = computed(() => ({
    labels: chartItems.value.map(i => i.label),
    datasets: [
      {
        backgroundColor: chartItems.value.map(i => i.color),
        data: chartItems.value.map(i => i.value),
      },
    ],
  }))

  const chartOptions = { responsive: true }
</script>
