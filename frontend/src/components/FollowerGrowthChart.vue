<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 h-full flex flex-col" :class="`border-[${color}]`">
    <h3 class="text-xl font-bold text-gray-800 mb-4">Follower Growth</h3>
    <!-- <pre>{{ chartData }}</pre> -->
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
    color: {
      type: String,
      default: '#1877F2', // Por defecto
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
          label: 'Seguidores',
          data: props.chartData.map(item => item.followers || 0),
          borderColor: props.color, //  Usamos el color de la prop
          backgroundColor: props.color + '26', // Color con transparencia (hex + 26)
          fill: true,
          tension: 0.4,
          pointBackgroundColor: props.color,
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
