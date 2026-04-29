<template>
  <section class="pdf-page flex flex-col justify-center bg-gray-50">
    <div class="max-w-7xl mx-auto w-full p-4">
      <h2 class="text-3xl font-black text-pluxeeBlue mb-8 uppercase keep-with-next">Customer Service & Complains</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="no-break bg-white p-6 rounded-xl shadow-md border-t-4 border-pluxeeBlue">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Tipos de Casos (CAS)</h3>
          <div class="flex items-center justify-center mb-6 h-96">
            <Pie v-if="chartDataCasos" :data="chartDataCasos" :options="chartOptions" :plugins="[ChartDataLabels]" />
            <p v-else class="text-gray-400 animate-pulse">Cargando datos...</p>
          </div>
        </div>

        <div class="no-break bg-white p-6 rounded-xl shadow-md border-t-4 border-pluxeeBlue flex flex-col">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Origen de Mensajes</h3>
          <div class="flex-1 flex items-center justify-center mb-6 min-h-[320px]">
            <Pie v-if="chartDataOrigen" :data="chartDataOrigen" :options="chartOptions" :plugins="[ChartDataLabels]" />
            <p v-else class="text-gray-400 animate-pulse">Cargando datos...</p>
          </div>

          <div class="bg-blue-50 p-4 rounded-lg text-pluxeeBlue font-medium space-y-2 mt-auto">
            <p>
              📩 Se recibieron
              <strong>{{ metricas.total_calculado }} mensajes</strong>
              (Facebook y Instagram)
            </p>
            <p>
              ⚠️
              <strong>{{ metricas.cs_escalated }} casos</strong>
              pasaron a escalamiento.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { usePeriod } from '@/composables/usePeriod'
  import { Pie } from 'vue-chartjs'
  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
  import ChartDataLabels from 'chartjs-plugin-datalabels'

  ChartJS.register(ArcElement, Tooltip, Legend)

  const { selectedPeriod } = usePeriod()
  // Ya no dependemos de 'props', todo es reactivo a la base de datos
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

  const loadData = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      // MAGIA: Disparamos las 3 peticiones al mismo tiempo para que cargue ultra rápido
      const [resMetricas, resCasos] = await Promise.all([fetch(`${apiUrl}/api/metricas?periodo=${selectedPeriod.value}`), fetch(`${apiUrl}/api/casos-cs?periodo=${selectedPeriod.value}`)])

      // 2. Llenamos las Métricas Fijas y construimos su Gráfica
      if (resMetricas.ok) {
        const dataMetricas = await resMetricas.json()

        // CÁLCULO AUTOMÁTICO
        const fb = parseInt(dataMetricas.msj_fb) || 0
        const ig = parseInt(dataMetricas.msj_ig) || 0
        const total = fb + ig // Sumamos ambos para obtener el total de casos

        // Guardamos los datos originales y le añadimos nuestro nuevo total calculado
        metricas.value = {
          ...dataMetricas,
          total_calculado: total,
        }

        // Regla de 3 para sacar los porcentajes para la gráfica
        const percFb = total > 0 ? ((fb / total) * 100).toFixed(1) : 0
        const percIg = total > 0 ? ((ig / total) * 100).toFixed(1) : 0

        chartDataOrigen.value = {
          labels: ['Facebook', 'Instagram'],
          datasets: [
            {
              // Opcional: Le puse los colores de marca de FB e IG para que se vea genial
              backgroundColor: ['#dbeafe', '#fbcfe8'],
              data: [percFb, percIg],
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
  }
  watch(selectedPeriod, loadData)
  onMounted(loadData)
</script>
