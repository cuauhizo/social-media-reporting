<template>
  <div class="flex items-center gap-3 w-48 h-10 overflow-hidden">
    <span class="font-black text-sm text-gray-900 shrink-0">{{ formatNumber(value) }}</span>
    <div class="flex-1 h-full opacity-60">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { Line } from 'vue-chartjs'
  import { Chart as ChartJS, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js'
  // IMPORTANTE: Asegúrate de que la ruta a tu helper formatNumber sea correcta
  import { formatNumber } from '@/utils/formatters'

  // Registramos solo los módulos mínimos para una línea
  ChartJS.register(PointElement, LineElement, CategoryScale, LinearScale)

  const props = defineProps({
    value: [String, Number], // El total de seguidores (ej. 125)
    dailyData: Array, // El historial diario (ej. [2, 5, 8...])
    color: { type: String, default: '#002d72' }, // Color de la línea (azul Pluxee)
  })

  const chartData = computed(() => {
    if (!props.dailyData || props.dailyData.length === 0) return { labels: [], datasets: [] }

    // Creamos labels ficticios [1, 2, 3... 31]
    const labels = props.dailyData.map((_, i) => i + 1)

    return {
      labels: labels,
      datasets: [
        {
          data: props.dailyData,
          borderColor: props.color,
          borderWidth: 1.5, // Grosor sutil
          tension: 0.4, // Curvas suaves
          pointRadius: 0, // Sin puntos para look de sparkline
          pointHoverRadius: 0, // Sin puntos al pasar el mouse
          fill: false, // Sin relleno
        },
      ],
    }
  })

  // Configuración para OCULTAR TODO EL GRID Y EJES (Look de sparkline)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Sin leyenda
      tooltip: { enabled: false }, // Sin tooltips interactivos
    },
    scales: {
      x: { display: false }, // Ocultamos el Eje X por completo
      y: { display: false }, // Ocultamos el Eje Y por completo
    },
  }
</script>
