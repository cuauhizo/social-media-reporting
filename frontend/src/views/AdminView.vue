<template>
  <div class="min-h-screen bg-gray-50 py-10 font-sans text-gray-800">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex flex-col justify-between items-center mb-10 md:flex-row">
        <div>
          <h1 class="text-3xl mb-4 text-center font-black text-pluxeeBlue uppercase md:text-4xl md:text-start">Panel de Administración</h1>
          <div class="fixed z-10 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
            <CalendarRange class="w-8 h-8 text-pluxeePink" />
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Periodo a editar</span>
              <input type="month" v-model="selectedPeriod" class="font-black text-pluxeePink outline-none bg-transparent cursor-pointer" />
            </div>
          </div>
        </div>
        <div class="flex gap-4">
          <button @click="cerrarSesion" class="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition ml-2 flex items-center gap-2">
            Salir
            <LogOut class="h-5 w-5" />
          </button>
          <router-link to="/" target="_blank" class="bg-pluxeeBlue text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition flex items-center gap-2">
            Ver Reporte
            <Proportions class="h-5 w-5" />
          </router-link>
        </div>
      </div>

      <div v-if="alert.show" :class="alert.type === 'success' ? 'bg-green-600' : 'bg-red-600'" class="fixed bottom-10 right-10 z-50 text-white px-6 py-4 rounded-xl shadow-2xl font-bold flex items-center gap-3 transition-all">
        <span v-if="alert.type === 'success'" class="text-2xl"><Check /></span>
        <span v-else class="text-2xl">
          <X />
        </span>
        {{ alert.message }}
      </div>

      <AdminContextEditor />
      <AdminBenchmarkEditor />
      <AdminQuejasEditor />
      <AdminPropuestasEditor />
      <AdminCompromisosEditor />

      <section class="mb-10">
        <div class="mb-12">
          <div class="flex items-center gap-3 mb-6 border-b border-gray-200 pb-3">
            <div class="w-10 h-10 bg-[#1877F2] rounded-full flex items-center justify-center text-white shadow-sm">
              <i class="fab fa-facebook-f text-lg"></i>
            </div>
            <h2 class="text-2xl font-black text-gray-800 uppercase">Archivos de Facebook</h2>
          </div>

          <p class="text-gray-500 my-2">Actualiza los archivos CSV arrastrándolos a su categoría correspondiente.</p>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="file in facebookFiles" :key="file.id" class="bg-white p-6 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition">
              <div class="flex items-center mb-4">
                <span class="text-2xl mr-3">{{ file.icon }}</span>
                <h3 class="text-lg font-bold text-pluxeeBlue">{{ file.title }}</h3>
              </div>

              <div
                class="relative flex items-center justify-center w-full"
                @dragover.prevent="dragState[file.id] = true"
                @dragenter.prevent="dragState[file.id] = true"
                @dragleave.prevent="dragState[file.id] = false"
                @drop.prevent="onDrop(file.id, $event)">
                <label
                  :for="'dropzone-' + file.id"
                  :class="[
                    'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200',
                    dragState[file.id] ? 'bg-blue-50 border-[#1877F2] scale-[1.02]' : 'bg-gray-50 border-gray-300 hover:bg-blue-50 hover:border-[#1877F2]',
                  ]">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                    <svg :class="dragState[file.id] ? 'text-[#1877F2]' : 'text-gray-400'" class="w-8 h-8 mb-2 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                    </svg>
                    <p class="mb-2 text-sm text-gray-500 text-center">
                      <span class="font-semibold text-[#1877F2]">Arrastra tu archivo aquí</span>
                      <br />
                      o haz clic para explorar
                    </p>
                  </div>
                  <input :id="'dropzone-' + file.id" type="file" class="hidden" accept=".csv" @change="onFileSelect(file.id, $event)" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center gap-3 mb-6 border-b border-gray-200 pb-3">
            <div class="w-10 h-10 bg-gradient-to-tr from-yellow-400 to-fuchsia-600 rounded-full flex items-center justify-center text-white shadow-sm">
              <i class="fab fa-instagram text-lg"></i>
            </div>
            <h2 class="text-2xl font-black text-gray-800 uppercase">Archivos de Instagram</h2>
          </div>
          <p class="text-gray-500 my-2">Actualiza los archivos CSV arrastrándolos a su categoría correspondiente.</p>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="file in instagramFiles" :key="file.id" class="bg-white p-6 rounded-xl border border-pink-100 shadow-sm hover:shadow-md transition">
              <div class="flex items-center mb-4">
                <span class="text-2xl mr-3">{{ file.icon }}</span>
                <h3 class="text-lg font-bold text-pluxeeBlue">{{ file.title }}</h3>
              </div>

              <div
                class="relative flex items-center justify-center w-full"
                @dragover.prevent="dragState[file.id] = true"
                @dragenter.prevent="dragState[file.id] = true"
                @dragleave.prevent="dragState[file.id] = false"
                @drop.prevent="onDrop(file.id, $event)">
                <label
                  :for="'dropzone-' + file.id"
                  :class="[
                    'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200',
                    dragState[file.id] ? 'bg-pink-50 border-[#e1306c] scale-[1.02]' : 'bg-gray-50 border-gray-300 hover:bg-pink-50 hover:border-[#e1306c]',
                  ]">
                  <div class="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                    <svg :class="dragState[file.id] ? 'text-[#e1306c]' : 'text-gray-400'" class="w-8 h-8 mb-2 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                    </svg>
                    <p class="mb-2 text-sm text-gray-500 text-center">
                      <span class="font-semibold text-[#e1306c]">Arrastra tu archivo aquí</span>
                      <br />
                      o haz clic para explorar
                    </p>
                  </div>
                  <input :id="'dropzone-' + file.id" type="file" class="hidden" accept=".csv" @change="onFileSelect(file.id, $event)" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdminCustomerServiceEditor />
      <AdminAuditEditor />
      <AdminPostsEditor />
      <AdminConclusionEditor />
      <AdminGalleryEditor />
      <div class="mt-16 mb-20 p-8 bg-red-50 border-2 border-red-200 border-dashed rounded-2xl flex flex-col items-center text-center">
        <h3 class="text-2xl font-black text-red-600 uppercase mb-2 flex items-center">
          <TriangleAlert class="w-7 h-7 mr-3" stroke-width="2.5" />
          Zona de Peligro
        </h3>
        <p class="text-red-500 mb-6 font-medium">
          ¿Subiste archivos equivocados o el mes se corrompió? Presiona este botón para eliminar TODOS los datos, posts, contextos y gráficas del periodo
          <b>{{ selectedPeriod }}</b>
          .
        </p>
        <button @click="borrarMesCompleto" class="bg-red-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-red-700 hover:scale-105 transition shadow-lg flex items-center">FORMATEAR MES ACTUAL</button>
      </div>
    </div>
    <ConfirmModal />
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router'
  import { ref, computed } from 'vue'
  import { useToast } from '@/composables/useToast'
  import { usePeriod } from '@/composables/usePeriod'
  import { useApi } from '@/composables/useApi'
  import { useModal } from '@/composables/useModal'
  import { CalendarRange, LogOut, Proportions, TriangleAlert, Check, X } from 'lucide-vue-next'
  import ConfirmModal from '@/components/admin/ConfirmModal.vue'
  import AdminContextEditor from '@/components/admin/AdminContextEditor.vue'
  import AdminQuejasEditor from '@/components/admin/AdminQuejasEditor.vue'
  import AdminPropuestasEditor from '@/components/admin/AdminPropuestasEditor.vue'
  import AdminCompromisosEditor from '@/components/admin/AdminCompromisosEditor.vue'
  import AdminCustomerServiceEditor from '@/components/admin/AdminCustomerServiceEditor.vue'
  import AdminBenchmarkEditor from '@/components/admin/AdminBenchmarkEditor.vue'
  import AdminConclusionEditor from '@/components/admin/AdminConclusionEditor.vue'
  import AdminGalleryEditor from '@/components/admin/AdminGalleryEditor.vue'
  import AdminAuditEditor from '@/components/admin/AdminAuditEditor.vue'
  import AdminPostsEditor from '@/components/admin/AdminPostsEditor.vue'

  const router = useRouter()
  const { apiRequest } = useApi()
  const { showModal } = useModal()
  const { alert, showToast } = useToast()
  const { selectedPeriod } = usePeriod()

  // Objeto reactivo para saber qué cajita está recibiendo un "Drag" (Hover de archivo)
  const dragState = ref({})

  const fileCategories = [
    // { id: 'global_manual', title: 'Métricas Globales (Mes, KPIs)', icon: '⚙️' },
    { id: 'fb_overview', title: 'Facebook: Overview KPIs', icon: '📘' },
    { id: 'fb_posts', title: 'Facebook: Métricas de Posts', icon: '📝' },
    { id: 'fb_sentiment', title: 'Facebook: Sentimientos', icon: '❤️' },
    { id: 'ig_overview', title: 'Instagram: Overview KPIs', icon: '📸' },
    { id: 'ig_posts', title: 'Instagram: Métricas de Posts', icon: '📱' },
    { id: 'ig_sentiment', title: 'Instagram: Sentimientos', icon: '❤️' },
  ]

  const facebookFiles = computed(() => {
    return fileCategories.filter(file => file.id.includes('fb') || file.id.includes('facebook'))
  })

  const instagramFiles = computed(() => {
    return fileCategories.filter(file => file.id.includes('ig') || file.id.includes('instagram'))
  })

  //  LÓGICA CENTRALIZADA DE SUBIDA
  const processFile = async (typeId, file) => {
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      showToast('Error: Solo se permiten archivos .csv', 'error')
      return
    }

    const formData = new FormData()
    formData.append('csvFile', file)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/api/upload/${typeId}/${selectedPeriod.value}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // 🚀 2. Agregamos el gafete
        },
        body: formData,
      })

      if (!response.ok) throw new Error('Error al subir el archivo al servidor')

      showToast(`¡Éxito! Archivo actualizado para ${selectedPeriod.value}.`, 'success')
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  // Evento 1: Cuando el usuario hace CLIC en la caja y elige el archivo
  const onFileSelect = (typeId, event) => {
    const file = event.target.files[0]
    processFile(typeId, file)
    event.target.value = '' // Reseteamos el input para que pueda subir el mismo archivo si se equivocó
  }

  // Evento 2: Cuando el usuario ARRASTRA Y SUELTA el archivo
  const onDrop = (typeId, event) => {
    // Apagamos la animación visual de "Hover"
    dragState.value[typeId] = false

    // Extraemos el archivo que el usuario soltó desde el evento 'dataTransfer'
    const file = event.dataTransfer.files[0]
    processFile(typeId, file)
  }

  const borrarMesCompleto = async () => {
    // 🚀 INVOCAMOS EL NUEVO MODAL HERMOSO
    const isConfirmed = await showModal({
      title: '⚠️ ZONA DE PELIGRO',
      message: `Estás a punto de borrar ABSOLUTAMENTE TODO el trabajo, datos y reportes de ${selectedPeriod.value}.\n\nPara confirmar la destrucción, escribe exactamente el periodo:`,
      type: 'prompt', // Pide validación de texto
      expectedInput: selectedPeriod.value, // La palabra a escribir
      confirmText: 'Destruir Todo',
      cancelText: 'Me arrepentí',
    })

    if (!isConfirmed) {
      showToast('Operación cancelada.', 'error')
      return
    }

    try {
      await apiRequest(`/api/reports/reset/${selectedPeriod.value}`, { method: 'DELETE' })
      showToast('Toda la información del mes ha sido eliminada.', 'success')
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      showToast('Error al limpiar el mes', 'error')
    }
  }

  const cerrarSesion = () => {
    localStorage.removeItem('auth_token')
    router.push('/login')
  }
</script>
