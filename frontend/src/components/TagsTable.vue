<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-12 mb-12">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div v-if="tags && tags.length > 0" class="w-full h-96 relative">
          <Line :data="chartData" :options="chartOptions" />

          <div
            v-if="tooltipData.show"
            class="absolute pointer-events-none bg-black/90 p-3 rounded-lg shadow-xl text-white transform -translate-x-1/2 -translate-y-[110%] z-50 flex flex-col items-center border border-gray-700"
            :style="{ left: tooltipData.x + 'px', top: tooltipData.y + 'px' }">
            <img :src="tooltipData.img" @error="$event.target.src = 'https://placehold.co/150x150/374151/ffffff?text=Sin+Imagen'" class="w-20 h-20 object-cover rounded shadow-sm mb-2 bg-gray-800 border border-gray-600" />
            <span class="text-xs font-bold uppercase tracking-wider text-gray-300">{{ tooltipData.title }}</span>
            <span class="text-sm font-black">{{ tooltipData.body }}</span>
            <div class="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-black/90 rotate-45 border-b border-r border-gray-700"></div>
          </div>
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

            <img :src="getSafeImageUrl(post.img)" @error="$event.target.src = 'https://placehold.co/150x150/e5e7eb/9ca3af?text=No+Img'" class="w-16 h-16 object-cover rounded-md bg-gray-200 shadow-sm" />

            <div class="flex-1 text-xs overflow-hidden">
              <div class="flex justify-between items-center mb-1.5 gap-2">
                <p class="text-gray-400 font-bold whitespace-nowrap capitalize">{{ formatDate(post.date) }}</p>
                <span v-if="post.tags && post.tags !== 'Sin etiqueta'" :class="getDynamicTagClasses(post.tags)" :title="post.tags">
                  {{ post.tags.split(',')[0] }}
                </span>
              </div>

              <div class="grid grid-cols-2 gap-1 text-gray-700 font-medium">
                <span title="Vistas">👁️ {{ formatNumber(post.views || post.reach) }}</span>
                <span title="Interacciones">❤️ {{ formatNumber(post.interactions) }}</span>
                <span title="Guardados/Compartidos" class="col-span-2">↗️ {{ formatNumber(post.shares + post.saved) || post.saved }}</span>
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
  import { computed, ref } from 'vue'
  import { Line } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale } from 'chart.js'
  import { formatNumber, formatDate } from '@/utils/formatters'

  ChartJS.register(Title, Tooltip, Legend, PointElement, LineElement, CategoryScale, LinearScale)

  const props = defineProps({
    tags: { type: Array, default: () => [] },
    topPosts: { type: Array, default: () => [] },
  })

  const tooltipData = ref({ show: false, x: 0, y: 0, img: '', title: '', body: '', date: '' })

  const getSafeImageUrl = url => {
    // 🚀 Fallback más seguro que '/favicon.ico'
    if (!url) return 'https://placehold.co/150x150/1877F2/ffffff?text=Post'
    if (url.startsWith('http') || url.startsWith('data:')) return url
    const cleanUrl = url.replace(/\\/g, '/')
    const backendBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    return `${backendBaseUrl}${cleanUrl.startsWith('/') ? '' : '/'}${cleanUrl}`
  }

  const chartData = computed(() => {
    if (!props.tags || props.tags.length === 0) return { labels: [], datasets: [] }

    // 🚀 1. AHORA FILTRAMOS PLUXEE, TOLKO Y TREND
    const filteredTags = props.tags.filter(tag => {
      const lowerName = tag.name.toLowerCase()
      return lowerName.includes('tolko') || lowerName.includes('pluxee')
    })

    if (filteredTags.length === 0) return { labels: [], datasets: [] }

    const allDates = new Set()
    filteredTags.forEach(tag => {
      tag.posts.forEach(post => {
        if (post.date !== 'Desconocida') allDates.add(post.date)
      })
    })

    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b))

    const datasets = filteredTags.map(tag => {
      const dataPoints = []
      const imagesArray = []

      sortedDates.forEach(date => {
        const postsOnDate = tag.posts.filter(p => p.date === date)

        if (postsOnDate.length > 0) {
          const topPost = postsOnDate.reduce((max, p) => ((p.views || 0) > (max.views || 0) ? p : max), postsOnDate[0])
          dataPoints.push(topPost.views || 0)

          // Busca que coincida la fecha, el tag Y LAS VISTAS
          const postRealCompleto =
            props.topPosts.find(p => p.date && p.date.includes(date) && p.tags && p.tags.toLowerCase().includes(tag.name.toLowerCase()) && (p.views === topPost.views || p.reach === topPost.views)) ||
            props.topPosts.find(p => p.date && p.date.includes(date) && p.tags && p.tags.toLowerCase().includes(tag.name.toLowerCase()))

          imagesArray.push(getSafeImageUrl(postRealCompleto?.img))
        } else {
          dataPoints.push(null)
          imagesArray.push('')
        }
      })

      // 🚀 ASIGNACIÓN DE COLORES PARA LA GRÁFICA
      let lineColor = '#00eb5d' // Verde Pluxee por defecto
      if (tag.name.toLowerCase().includes('tolko')) lineColor = '#cc0032' // Rojo Tolko

      return {
        label: tag.name,
        data: dataPoints,
        customImages: imagesArray,
        borderColor: lineColor,
        backgroundColor: lineColor,
        tension: 0.3,
        spanGaps: true,
        pointRadius: 4,
        pointHoverRadius: 7,
        fill: false,
      }
    })

    return { labels: sortedDates.map(date => formatDate(date)), datasets: datasets }
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top', labels: { usePointStyle: true, padding: 20, font: { family: 'sans-serif', weight: 'bold' } } },
      tooltip: {
        enabled: false,
        external: context => {
          const { tooltip, chart } = context

          if (tooltip.opacity === 0) {
            tooltipData.value.show = false
            return
          }

          const dataPoint = tooltip.dataPoints[0]
          const dataset = chart.data.datasets[dataPoint.datasetIndex]

          tooltipData.value = {
            show: true,
            x: tooltip.caretX,
            y: tooltip.caretY,
            img: dataset.customImages[dataPoint.dataIndex],
            title: chart.data.labels[dataPoint.dataIndex], // Fecha
            body: `${dataset.label}: ${formatNumber(dataPoint.raw)} Vistas`, // Info
            date: '',
          }
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280' } },
      y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { color: '#6b7280' } },
    },
  }

  // 🚀 ACTUALIZAMOS LAS ETIQUETITAS DE COLORES PARA INCLUIR TREND
  const getDynamicTagClasses = tagsString => {
    if (!tagsString || tagsString === 'Sin etiqueta') return 'bg-gray-100 text-gray-500 border-gray-200'

    const lowerTags = tagsString.toLowerCase()
    const baseClasses = 'border px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider truncate transition-colors'

    if (lowerTags.includes('tolko')) return `${baseClasses} bg-tolkoRed/10 text-tolkoRed border-tolkoRed/20`
    if (lowerTags.includes('pluxee')) return `${baseClasses} bg-pluxeeGreen/10 text-pluxeeGreen border-pluxeeGreen/20`

    return `${baseClasses} bg-blue-50 text-pluxeeBlue border-blue-100`
  }
</script>
