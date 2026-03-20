<template>
  <div class="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto">
    <h3 class="text-pluxeeBlue font-bold mb-4 text-center">Sentiment Analysis</h3>
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { Doughnut } from 'vue-chartjs'
  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

  ChartJS.register(ArcElement, Tooltip, Legend)

  // 1. Recibimos los datos desde el componente padre (FacebookSection)
  const props = defineProps({
    sentimentData: {
      type: Object,
      required: true,
    },
  })

  // 2. Usamos "computed" para que la gráfica reaccione si los datos cambian
  const chartData = computed(() => {
    return {
      labels: ['Neutral', 'Positive', 'Negative'],
      datasets: [
        {
          backgroundColor: ['#ff9300', '#9bbb59', '#ff2600'],
          // parseFloat le quita el "%" y lo convierte en número decimal para Chart.js
          data: [parseFloat(props.sentimentData.neutral) || 0, parseFloat(props.sentimentData.positive) || 0, parseFloat(props.sentimentData.negative) || 0],
        },
      ],
    }
  })

  const chartOptions = { responsive: true }
</script>
