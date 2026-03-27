<template>
  <div class="relative bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden group hover:border-pluxeeBlue/20 transition-all hover:shadow-lg">
    <div class="relative z-10 flex flex-col justify-between h-full">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider">{{ title }}</h3>

        <span class="flex items-center gap-1 text-xs font-bold" :class="increase ? 'text-green-500' : 'text-red-500'">
          {{ increase ? '↑' : '↓' }} {{ percentage }}
          <span class="text-gray-300 font-medium">VS MES ANTERIOR</span>
        </span>
      </div>

      <h2 class="text-5xl font-black tracking-tighter mb-1" :class="valueColor">
        {{ value }}
      </h2>

      <p class="text-sm font-medium text-gray-500">{{ subtitle }}</p>
    </div>

    <div class="absolute inset-x-0 bottom-0 h-2/3 z-0 opacity-40 group-hover:opacity-70 transition-opacity">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { Line } from 'vue-chartjs'
  // Importamos 'Filler' para poder rellenar el color debajo de la línea
  import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale, Filler } from 'chart.js'

  // Registramos módulos de Chart.js
  ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale, Filler)

  const props = defineProps({
    title: String,
    value: [String, Number],
    subtitle: String,
    percentage: String,
    increase: Boolean, // true = verde/flecha arriba, false = rojo/abajo
    dailyData: Array, // El historial diario [1, 5, 8...]
    valueColor: { type: String, default: 'text-pluxeeBlue' }, // Color del número grande
    graphColor: { type: String, default: '#002d72' }, // Color de la línea de la gráfica
  })

  // Armamos los datos para Chart.js
  const chartData = computed(() => {
    if (!props.dailyData || props.dailyData.length === 0) return { labels: [], datasets: [] }

    // Creamos labels ficticios [1, 2, 3... 31]
    const labels = props.dailyData.map((_, i) => i + 1)

    return {
      labels: labels,
      datasets: [
        {
          data: props.dailyData,
          borderColor: props.graphColor, // Color de la línea
          backgroundColor: `${props.graphColor}15`, // Relleno transparente (hexadecimal + opacidad 15)
          fill: true, // Habilitamos el relleno
          tension: 0.5, // Curvatura máxima para que se vea suave (wave)
          pointRadius: 0, // Ocultamos los puntos para look de sparkline
          borderWidth: 2, // Grosor de la línea sutil
        },
      ],
    }
  })

  // Configuración para ocultar ejes y grid (look de 'fondo')
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Sin leyenda
      tooltip: { enabled: false }, // Sin tooltips interactivos
    },
    scales: {
      // Ocultamos el Eje X por completo
      x: { display: false },
      // Ocultamos el Eje Y por completo
      y: { display: false, beginAtZero: false }, // No forzamos cero para que la tendencia se note más
    },
  }
</script>
