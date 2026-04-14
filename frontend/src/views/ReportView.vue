<script setup>
  import { ref, onMounted } from 'vue'
  import CoverSection from '@/components/CoverSection.vue'
  import ContextSection from '@/components/ContextSection.vue'
  import FacebookSection from '@/components/FacebookSection.vue'
  import InstagramSection from '@/components/InstagramSection.vue'
  import BenchmarkSection from '@/components/BenchmarkSection.vue'
  import CustomerServiceSection from '@/components/CustomerServiceSection.vue'
  import NextStepsSection from '@/components/NextStepsSection.vue'
  import ConclusionsSection from '@/components/ConclusionsSection.vue'
  import ThankYouSection from '@/components/ThankYouSection.vue'

  const reportData = ref(null)
  const loading = ref(true)
  const error = ref(null)

  onMounted(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

      // 1. Calculamos automáticamente el periodo (Mes Anterior)
      const hoy = new Date()
      hoy.setMonth(hoy.getMonth() - 1)
      const año = hoy.getFullYear()
      const mesAnterior = String(hoy.getMonth() + 1).padStart(2, '0')
      const periodId = `${año}-${mesAnterior}`

      // 2. Cargamos los datos principales del reporte
      const res = await fetch(`${apiUrl}/api/reports/${periodId}`)

      if (res.ok) {
        reportData.value = await res.json()
        console.log('Datos del reporte cargados con éxito:', reportData.value)

        // 3. INTERCEPTOR DE IMÁGENES ROTAS
        const resCustomImages = await fetch(`${apiUrl}/api/post-images`, { cache: 'no-store' })
        if (resCustomImages.ok) {
          const customImages = await resCustomImages.json()
          const dict = {}
          customImages.forEach(img => (dict[img.post_id] = img.image_url))

          const patchImages = posts => {
            if (!posts || !Array.isArray(posts)) return
            posts.forEach(post => {
              if (dict[post.id]) {
                const finalUrl = apiUrl + dict[post.id]
                post.picture = finalUrl
                post.img = finalUrl // Reemplazamos también 'img'
              }
            })
          }

          // Aplica el parche dependiendo de cómo llamaste a tus arreglos
          patchImages(Array.isArray(reportData.value.facebook) ? reportData.value.facebook : reportData.value.facebook?.topPosts)

          // Parchamos los posts normales de IG
          patchImages(reportData.value.instagram?.topPostsIg || reportData.value.instagram?.topPosts)

          // NUEVO: Parchamos también las Historias de IG
          patchImages(reportData.value.instagram?.topStoriesIg || reportData.value.instagram?.topStories)
        }
      } else {
        console.error(`Error: No se encontró el reporte para el periodo ${periodId}`)
      }
    } catch (error) {
      console.error('Error general al montar ReportView:', error)
    } finally {
      // Marcamos que la carga terminó para ocultar cualquier spinner o esqueleto
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
      <BenchmarkSection :data="reportData.benchmarking" :insights="reportData.benchmarkInsights" />
      <InstagramSection :data="reportData.instagram" />
      <CustomerServiceSection :data="reportData.customerService" />
      <NextStepsSection :data="reportData.nextSteps" />
      <ConclusionsSection />
      <ThankYouSection />
    </div>
  </div>
</template>

<style scoped></style>
