<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { usePeriod } from '@/composables/usePeriod'
  import html2pdf from 'html2pdf.js'
  import CoverSection from '@/components/CoverSection.vue'
  import ContextSection from '@/components/ContextSection.vue'
  import FacebookSection from '@/components/FacebookSection.vue'
  import InstagramSection from '@/components/InstagramSection.vue'
  import BenchmarkSection from '@/components/BenchmarkSection.vue'
  import CustomerServiceSection from '@/components/CustomerServiceSection.vue'
  import FrequentComplainsSection from '@/components/FrequentComplainsSection.vue'
  import NextStepsSection from '@/components/NextStepsSection.vue'
  import ConclusionsSection from '@/components/ConclusionsSection.vue'
  import ThankYouSection from '@/components/ThankYouSection.vue'

  const { selectedPeriod } = usePeriod()
  const reportData = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const isExporting = ref(false)

  const exportToPDF = () => {
    isExporting.value = true

    const element = document.getElementById('report-container')

    const opt = {
      margin: [0, 0], // Dale un poquito de margen (10mm) arriba y abajo
      filename: `Reporte_Pluxee_${reportData.value?.metadata?.period || 'Mensual'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        windowWidth: 1280,
      },
      // jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      jsPDF: { unit: 'mm', format: [339, 190], orientation: 'landscape' },
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
        })
    }, 600) // 600 milisegundos de espera
  }

  // Función para cargar los datos (la sacamos del onMounted para poder reutilizarla)
  const loadReport = async () => {
    loading.value = true
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const res = await fetch(`${apiUrl}/api/reports/${selectedPeriod.value}`)

      if (res.ok) {
        reportData.value = await res.json()

        // 3. INTERCEPTOR DE IMÁGENES (Cache Busting y Parcheo)
        const resCustomImages = await fetch(`${apiUrl}/api/post-images`, { cache: 'no-store' })

        if (resCustomImages.ok) {
          const customImages = await resCustomImages.json()
          const dict = {}

          // Creamos el diccionario con el truco del tiempo para matar la caché
          customImages.forEach(img => {
            dict[img.post_id] = `${img.image_url}?t=${Date.now()}`
          })

          // Buscamos específicamente la portada de ESTE mes
          if (dict[dynamicCoverId]) {
            reportData.value.facebook.coverImage = apiUrl + dict[dynamicCoverId]
          }

          // Función genérica para parchar los arreglos de posts
          const patchImages = posts => {
            if (!posts || !Array.isArray(posts)) return
            posts.forEach(post => {
              if (dict[post.id]) {
                const finalUrl = apiUrl + dict[post.id]
                post.picture = finalUrl
                post.img = finalUrl
              }
            })
          }

          // Aplicamos el parche a todas las secciones necesarias
          const fbPosts = Array.isArray(reportData.value.facebook) ? reportData.value.facebook : reportData.value.facebook?.topPosts

          patchImages(fbPosts)
          patchImages(reportData.value.instagram?.topPostsIg || reportData.value.instagram?.topPosts)
          patchImages(reportData.value.instagram?.topStoriesIg || reportData.value.instagram?.topStories)
        }
      } else {
        console.error(`Error: No se encontró el reporte para el periodo ${periodId}`)
      }
    } catch (error) {
      console.error('Error al cargar reporte:', error)
    } finally {
      loading.value = false
    }
  }

  // Recargar cuando cambie el periodo
  watch(selectedPeriod, () => {
    loadReport()
  })

  onMounted(() => {
    loadReport()
  })
</script>

<template>
  <div class="font-sans text-gray-800 bg-gray-50">
    <div class="fixed z-10 bg-pluxeeBlue p-4 flex justify-center items-center gap-4 text-white print:hidden">
      <span class="text-xs font-bold uppercase tracking-widest opacity-70">Viendo reporte de:</span>
      <input type="month" v-model="selectedPeriod" class="bg-white/10 border border-white/20 rounded-lg px-3 py-1 font-black outline-none cursor-pointer hover:bg-white/20 transition" />
    </div>
    <button v-if="!loading && !isExporting" @click="exportToPDF" class="fixed bottom-8 right-8 z-50 bg-pluxeeBlue text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group print:hidden">
      <span class="font-bold hidden group-hover:inline ml-2">Descargar PDF</span>
      <span class="text-2xl">📄</span>
    </button>
    <div v-if="loading" class="flex h-screen items-center justify-center bg-pluxeeGreen text-white">
      <div class="text-2xl font-black animate-pulse uppercase tracking-widest mx-4 text-center">Generando Reporte Pluxee...</div>
    </div>

    <div v-else-if="error" class="p-10 text-red-600 font-bold text-center">Error: {{ error }}</div>

    <div v-else id="report-container" :class="{ 'export-mode': isExporting }">
      <CoverSection :metadata="reportData.metadata" />
      <ContextSection :data="reportData.context" />
      <FacebookSection :data="reportData.facebook" />
      <BenchmarkSection :data="reportData.benchmarking" :insights="reportData.benchmarkInsights" />
      <InstagramSection :data="reportData.instagram" />
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
  /* 1. Comportamiento normal en la Web (Responsivo) */
  .pdf-page {
    min-height: 100vh; /* Recuperamos la altura responsiva que habíamos borrado */
    width: 100%;
    page-break-after: always;
    break-after: avoid;
  }

  /* 2. Comportamiento ESTRICTO solo al exportar a PDF (Congela la pantalla a 16:9) */
  .export-mode .pdf-page {
    width: 1280px !important;
    height: 720px !important;
    min-height: auto !important;
    margin: 0 auto;
    overflow: hidden;
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
