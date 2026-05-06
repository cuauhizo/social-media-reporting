<template>
  <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-pluxeeBlueLight h-full flex flex-col">
    <h3 class="text-pluxeeBlue font-bold mb-4 text-center">Sentiment Analysis</h3>
    <div class="relative w-full flex max-h-[400px] items-center justify-center">
      <Doughnut :data="chartData" :options="chartOptions" :plugins="[ChartDataLabels]" />
    </div>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { Doughnut } from 'vue-chartjs'
  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
  import ChartDataLabels from 'chartjs-plugin-datalabels'

  ChartJS.register(ArcElement, Tooltip, Legend)

  // 1. Recibimos los datos desde el componente padre (FacebookSection)
  const props = defineProps({
    sentimentData: {
      type: Object,
      required: true,
    },
  })

  // 2. Usamos "computed" para que la gráfica reaccione si los datos cambian
  const chartData = computed(() => {
    return {
      labels: ['Neutral', 'Positive', 'Negative'],
      datasets: [
        {
          backgroundColor: ['#ffdc37', '#00eb5d', '#ff7375'],
          // parseFloat le quita el "%" y lo convierte en número decimal para Chart.js
          data: [parseFloat(props.sentimentData.neutral) || 0, parseFloat(props.sentimentData.positive) || 0, parseFloat(props.sentimentData.negative) || 0],
        },
      ],
    }
  })

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
          return value + '%'
        },
      },
      legend: {
        labels: {
          usePointStyle: true,
          pointStyle: 'circle', // Convierte el indicador en un círculo
        },
      },
      tooltip: {
        callbacks: {
          // context.raw es el número puro (ej. 14.95), aquí le pegamos el '%'
          label: context => {
            return ` ${context.raw}%`
          },
        },
      },
    },
  }
</script>
