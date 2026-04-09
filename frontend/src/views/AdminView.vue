<template>
  <div class="min-h-screen bg-gray-50 p-10 font-sans text-gray-800">
    <div class="max-w-5xl mx-auto">
      <div class="flex justify-between items-center mb-10">
        <div>
          <h1 class="text-4xl font-black text-pluxeeBlue uppercase">Panel de Administración</h1>
          <p class="text-gray-500 mt-2">Actualiza los archivos CSV arrastrándolos a su categoría correspondiente.</p>
        </div>
        <router-link to="/" class="bg-pluxeeBlue text-white px-6 py-2 rounded-lg font-bold hover:bg-opacity-90 transition">Ver Reporte 👉</router-link>
      </div>

      <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <h2 class="text-2xl font-black text-pluxeeBlue uppercase mb-6 flex items-center">
          <span class="mr-3">📝</span>
          Editar Contexto Actual (RRSS)
        </h2>

        <div class="flex gap-4 mb-8">
          <input v-model="nuevoPunto" type="text" placeholder="Escribe un nuevo hallazgo o contexto..." class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-pluxeeBlue outline-none transition" @keyup.enter="agregarPunto" />
          <button @click="agregarPunto" class="bg-pluxeeBlue text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95">Agregar +</button>
        </div>

        <div class="space-y-3">
          <div v-for="item in listaContexto" :key="item.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group">
            <div class="flex-1">
              <input v-model="item.punto" class="bg-transparent w-full font-medium text-gray-700 outline-none focus:text-pluxeeBlue" @change="actualizarPunto(item)" />
            </div>
            <button @click="borrarPunto(item.id)" class="text-red-400 hover:text-red-600 ml-4 opacity-0 group-hover:opacity-100 transition">🗑️ Borrar</button>
          </div>

          <div v-if="listaContexto.length === 0" class="text-center text-gray-400 py-4 italic">No hay puntos registrados. Agrega el primero arriba.</div>
        </div>
      </section>

      <div v-if="alert.show" :class="alert.type === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'" class="p-4 rounded-lg border mb-8 font-bold text-center transition-all">
        {{ alert.message }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="file in fileCategories" :key="file.id" class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
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
                dragState[file.id] ? 'bg-blue-50 border-pluxeeBlue scale-[1.02]' : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-pluxeeBlue',
              ]">
              <div class="flex flex-col items-center justify-center pt-5 pb-6 pointer-events-none">
                <svg :class="dragState[file.id] ? 'text-pluxeeBlue' : 'text-gray-400'" class="w-8 h-8 mb-2 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p class="mb-2 text-sm text-gray-500 text-center">
                  <span class="font-semibold text-pluxeeBlue">Arrastra tu archivo aquí</span>
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
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const listaContexto = ref([])
  const nuevoPunto = ref('')
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const alert = ref({ show: false, message: '', type: '' })

  // Objeto reactivo para saber qué cajita está recibiendo un "Drag" (Hover de archivo)
  const dragState = ref({})

  const fileCategories = [
    { id: 'global_manual', title: 'Métricas Globales (Mes, KPIs)', icon: '⚙️' },
    { id: 'fb_overview', title: 'Facebook: Overview KPIs', icon: '📘' },
    { id: 'fb_posts', title: 'Facebook: Métricas de Posts', icon: '📝' },
    { id: 'fb_sentiment', title: 'Facebook: Sentimientos', icon: '💬' },
    { id: 'ig_overview', title: 'Instagram: Overview KPIs', icon: '📸' },
    { id: 'ig_posts', title: 'Instagram: Métricas de Posts', icon: '📱' },
    { id: 'ig_sentiment', title: 'Instagram: Sentimientos', icon: '❤️' },
  ]

  const showAlert = (msg, type) => {
    alert.value = { show: true, message: msg, type }
    setTimeout(() => {
      alert.value.show = false
    }, 4000)
  }

  //  LÓGICA CENTRALIZADA DE SUBIDA
  const processFile = async (typeId, file) => {
    if (!file) return

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      showAlert('Error: Solo se permiten archivos .csv', 'error')
      return
    }

    const formData = new FormData()
    formData.append('csvFile', file)

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const response = await fetch(`${apiUrl}/api/upload/${typeId}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Error al subir el archivo al servidor')

      showAlert(`¡Éxito! Archivo actualizado correctamente.`, 'success')
    } catch (error) {
      showAlert(error.message, 'error')
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

  // Cargar datos al entrar
  onMounted(async () => {
    fetchContexto()
  })

  const fetchContexto = async () => {
    const res = await fetch(`${apiUrl}/api/contexto`)
    listaContexto.value = await res.json()
  }

  const agregarPunto = async () => {
    if (!nuevoPunto.value.trim()) return
    const res = await fetch(`${apiUrl}/api/contexto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ punto: nuevoPunto.value }),
    })
    if (res.ok) {
      nuevoPunto.value = ''
      fetchContexto()
      showAlert('Punto agregado con éxito', 'success')
    }
  }

  const actualizarPunto = async item => {
    await fetch(`${apiUrl}/api/contexto/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ punto: item.punto }),
    })
    showAlert('Cambio guardado', 'success')
  }

  const borrarPunto = async id => {
    if (!confirm('¿Seguro que quieres eliminar este punto?')) return
    await fetch(`${apiUrl}/api/contexto/${id}`, { method: 'DELETE' })
    fetchContexto()
  }
</script>
