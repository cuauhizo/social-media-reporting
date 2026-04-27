<template>
  <div class="bg-white p-6 rounded-xl shadow-sm border-l-4 border-pluxeePink h-full flex flex-col">
    <h3 class="text-pluxeeBlue font-bold mb-4 text-center">Post Reach</h3>
    <div class="relative w-full flex-1 min-h-[220px]">
      <Doughnut :data="chartData" :options="chartOptions" :plugins="[ChartDataLabels]" />
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { Doughnut } from 'vue-chartjs'
  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
  import ChartDataLabels from 'chartjs-plugin-datalabels'
  import { formatNumber } from '@/utils/formatters'

  ChartJS.register(ArcElement, Tooltip, Legend)

  const props = defineProps({
    reachData: {
      type: Object,
      default: () => ({ carousel: 0, photo: 0, reel: 0, story: 0 }),
    },
  })

  // Mapeamos los datos con sus colores representativos
  const chartItems = computed(() =>
    [
      { label: 'Reels', value: props.reachData.reel, color: '#17ccf9' },
      { label: 'Carousel', value: props.reachData.carousel, color: '#ffdc37' },
      { label: 'Stories', value: props.reachData.story, color: '#ff7375' },
      { label: 'Photos', value: props.reachData.photo, color: '#00eb5d' },
    ].sort((a, b) => b.value - a.value),
  ) // Los ordenamos de mayor a menor alcance

  const chartData = computed(() => ({
    labels: chartItems.value.map(i => i.label),
    datasets: [
      {
        backgroundColor: chartItems.value.map(i => i.color),
        data: chartItems.value.map(i => i.value),
      },
    ],
  }))

  const chartOptions = {
    responsive: true,
    plugins: {
      datalabels: {
        color: '#ffffff', // Color del texto (blanco para que resalte sobre la dona)
        // Si el porcentaje es 0, no dibujamos el número para que no se vea amontonado
        display: function (context) {
          return context.dataset.data[context.dataIndex] > 0
        },
        // Formateamos el texto para que incluya el símbolo de %
        formatter: value => {
          return formatNumber(value)
        },
      },
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: 'circle', // Convierte el indicador en un círculo
        },
      },
    },
  }
</script>
