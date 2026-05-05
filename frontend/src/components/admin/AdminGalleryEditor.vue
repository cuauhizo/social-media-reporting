<template>
  <section class="mt-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
    <div class="mb-12 p-6 bg-blue-50 border border-blue-200 rounded-2xl shadow-sm">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div class="flex-1">
          <h3 class="text-xl font-black text-blue-900 uppercase flex items-center">
            <Image class="w-7 h-7 mr-3 text-blue-900" stroke-width="2.5" />
            Portada Mensual de Facebook
          </h3>
          <p class="text-sm text-blue-700 mt-1">Esta imagen representará el arte principal usado en Facebook durante el periodo reportado.</p>
        </div>
        <label class="bg-[#1877F2] text-white px-8 py-3 rounded-xl font-bold cursor-pointer hover:bg-blue-700 transition shadow-lg shrink-0 flex items-center gap-2">
          <ImagePlus class="w-5 h-5" />
          {{ coverPreview ? 'Cambiar Portada' : 'Subir Portada' }}
          <input type="file" class="hidden" accept="image/*" @change="subirImagenPost(currentCoverId, $event)" />
        </label>
      </div>

      <div class="mt-6 w-full h-48 bg-white rounded-xl border-2 border-dashed border-blue-200 overflow-hidden flex items-center justify-center relative group">
        <img v-if="coverPreview" :src="coverPreview" class="w-full h-full object-cover transition group-hover:opacity-90" />
        <div v-else class="text-blue-300 flex flex-col items-center">
          <Image class="w-12 h-12 text-blue-300 mb-4" stroke-width="2.5" />
          <p class="font-bold uppercase text-xs tracking-widest">Sin vista previa disponible</p>
        </div>
        <div v-if="coverPreview" class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
          <span class="bg-black/50 text-white px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm">Vista Previa Actual</span>
        </div>
      </div>
    </div>

    <h2 class="text-2xl font-black text-pluxeeBlue uppercase mb-6 flex items-center">
      <BookImage class="w-7 h-7 mr-3 text-pluxeeBlue" stroke-width="2.5" />
      Galería de Posts (Fijar Imágenes)
    </h2>

    <button @click="cargarPostsParaEditar" :disabled="isLoadingData" class="bg-pluxeeBlue text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition mb-6 disabled:opacity-50 flex items-center gap-2">
      <Search class="h-5 w-5" />
      {{ isLoadingData ? 'Buscando...' : 'Cargar Posts de este Mes' }}
    </button>
    <!-- <pre>{{ postsParaEditar }}</pre> -->
    <div v-if="postsParaEditar.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      <div v-for="post in postsParaEditar" :key="post.id" class="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm flex flex-col items-center text-center hover:shadow-md transition">
        <div class="w-full h-40 bg-gray-100 rounded-xl mb-4 overflow-hidden flex items-center justify-center border border-gray-100">
          <img v-if="post.picture" :src="post.picture" @error="$event.target.src = 'https://placehold.co/300x400/17ccf9/ffffff?text=Story+Sin+Imagen'" class="w-full h-full object-cover" />
          <div v-else class="flex flex-col items-center text-gray-400">
            <span class="text-3xl mb-1">🖼️</span>
            <p class="text-[10px] font-bold uppercase">Sin imagen</p>
          </div>
        </div>

        <div class="mb-3 w-full">
          <a v-if="post.link" :href="post.link" target="_blank" class="inline-flex items-center text-pluxeeBlue text-xs font-black bg-blue-50 px-3 py-1.5 rounded-full hover:bg-pluxeeBlue hover:text-white transition w-full justify-center">
            <span class="mr-1.5">
              <Link class="h-3 w-3" />
            </span>
            Ver Post Original
          </a>
          <span v-else class="text-[10px] text-gray-400 font-bold uppercase italic">Enlace no disponible</span>
        </div>

        <div class="mb-3 w-full flex justify-between items-center">
          <span
            :class="post.red_social === 'facebook' ? 'text-blue-700 bg-blue-50 border-blue-200' : 'text-pink-700 bg-pink-50 border-pink-200'"
            class="border px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <span v-if="post.red_social === 'facebook'">FB</span>
            <span v-else>IG</span>
          </span>

          <span :class="getBadgeColor(post.type)" class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shadow-sm transition-colors">
            {{ post.type }}
          </span>
        </div>

        <div class="w-full flex justify-between items-center">
          <p class="text-xs font-black text-gray-600 mb-4">Vistas: {{ formatNumber(post.views) }}</p>
          <p class="text-xs font-black text-gray-600 mb-4">Fecha: {{ formatDate(post.date) }}</p>
        </div>

        <p class="text-xs text-gray-600 mb-4 line-clamp-3 h-12 overflow-hidden italic" :title="post.text">"{{ post.text }}"</p>

        <label class="w-full bg-gray-800 text-white text-[11px] font-bold py-2 rounded-xl cursor-pointer hover:bg-black transition flex items-center justify-center">
          <span class="mr-2">
            <ImageUp class="h-3 w-3" />
          </span>
          Subir Captura
          <input type="file" class="hidden" accept="image/*" @change="subirImagenPost(post.id, $event)" />
        </label>
      </div>
    </div>

    <div v-else-if="busquedaRealizada && postsParaEditar.length === 0" class="text-center text-gray-400 py-8 italic border-2 border-dashed rounded-xl mt-4">No hay imágenes rotas que arreglar.</div>
  </section>
</template>

<script setup>
  import { ref, onMounted, computed, watch } from 'vue' // 👈 Agregamos watch
  import { useApi } from '@/composables/useApi'
  import { useToast } from '@/composables/useToast'
  import { formatDate, formatNumber } from '@/utils/formatters'
  import { usePeriod } from '@/composables/usePeriod' // 👈 1. Importamos el estado global
  import { Image, ImagePlus, BookImage, Search, Link, ImageUp } from 'lucide-vue-next'

  const { apiRequest, apiUrl } = useApi()
  const { showToast } = useToast()
  const { selectedPeriod } = usePeriod() // 👈 2. Extraemos la variable reactiva

  const coverPreview = ref(null)
  const postsParaEditar = ref([])
  const busquedaRealizada = ref(false)
  const isLoadingData = ref(false)

  const getBadgeColor = type => {
    const t = String(type).toUpperCase()
    if (t.includes('STORY')) return 'bg-orange-500 text-white'
    if (t.includes('REEL') || t.includes('VIDEO')) return 'bg-purple-600 text-white'
    if (t.includes('CAROUSEL') || t.includes('ALBUM')) return 'bg-teal-500 text-white'
    return 'bg-blue-500 text-white'
  }

  const cargarPostsParaEditar = async () => {
    isLoadingData.value = true
    try {
      // 🚀 3. Ahora usamos selectedPeriod en vez de hacer el cálculo del mes pasado
      const periodId = selectedPeriod.value

      const [data, imagesData] = await Promise.all([apiRequest(`/api/reports/${periodId}`, { cache: 'no-store' }), apiRequest(`/api/post-images`, { cache: 'no-store' })])

      const dictImages = {}
      imagesData.forEach(img => (dictImages[img.post_id] = img.image_url))

      const rawFb = Array.isArray(data.facebook) ? data.facebook : data.facebook?.posts || data.facebook?.topPosts || []
      const fbPosts = rawFb.map(p => ({ ...p, red_social: 'facebook' }))

      const igPostsBase = data.instagram?.topPostsIg || data.instagram?.topPosts || []
      const igStoriesBase = data.instagram?.topStoriesIg || data.instagram?.topStories || []
      const igPosts = [...igPostsBase, ...igStoriesBase].map(p => ({ ...p, red_social: 'instagram' }))

      const todos = [...fbPosts, ...igPosts]

      postsParaEditar.value = todos.map(p => ({
        id: p.id,
        text: p.text,
        type: p.type,
        date: p.date,
        views: p.views,
        red_social: p.red_social,
        link: p.link || p.postPermalink,
        picture: dictImages[p.id] ? `${apiUrl}${dictImages[p.id]}?t=${Date.now()}` : p.picture || p.img || '',
        is_fixed: !!dictImages[p.id],
      }))

      busquedaRealizada.value = true

      if (postsParaEditar.value.length === 0) {
        showToast('¡Excelente! No quedan posts por arreglar.', 'success')
      } else {
        showToast(`Se cargaron ${postsParaEditar.value.length} posts pendientes.`, 'success')
      }
    } catch (error) {
      showToast('Error al cargar posts.', 'error')
    } finally {
      isLoadingData.value = false
    }
  }

  // 🚀 4. El ID de la portada ahora es reactivo al selector superior
  const currentCoverId = computed(() => {
    return `fb_cover_${selectedPeriod.value}`
  })

  // Función para cargar la portada actual
  const cargarPortadaActual = async () => {
    try {
      const imagesData = await apiRequest('/api/post-images', { cache: 'no-store' })
      const portada = imagesData.find(img => img.post_id === currentCoverId.value)
      if (portada) {
        coverPreview.value = `${apiUrl}${portada.image_url}?t=${Date.now()}`
      } else {
        coverPreview.value = null // Reseteamos la vista si no hay portada para este mes
      }
    } catch (e) {
      console.error('Error al cargar preview de portada', e)
    }
  }

  // Subir la imagen
  const subirImagenPost = async (postId, event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('post_id', postId)
    formData.append('image', file)

    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${apiUrl}/api/post-images`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!res.ok) throw new Error('Error al subir imagen')

      showToast('Imagen actualizada correctamente', 'success')

      if (postId.startsWith('fb_cover_')) {
        cargarPortadaActual()
      } else {
        cargarPostsParaEditar()
      }
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  // 🚀 5. ¡LA PIEZA FALTANTE! Escuchar cuando cambias el mes en el admin
  watch(selectedPeriod, () => {
    cargarPortadaActual()
    // Si la lista de posts rotos ya estaba abierta, la recargamos para el nuevo mes
    if (busquedaRealizada.value) {
      cargarPostsParaEditar()
    }
  })

  onMounted(() => {
    cargarPortadaActual()
  })
</script>
