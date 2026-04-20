<script setup>
  import { ref, onMounted } from 'vue'
  import html2pdf from 'html2pdf.js'
  import CoverSection from '@/components/CoverSection.vue'
  import ContextSection from '@/components/ContextSection.vue'
  import FacebookSection from '@/components/FacebookSection.vue'
  import InstagramSection from '@/components/InstagramSection.vue'
  import TrendsSection from '@/components/TrendsSection.vue'
  import BenchmarkSection from '@/components/BenchmarkSection.vue'
  import CustomerServiceSection from '@/components/CustomerServiceSection.vue'
  import FrequentComplainsSection from '@/components/FrequentComplainsSection.vue'

  import NextStepsSection from '@/components/NextStepsSection.vue'
  import ConclusionsSection from '@/components/ConclusionsSection.vue'
  import ThankYouSection from '@/components/ThankYouSection.vue'

  const reportData = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const isExporting = ref(false)

  const exportToPDF = () => {
    isExporting.value = true
    loading.value = true

    const element = document.getElementById('report-container')

    const opt = {
      margin: [0, 0], // Dale un poquito de margen (10mm) arriba y abajo
      filename: `Reporte_Pluxee_${reportData.value?.metadata?.period || 'Mensual'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      pagebreak: {
        mode: ['css'],
        avoid: ['.no-break', 'tr'], // Evita cortar elementos con la clase no-break y también las filas de las tablas (tr)
      },
    }

    //  EL TRUCO DE LAS GRÁFICAS: Esperamos 600ms antes de tomar la foto
    setTimeout(() => {
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          isExporting.value = false
          loading.value = false
        })
    }, 600) // 600 milisegundos de espera
  }

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
  <div class="font-sans text-gray-800 bg-gray-50">
    <button v-if="!loading && !isExporting" @click="exportToPDF" class="fixed bottom-8 right-8 z-50 bg-pluxeeBlue text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group print:hidden">
      <span class="font-bold hidden group-hover:inline ml-2">Descargar PDF</span>
      <span class="text-2xl">📄</span>
    </button>
    <div v-if="loading" class="flex h-screen items-center justify-center bg-pluxeeGreen text-white">
      <div class="text-2xl font-black animate-pulse uppercase tracking-widest">Generando Reporte Pluxee...</div>
    </div>

    <div v-else-if="error" class="p-10 text-red-600 font-bold text-center">Error: {{ error }}</div>

    <div v-else id="report-container">
      <CoverSection :metadata="reportData.metadata" />
      <ContextSection :data="reportData.context" />
      <FacebookSection :data="reportData.facebook" />
      <BenchmarkSection :data="reportData.benchmarking" :insights="reportData.benchmarkInsights" />
      <InstagramSection :data="reportData.instagram" />
      <TrendsSection :data="reportData.instagram" />
      <CustomerServiceSection :data="reportData.customerService" />
      <FrequentComplainsSection :data="reportData.customerService" />
      <NextStepsSection :data="reportData.nextSteps" />
      <ConclusionsSection />
      <ThankYouSection />
    </div>
  </div>
</template>

<style>
  /* Fuerza un salto de página DESPUÉS de cualquier elemento con esta clase */
  .pdf-page {
    page-break-after: always;
    break-after: page;
  }

  /* Evita que una tarjeta o gráfica se parta a la mitad entre dos páginas */
  .no-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  /* Fuerza un salto de página ANTES de que empiece este elemento */
  .force-new-page {
    page-break-before: always !important;
    break-before: page !important;
  }

  /* Evita que se corte la hoja justo DESPUÉS de este elemento (Ideal para Títulos) */
  .keep-with-next {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  @media print {
    .print\:hidden {
      display: none !important;
    }
  }
</style>
