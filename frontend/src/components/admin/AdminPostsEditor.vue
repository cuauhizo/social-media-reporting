<template>
  <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10 overflow-hidden">
    <div class="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-100 pb-4">
      <h2 class="text-2xl font-black text-gray-800 uppercase flex items-center">
        <SquarePen class="w-7 h-7 mr-3 text-gray-800" stroke-width="2.5" />
        Edición Manual de Posts
      </h2>
      <div class="flex gap-2 mt-4 md:mt-0 bg-gray-100 p-1 rounded-lg">
        <button @click="redSeleccionada = 'fb'" :class="redSeleccionada === 'fb' ? 'bg-[#1877F2] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'" class="px-4 py-1.5 rounded-md font-bold text-sm transition-colors">Facebook</button>
        <button
          @click="redSeleccionada = 'ig'"
          :class="redSeleccionada === 'ig' ? 'bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'"
          class="px-4 py-1.5 rounded-md font-bold text-sm transition-colors">
          Instagram
        </button>
      </div>
    </div>

    <div v-if="posts.length === 0" class="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
      <p class="text-gray-500 font-medium">
        No se encontraron posts de {{ redSeleccionada.toUpperCase() }} para el periodo
        <b>{{ selectedPeriod }}</b>
        .
      </p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full text-left text-sm border-collapse min-w-[1000px]">
        <thead>
          <tr class="text-gray-400 text-[10px] uppercase tracking-widest border-b-2 border-gray-100">
            <th class="pb-2 w-64">Post Original</th>
            <th class="pb-2 w-40">Etiquetas (Tags)</th>
            <th class="pb-2 w-20 text-center">Vistas</th>
            <th class="pb-2 w-20 text-center">Alcance</th>
            <th class="pb-2 w-20 text-center">Interacc.</th>
            <th class="pb-2 w-20 text-center">Likes</th>
            <th class="pb-2 w-20 text-center">Shares</th>
            <th v-if="redSeleccionada === 'ig'" class="pb-2 w-20 text-center">Saves</th>
            <th class="pb-2 text-center w-16">Acción</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="post in posts" :key="post.id" class="hover:bg-gray-50 transition-colors group">
            <td class="py-3 pr-4 align-top w-64">
              <div class="flex gap-3 items-start">
                <img :src="post.img" class="w-14 h-14 object-cover rounded-md shadow-sm shrink-0 bg-gray-200 border border-gray-300" />

                <div class="flex-1 min-w-0">
                  <p class="text-[11px] text-gray-500 line-clamp-2 italic mb-1.5 leading-tight" :title="post.mensaje">"{{ post.mensaje || 'Sin texto' }}"</p>
                  <div class="flex justify-between items-center">
                    <span class="text-[9px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded">{{ post.tipo_post }}</span>
                    <a :href="post.permalink" target="_blank" class="text-[10px] text-blue-500 hover:underline font-bold flex items-center gap-1">
                      Ver Original
                      <ExternalLink class="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </td>

            <td class="py-3 px-1 align-top">
              <input v-model="post.tags" type="text" placeholder="#Tolko, #Trend..." class="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-xs font-bold text-blue-700 bg-blue-50" />
            </td>

            <td class="py-3 px-1 align-top"><input v-model="post.visitas" type="number" class="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-center font-bold text-gray-700" /></td>
            <td class="py-3 px-1 align-top"><input v-model="post.alcance" type="number" class="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-center font-bold text-gray-700" /></td>
            <td class="py-3 px-1 align-top"><input v-model="post.interacciones" type="number" class="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-center font-bold text-gray-700" /></td>
            <td class="py-3 px-1 align-top"><input v-model="post.likes" type="number" class="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-center font-bold text-gray-700" /></td>
            <td class="py-3 px-1 align-top"><input v-model="post.shares" type="number" class="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-center font-bold text-gray-700" /></td>
            <td v-if="redSeleccionada === 'ig'" class="py-3 px-1 align-top"><input v-model="post.saves" type="number" class="w-full p-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-center font-bold text-gray-700" /></td>

            <td class="py-3 text-center align-top">
              <button @click="guardarPost(post)" :disabled="isSaving" class="bg-gray-800 text-white p-2 rounded-lg hover:bg-black transition-transform active:scale-95 disabled:opacity-50" title="Guardar cambios"><Save class="w-5 h-5" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useApi } from '@/composables/useApi'
  import { usePeriod } from '@/composables/usePeriod'
  import { useToast } from '@/composables/useToast'
  import { SquarePen, Save, ExternalLink } from 'lucide-vue-next'

  const { apiRequest, isSaving, apiUrl } = useApi()
  const { selectedPeriod } = usePeriod()
  const { showToast } = useToast()

  const redSeleccionada = ref('fb') // 'fb' o 'ig'
  const posts = ref([])

  // Cargar posts
  const fetchPosts = async () => {
    try {
      // 🚀 Cargamos los posts Y las imágenes subidas al mismo tiempo
      const [postsData, imagesData] = await Promise.all([apiRequest(`/api/posts?periodo=${selectedPeriod.value}&red_social=${redSeleccionada.value}`), apiRequest(`/api/post-images`, { cache: 'no-store' })])

      // Convertimos las imágenes en un diccionario rápido { id: url }
      const dictImages = {}
      imagesData.forEach(img => (dictImages[img.post_id] = img.image_url))

      // Asignamos la imagen a cada post
      posts.value = postsData.map(p => {
        let defaultImg = redSeleccionada.value === 'fb' ? 'https://placehold.co/150x150/1877F2/ffffff?text=FB' : 'https://placehold.co/150x150/e1306c/ffffff?text=IG'

        if (p.tipo_post && p.tipo_post.toUpperCase().includes('STORY')) {
          defaultImg = 'https://placehold.co/150x150/fcb045/ffffff?text=Story'
        }

        return {
          ...p,
          // Si hay imagen tuya, la usamos. Si no, usamos el placeholder con el color de la red social
          img: dictImages[p.id] ? `${apiUrl}${dictImages[p.id]}?t=${Date.now()}` : defaultImg,
        }
      })
    } catch (error) {
      console.error('Error cargando posts:', error)
    }
  }

  // Guardar un post individual
  const guardarPost = async post => {
    try {
      await apiRequest(`/api/posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...post,
          red_social: redSeleccionada.value,
        }),
      })
      showToast('Post actualizado exitosamente', 'success')
    } catch (error) {
      showToast('Error al actualizar el post', 'error')
    }
  }

  // Reactividad a cambios de Red Social o Periodo
  watch([selectedPeriod, redSeleccionada], () => {
    fetchPosts()
  })

  onMounted(() => {
    fetchPosts()
  })
</script>
