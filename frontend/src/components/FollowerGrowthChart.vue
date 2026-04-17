<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#1877F2]">
    <h3 class="text-xl font-bold text-gray-800 mb-4">Follower Growth</h3>

    <div class="relative w-full h-80">
      <Line v-if="chartDataObj" :data="chartDataObj" :options="chartOptions" />
      <div v-else class="flex h-full items-center justify-center text-gray-400 animate-pulse">Cargando gráfica...</div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { Line } from 'vue-chartjs'
  import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Filler, // ✨ PLUGIN CLAVE para el área sombreada debajo de la línea
    Legend,
  } from 'chart.js'

  // Registramos todos los elementos necesarios, especialmente Filler
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend)

  const props = defineProps({
    chartData: {
      type: Array,
      required: true,
    },
  })

  // Transformamos tus datos históricos al formato que pide Chart.js
  const chartDataObj = computed(() => {
    if (!props.chartData || props.chartData.length === 0) return null

    return {
      labels: props.chartData.map(item => item.date),
      datasets: [
        {
          label: 'Total Followers',
          data: props.chartData.map(item => item.followers),
          borderColor: '#1877F2', // Azul Facebook
          backgroundColor: 'rgba(24, 119, 242, 0.15)', // El mismo azul pero transparente para el fondo
          fill: true, // ✨ Esto pinta el área debajo de la curva
          tension: 0.4, // ✨ Esto redondea los picos de la línea para que no parezcan montañas rectas
          pointBackgroundColor: '#1877F2',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 3, // Puntos pequeños
          pointHoverRadius: 6,
        },
      ],
    }
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Permite que la gráfica se estire en el h-80
    plugins: {
      legend: {
        display: false, // Ocultamos la leyenda porque el título ya dice qué es
      },
      datalabels: {
        display: false, // 🚨 IMPORTANTE: Apaga los datalabels para que no se amontonen los números en la línea
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Quitamos la cuadrícula vertical para que se vea más limpia
        },
        ticks: {
          maxTicksLimit: 10, // Si hay 30 días, evita que se encimen los textos de abajo
          color: '#9ca3af',
        },
      },
      y: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#9ca3af',
        },
      },
    },
  }
</script>
