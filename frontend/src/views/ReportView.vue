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

        // 3. ✨ INTERCEPTOR DE IMÁGENES ROTAS ✨
        // Buscamos en MySQL si hay reemplazos manuales para las imágenes de los posts
        try {
          const resImages = await fetch(`${apiUrl}/api/post-images`)
          if (resImages.ok) {
            const overrides = await resImages.json()
            const dict = {}

            // Creamos un diccionario rápido [ID_POST]: URL_IMAGEN
            overrides.forEach(img => {
              dict[img.post_id] = img.image_url
            })

            // Función interna para parchar los posts buscando llaves inteligentes (topPosts, realPosts, etc.)
            const fixPosts = posts => {
              if (!posts) return
              posts.forEach(post => {
                // Identificamos el ID único del post
                const id = post.id || post.post_id || post.Post_ID

                // Si este ID existe en nuestra tabla de "imágenes arregladas"
                if (dict[id]) {
                  // Reemplazamos la URL original por la de nuestro servidor
                  post.picture = apiUrl + dict[id]
                  console.log(`Imagen corregida para el post: ${id}`)
                }
              })
            }

            // Aplicamos el parche a las secciones de Facebook e Instagram
            const fbData = reportData.value.facebook
            if (fbData) {
              fixPosts(fbData.topPosts || fbData.realPosts || fbData.posts)
            }

            const igData = reportData.value.instagram
            if (igData) {
              fixPosts(igData.topPosts || igData.realPosts || igData.posts)
            }
          }
        } catch (err) {
          console.error('Error al aplicar el interceptor de imágenes:', err)
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
      <!-- <BenchmarkSection :data="reportData.benchmarking" />
        -->
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
