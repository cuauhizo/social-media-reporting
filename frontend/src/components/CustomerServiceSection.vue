<template>
  <div class="py-12 px-8 bg-gray-50">
    <div class="max-w-7xl mx-auto min-h-screen">
      <h2 class="text-3xl font-black text-pluxeeBlue mb-8 uppercase">Customer Service & Complains</h2>
      <pre>{{ metricas }}</pre>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-pluxeeBlue">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Tipos de Casos (CAS)</h3>
          <div class="flex items-center justify-center mb-6 h-96">
            <Pie v-if="chartDataCasos" :data="chartDataCasos" :options="chartOptions" :plugins="[ChartDataLabels]" />
            <p v-else class="text-gray-400 animate-pulse">Cargando datos...</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-pluxeeBlue">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Origen de Mensajes</h3>
          <div class="flex items-center justify-center mb-6 h-80">
            <Pie v-if="chartDataOrigen" :data="chartDataOrigen" :options="chartOptions" :plugins="[ChartDataLabels]" />
            <p v-else class="text-gray-400 animate-pulse">Cargando datos...</p>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg text-pluxeeBlue font-medium space-y-2">
            <p>
              📩 Se recibieron
              <strong>{{ metricas.msj_fb + metricas.msj_ig }} mensajes</strong>
              (Facebook y Instagram)
            </p>
            <p>
              ⚠️
              <strong>{{ metricas.cs_escalated }} casos</strong>
              pasaron a escalamiento.
            </p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-yellow-400">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Frequent Complains</h3>
          <p class="text-sm text-gray-500 mb-4">Temas recurrentes escalados durante el mes</p>

          <ul class="space-y-3">
            <li v-for="(item, index) in listaQuejas" :key="item.id" class="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div class="w-8 h-8 rounded-full bg-pluxeeBlue text-white flex justify-center items-center font-bold mr-4 shrink-0">
                {{ index + 1 }}
              </div>
              <span class="text-gray-700 font-medium text-lg w-full">{{ item.queja }}</span>
            </li>
            <li v-if="listaQuejas.length === 0" class="text-gray-400 italic">No hay quejas registradas.</li>
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

  ChartJS.register(ArcElement, Tooltip, Legend)

  // Ya no dependemos de 'props', todo es reactivo a la base de datos
  const listaQuejas = ref([])
  const metricas = ref({ cs_total: 0, cs_escalated: 0 })

  const chartDataOrigen = ref(null)
  const chartDataCasos = ref(null)

  const colorPalette = ['#002d72', '#17ccf9', '#ffeb00', '#00eb5d', '#cc0032', '#f56040', '#833ab4', '#e1306c', '#fd1d1d', '#fcb045', '#9bbb59', '#ff9300', '#dbeafe', '#fbcfe8', '#9ca3af']

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      datalabels: {
        color: '#ffffff',
        display: function (context) {
          return context.dataset.data[context.dataIndex] > 0
        },
        formatter: value => {
          return value + '%'
        },
      },
      legend: {
        labels: { usePointStyle: true, pointStyle: 'circle' },
      },
      tooltip: {
        callbacks: {
          label: context => {
            return ` ${context.raw}%`
          },
        },
      },
    },
  }

  onMounted(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      // ✨ MAGIA: Disparamos las 3 peticiones al mismo tiempo para que cargue ultra rápido
      const [resQuejas, resMetricas, resCasos] = await Promise.all([fetch(`${apiUrl}/api/quejas`), fetch(`${apiUrl}/api/metricas`), fetch(`${apiUrl}/api/casos-cs`)])

      // 1. Llenamos las Quejas
      if (resQuejas.ok) listaQuejas.value = await resQuejas.json()

      // 2. Llenamos las Métricas Fijas y construimos su Gráfica
      if (resMetricas.ok) {
        const dataMetricas = await resMetricas.json()
        metricas.value = dataMetricas // Guardamos en variable para imprimir textos

        chartDataOrigen.value = {
          labels: ['Facebook', 'Instagram'],
          datasets: [
            {
              backgroundColor: ['#dbeafe', '#fbcfe8'],
              data: [parseFloat(dataMetricas.percentage_fb) || 0, parseFloat(dataMetricas.percentage_ig) || 0],
            },
          ],
        }
      }

      // 3. Llenamos los Casos Dinámicos, calculamos porcentajes y construimos su Gráfica
      if (resCasos.ok) {
        const dataCasos = await resCasos.json()

        // Sumamos todos los casos para poder sacar el porcentaje de cada uno
        const totalCasos = dataCasos.reduce((sum, item) => sum + (parseInt(item.cantidad) || 0), 0)

        chartDataCasos.value = {
          labels: dataCasos.map(item => item.motivo),
          datasets: [
            {
              backgroundColor: dataCasos.map((_, index) => colorPalette[index % colorPalette.length]),
              // Convertimos la "cantidad" cruda en porcentaje (Ej. 20 de 100 = 20.0%)
              data: dataCasos.map(item => {
                const cant = parseInt(item.cantidad) || 0
                return totalCasos > 0 ? ((cant / totalCasos) * 100).toFixed(1) : 0
              }),
            },
          ],
        }
      }
    } catch (error) {
      console.error('Error cargando la sección de Customer Service:', error)
    }
  })
</script>
