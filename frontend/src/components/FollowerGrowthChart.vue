<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#1877F2] h-full flex flex-col">
    <h3 class="text-xl font-bold text-gray-800 mb-4">Follower Growth</h3>

    <div class="relative w-full flex-1 min-h-[320px]">
      <Line v-if="chartDataObj" :data="chartDataObj" :options="chartOptions" />
      <div v-else class="flex h-full items-center justify-center text-gray-400 font-medium">No hay datos históricos para graficar en este periodo.</div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { Line } from 'vue-chartjs'
  import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend } from 'chart.js'
  import { formatDate } from '@/utils/formatters'

  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend)

  const props = defineProps({
    chartData: {
      type: [Array, Object, null],
      default: () => [],
    },
  })

  const chartDataObj = computed(() => {
    if (!props.chartData || !Array.isArray(props.chartData) || props.chartData.length === 0) {
      return null
    }

    return {
      labels: props.chartData.map(item => formatDate(item.date) || ''),
      datasets: [
        {
          label: 'Total Followers',
          data: props.chartData.map(item => item.followers || 0),
          borderColor: '#1877F2',
          backgroundColor: 'rgba(24, 119, 242, 0.15)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1877F2',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    }
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      datalabels: { display: false },
      tooltip: { mode: 'index', intersect: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { maxTicksLimit: 10, color: '#9ca3af' } },
      y: { grid: { color: '#f3f4f6' }, ticks: { color: '#9ca3af' } },
    },
  }
</script>
