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
          backgroundColor: ['#ffdc37', '#00eb5d', '#ff7375'],
          // parseFloat le quita el "%" y lo convierte en número decimal para Chart.js
          data: [parseFloat(props.sentimentData.neutral) || 0, parseFloat(props.sentimentData.positive) || 0, parseFloat(props.sentimentData.negative) || 0],
        },
      ],
    }
  })

  const chartOptions = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          // context.raw es el número puro (ej. 14.95), aquí le pegamos el '%'
          label: context => {
            return ` ${context.raw}%`
          },
        },
      },
    },
  }
</script>
