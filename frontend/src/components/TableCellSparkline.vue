<template>
  <div class="flex flex-col items-center justify-center h-10 w-16 lg:justify-end md:flex-row lg:gap-3">
    <div class="flex shrink-0 h-full w-full relative">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <div :class="isNegative ? 'text-red-500' : 'text-green-500'">
      <div v-if="isNegative" class="flex items-center gap-1 shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        <span class="text-sm">-{{ formatNumber(Math.abs(numericValue)) }}%</span>
      </div>
      <div v-else class="flex items-center gap-1 shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        <span class="text-sm">{{ formatNumber(Math.abs(numericValue)) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { Line } from 'vue-chartjs'
  import { Chart as ChartJS, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js'
  import { formatNumber } from '@/utils/formatters'

  ChartJS.register(PointElement, LineElement, CategoryScale, LinearScale)

  const props = defineProps({
    value: [String, Number],
    dailyData: Array,
    color: { type: String, default: '#002d72' },
  })

  // 1. Convertimos el valor a número para poder hacer matemáticas con él
  const numericValue = computed(() => {
    return typeof props.value === 'string' ? parseFloat(props.value) : props.value || 0
  })

  // 2. Evaluamos si el número es negativo (< 0)
  const isNegative = computed(() => numericValue.value < 0)

  // 3. Si el número es negativo, pintamos la gráfica roja. Si es positivo, usamos el color corporativo.
  const dynamicGraphColor = computed(() => {
    // if (isNegative.value) return '#ef4444' // Rojo Tailwind (red-500)
    return props.color // El color corporativo que le pasamos desde la tabla
  })

  const chartData = computed(() => {
    if (!props.dailyData || props.dailyData.length === 0) return { labels: [], datasets: [] }

    const labels = props.dailyData.map((_, i) => i + 1)

    return {
      labels: labels,
      datasets: [
        {
          data: props.dailyData,
          borderColor: dynamicGraphColor.value, // Aplicamos el color dinámico a la línea
          borderWidth: 1.5,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
        },
      ],
    }
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  }
</script>
