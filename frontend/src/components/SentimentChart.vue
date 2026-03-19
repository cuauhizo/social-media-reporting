<template>
  <div class="bg-white p-6 rounded-xl shadow-md w-full max-w-md mx-auto">
    <h3 class="text-pluxeeBlue font-bold mb-4">Sentiment Analysis</h3>
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
  import { Doughnut } from 'vue-chartjs'
  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

  ChartJS.register(ArcElement, Tooltip, Legend)

  const chartData = {
    labels: ['Neutral', 'Positive', 'Negative'],
    datasets: [
      {
        backgroundColor: ['#ff9300', '#9bbb59', '#ff2600'],
        data: [61.92, 15.95, 23.13], // Datos del reporte PDF [cite: 43, 45, 46]
      },
    ],
  }

  const chartOptions = { responsive: true }
</script>
