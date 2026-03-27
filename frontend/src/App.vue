<script setup>
  import { ref, onMounted } from 'vue'
  import CoverSection from './components/CoverSection.vue'
  import ContextSection from './components/ContextSection.vue'
  import FacebookSection from './components/FacebookSection.vue'
  import InstagramSection from './components/InstagramSection.vue'
  import BenchmarkSection from './components/BenchmarkSection.vue'
  import CustomerServiceSection from './components/CustomerServiceSection.vue'
  import NextStepsSection from './components/NextStepsSection.vue'
  // import Responsive from '@/components/responsive.vue'

  const reportData = ref(null)
  const loading = ref(true)
  const error = ref(null)

  onMounted(async () => {
    try {
      // Leemos la URL desde el .env (Si no existe, usa localhost por defecto)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      const res = await fetch(`${apiUrl}/api/reports/2026-02`)
      if (!res.ok) throw new Error('Error al cargar el reporte')

      reportData.value = await res.json()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  })
</script>

<template>
  <div class="font-sans text-gray-800 bg-gray-50 min-h-screen">
    <div v-if="loading" class="flex h-screen items-center justify-center bg-pluxeeGreen text-white">
      <div class="text-2xl font-black animate-pulse uppercase tracking-widest">Generando Reporte Pluxee...</div>
    </div>

    <div v-else-if="error" class="p-10 text-red-600 font-bold text-center">Error: {{ error }}</div>

    <div v-else>
      <CoverSection :metadata="reportData.metadata" />
      <ContextSection :data="reportData.context" />
      <FacebookSection :data="reportData.facebook" />
      <!-- <BenchmarkSection :data="reportData.benchmarking" />
        -->
      <BenchmarkSection :data="reportData.benchmarking" :insights="reportData.benchmarkInsights" />
      <InstagramSection :data="reportData.instagram" />
      <CustomerServiceSection :data="reportData.customerService" />
      <NextStepsSection :data="reportData.nextSteps" />
    </div>
  </div>
  <!-- <Responsive /> -->
</template>

<style scoped></style>
