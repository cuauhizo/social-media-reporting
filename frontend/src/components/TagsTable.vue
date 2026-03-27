<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-12 mb-12">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div v-if="tags && tags.length > 0" class="w-full h-87.5 relative">
          <Line :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="text-center bg-gray-50 rounded-xl p-8 text-gray-500 font-medium border border-gray-100">
          <p>No se encontraron etiquetas (Tags) registradas.</p>
        </div>
      </div>

      <div class="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col">
        <h4 class="font-black text-gray-700 uppercase text-sm mb-4 border-b border-gray-200 pb-2">Top del Periodo</h4>

        <div v-if="topPosts && topPosts.length > 0" class="space-y-4">
          <div v-for="(post, index) in topPosts.slice(0, 3)" :key="post.id" class="flex flex-col sm:flex-row gap-4 items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <span class="font-black text-xl text-gray-300 w-4">{{ index + 1 }}</span>

            <img :src="post.img" class="w-16 h-16 object-cover rounded-md bg-gray-200 shadow-sm" />

            <div class="flex-1 text-xs overflow-hidden">
              <div class="flex justify-between items-center mb-1.5 gap-2">
                <p class="text-gray-400 font-bold whitespace-nowrap capitalize">{{ formatDate(post.date) }}</p>

                <span v-if="post.tags && post.tags !== 'Sin etiqueta'" :class="getDynamicTagClasses(post.tags)" :title="post.tags">
                  {{ post.tags.split(',')[0] }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-1 text-gray-700 font-medium">
                <span title="Alcance/Vistas">👁️ {{ formatNumber(post.reach || post.views) }}</span>
                <span title="Interacciones">❤️ {{ formatNumber(post.interactions) }}</span>
                <span title="Guardados/Compartidos" class="col-span-2">↗️ {{ formatNumber(post.saved || post.shares) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-gray-400 text-sm mt-10">No hay posts suficientes.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { Line } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js'
  import { formatNumber, formatDate } from '@/utils/formatters'

  ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale)

  const props = defineProps({
    tags: { type: Array, default: () => [] },
    topPosts: { type: Array, default: () => [] },
  })

  const chartData = computed(() => {
    if (!props.tags || props.tags.length === 0) return { labels: [], datasets: [] }

    const allDates = new Set()
    props.tags.forEach(tag => {
      tag.posts.forEach(post => {
        if (post.date !== 'Desconocida') allDates.add(post.date)
      })
    })

    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b))
    const colors = ['#cc0032', '#00eb5d', '#ff7375', '#ffdc37', '#17ccf9', '#221c46']

    const datasets = props.tags.map((tag, index) => {
      const dataPoints = sortedDates.map(date => {
        const postsOnDate = tag.posts.filter(p => p.date === date)
        return postsOnDate.length > 0 ? postsOnDate.reduce((sum, p) => sum + p.reach, 0) : null
      })

      return {
        label: tag.name,
        data: dataPoints,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length],
        tension: 0.3,
        spanGaps: true,
        pointRadius: 5,
        pointHoverRadius: 8,
        fill: false,
      }
    })

    // return { labels: sortedDates, datasets: datasets }
    return { labels: sortedDates.map(date => formatDate(date)), datasets: datasets }
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 20, font: { family: 'sans-serif', weight: 'bold' } } },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: { label: context => ` ${context.dataset.label}: ${context.raw ? formatNumber(context.raw) : 0}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280' } },
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { color: '#6b7280' } },
    },
  }

  // ✨ NUEVA FUNCIÓN: Calcula las clases de Tailwind según el texto de la etiqueta ✨
  const getDynamicTagClasses = tagsString => {
    // Respaldo por si no hay etiquetas
    if (!tagsString || tagsString === 'Sin etiqueta') {
      return 'bg-gray-100 text-gray-500 border-gray-200'
    }

    // Convertimos a minúsculas para una comparación segura
    const lowerTags = tagsString.toLowerCase()

    // Base de clases comunes (borde, padding, redondeado, fuente, etc.)
    const baseClasses = 'border px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider truncate transition-colors'

    // 1. Lógica para TOLKO (#cc0032)
    // Usamos arbitrary values de Tailwind y opacidad 10% [/10] para fondo suave
    if (lowerTags.includes('tolko')) {
      return `${baseClasses} bg-tolkoRed/10 text-tolkoRed border-tolkoRed/20`
    }

    // 2. Lógica para PLUXEE (#00eb5d)
    if (lowerTags.includes('pluxee')) {
      return `${baseClasses} bg-pluxeeGreen/10 text-pluxeeGreen border-pluxeeGreen/20`
    }

    // 3. Respaldo Genérico (el color azul original que propusiste)
    return `${baseClasses} bg-blue-50 text-pluxeeBlue border-blue-100`
  }
</script>
