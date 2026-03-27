<template>
  <div class="py-12 px-8 bg-gray-50">
    <div class="max-w-7xl mx-auto min-h-screen">
      <h2 class="text-3xl font-black text-pluxeeBlue mb-8 uppercase">Customer Service & Complains</h2>
      <!-- <pre>{{ data }}</pre> -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="bg-white p-6 rounded-xl shadow-md border-t-4 border-pluxeeBlue">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Origen de Mensajes</h3>
          <div class="flex items-center justify-center mb-6 h-64">
            <Pie :data="chartData" :options="chartOptions" />
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
            <li v-for="complaint in data.complaints" :key="complaint.id" class="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div class="w-8 h-8 rounded-full bg-pluxeeBlue text-white flex justify-center items-center font-bold mr-4">
                {{ complaint.id }}
              </div>
              <span class="text-gray-700 font-medium text-lg">{{ complaint.topic }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { Pie } from 'vue-chartjs'
  import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

  const props = defineProps({
    data: Object,
  })

  ChartJS.register(ArcElement, Tooltip, Legend)

  const chartData = ref({})
  // const chartOptions = { responsive: true, maintainAspectRatio: false }
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
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
</script>
