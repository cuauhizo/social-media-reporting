<template>
  <div class="py-12 px-8 bg-gray-50">
    <div class="max-w-7xl mx-auto min-h-screen">
      <h2 class="text-3xl font-black text-pluxeeBlue mb-8 uppercase">Customer Service & Complains</h2>
      <!-- <pre>{{ data }}</pre> -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-pluxeeBlue">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Tipos de Casos (CAS)</h3>
          <div class="flex items-center justify-center mb-6 h-96">
            <Pie :data="chartData2" :options="chartOptions" :plugins="[ChartDataLabels]" />
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-pluxeeBlue">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Origen de Mensajes</h3>
          <div class="flex items-center justify-center mb-6 h-80">
            <Pie :data="chartData" :options="chartOptions" :plugins="[ChartDataLabels]" />
          </div>
          <div class="bg-blue-50 p-4 rounded-lg text-pluxeeBlue font-medium space-y-2">
            <p>
              📩 Se recibieron
              <strong>{{ data.messages.total }} mensajes</strong>
              (Facebook y Instagram)
            </p>
            <p>
              ⚠️
              <strong>{{ data.messages.escalated }} casos</strong>
              pasaron a escalamiento.
            </p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-400">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Frequent Complains</h3>
          <p class="text-sm text-gray-500 mb-4">Temas recurrentes escalados durante el mes</p>

          <ul class="space-y-3">
            <li v-for="item in listaQuejas" :key="item.id" class="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div class="w-8 h-8 rounded-full bg-pluxeeBlue text-white flex justify-center items-center font-bold mr-4">
                {{ item.id }}
              </div>
              <span class="text-gray-700 font-medium text-lg w-full">{{ item.queja }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { Pie } from 'vue-chartjs'
  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
  import ChartDataLabels from 'chartjs-plugin-datalabels'

  const props = defineProps({
    data: Object,
  })
  const listaQuejas = ref([])

  ChartJS.register(ArcElement, Tooltip, Legend)

  const chartData = ref({})
  const chartData2 = ref({})
  const casItems = props.data.cas || []
  // Paleta de colores extensa: Mezcla de corporativos de Pluxee/Tolko y colores de apoyo
  const colorPalette = ['#002d72', '#17ccf9', '#ffeb00', '#00eb5d', '#cc0032', '#f56040', '#833ab4', '#e1306c', '#fd1d1d', '#fcb045', '#9bbb59', '#ff9300', '#dbeafe', '#fbcfe8', '#9ca3af']

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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

  // Configuramos los datos para el gráfico de pastel
  chartData.value = {
    labels: ['Facebook', 'Instagram'],
    datasets: [
      {
        backgroundColor: ['#dbeafe', '#fbcfe8'],
        data: [parseFloat(props.data.messages.breakdown.facebook.percentage) || 0, parseFloat(props.data.messages.breakdown.instagram.percentage) || 0],
      },
    ],
  }

  chartData2.value = {
    // Usamos .map() para extraer los nombres que limpiamos en el backend
    labels: casItems.map(item => item.label),
    datasets: [
      {
        // Usamos % (módulo) para que si hay más de 15 datos, recicle la paleta de colores automáticamente y no se rompa
        backgroundColor: casItems.map((_, index) => colorPalette[index % colorPalette.length]),
        // Usamos .map() para extraer los valores numéricos
        data: casItems.map(item => item.value),
      },
    ],
  }

  onMounted(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const res = await fetch(`${apiUrl}/api/quejas`)
      if (!res.ok) throw new Error('Error al cargar quejas')

      listaQuejas.value = await res.json()
    } catch (error) {
      console.error('Error cargando quejas:', error)
    }
  })
</script>
