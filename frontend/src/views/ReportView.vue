<script setup>
  import { ref, onMounted, watch } from 'vue'
  import html2pdf from 'html2pdf.js'
  import { usePeriod } from '@/composables/usePeriod'

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

  const { selectedPeriod } = usePeriod() // Obtenemos el mes seleccionado
  const reportData = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const isExporting = ref(false)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const loadReport = async () => {
    loading.value = true
    error.value = null
    try {
      // 1. Buscamos la info del reporte directo en la nueva API súper rápida
      const res = await fetch(`${apiUrl}/api/reports/${selectedPeriod.value}`)

      if (!res.ok) throw new Error(`No se pudo cargar el reporte`)
      reportData.value = await res.json()

      // 2. Cargamos la portada de Facebook si existe
      const resImages = await fetch(`${apiUrl}/api/post-images`, { cache: 'no-store' })
      if (resImages.ok) {
        const images = await resImages.json()
        const coverId = `fb_cover_${selectedPeriod.value}`
        const coverData = images.find(img => img.post_id === coverId)
        if (coverData) {
          reportData.value.facebook.coverImage = `${apiUrl}${coverData.image_url}?t=${Date.now()}`
        }
      }
    } catch (err) {
      console.error(err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Si el cliente cambia el mes en el selector, recargamos automáticamente
  watch(selectedPeriod, () => {
    loadReport()
  })

  onMounted(() => {
    loadReport()
  })

  const exportToPDF = () => {
    isExporting.value = true

    window.scrollTo(0, 0)

    setTimeout(() => {
      const element = document.getElementById('report-container')

      const opt = {
        margin: 0,
        filename: `Reporte_Pluxee_${reportData.value?.metadata?.period || 'Mensual'}.pdf`,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          windowWidth: 1280,
          scrollY: 0,
        },
        jsPDF: {
          unit: 'px',
          format: [1280, 720],
          orientation: 'landscape',
          hotfixes: ['px_scaling'],
        },
        pagebreak: {
          mode: 'legacy',
          before: '.pdf-page:not(:first-child)',
        },
      }

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          isExporting.value = false
        })
    }, 800)
  }
</script>

<template>
  <div class="font-sans text-gray-800 bg-gray-50">
    <div class="bg-pluxeeBlue p-4 hidden justify-center items-center gap-4 text-white print:hidden">
      <span class="text-xs font-bold uppercase tracking-widest opacity-70">Viendo reporte de:</span>
      <input type="month" v-model="selectedPeriod" class="bg-white/10 border border-white/20 rounded-lg px-3 py-1 font-black outline-none cursor-pointer hover:bg-white/20 transition" />
    </div>

    <button v-if="!loading && !error && !isExporting" @click="exportToPDF" class="fixed bottom-8 right-8 z-50 bg-pluxeeBlue text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center gap-2 group print:hidden">
      <span class="font-bold hidden group-hover:inline ml-2">Descargar PDF</span>
      <span class="text-2xl">📄</span>
    </button>

    <div v-if="loading" class="flex h-screen items-center justify-center bg-pluxeeGreen text-white">
      <div class="text-2xl font-black animate-pulse uppercase tracking-widest mx-4 text-center">Generando Reporte...</div>
    </div>

    <div v-else-if="error" class="flex h-screen flex-col items-center justify-center text-center px-4">
      <span class="text-6xl mb-4">📭</span>
      <h2 class="text-2xl font-bold text-pluxeeBlue mb-2">Reporte no encontrado</h2>
      <p class="text-gray-500 font-medium">
        No hay datos procesados para el periodo
        <b>{{ selectedPeriod }}</b>
        .
      </p>
      <p class="text-gray-400 text-sm mt-2">Ve al panel de administrador y sube los archivos CSV para este mes.</p>
    </div>

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
  .pdf-page {
    min-height: 100vh;
    width: 100%;
  }

  .export-mode {
    width: 1280px !important;
    margin: 0 !important;
    padding: 0 !important;
    background-color: #f9fafb;
    gap: 0 !important;
  }

  .export-mode .pdf-page {
    width: 1280px !important;
    height: 719px !important;
    min-height: 719px !important;
    max-height: 719px !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
  }

  /* 🚀 Quitamos sombras durante la exportación */
  .export-mode * {
    box-shadow: none !important;
  }

  .no-break {
    page-break-inside: avoid;
    break-inside: avoid;
  }

  @media print {
    .print\:hidden {
      display: none !important;
    }
  }
</style>
