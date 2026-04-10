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

      <div v-if="alert.show" :class="alert.type === 'success' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'" class="p-4 rounded-lg border mb-8 font-bold text-center transition-all">
        {{ alert.message }}
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

      <section class="mt-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <h2 class="text-2xl font-black text-pluxeeBlue uppercase mb-6 flex items-center">
          <span class="mr-3">🏆</span>
          Benchmark: Competidores e Insights
        </h2>

        <h3 class="font-bold text-gray-500 mb-4 text-sm uppercase">Agregar / Editar Competidores</h3>

        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100 items-end">
          <div class="col-span-2 lg:col-span-2">
            <!-- class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-pluxeeBlue outline-none transition" -->
            <label class="text-[10px] font-bold text-gray-500 uppercase">Marca</label>
            <input v-model="nuevoComp.brand_name" type="text" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" />
          </div>
          <div class="col-span-2 lg:col-span-2">
            <label class="text-[10px] font-bold text-gray-500 uppercase">Descripción</label>
            <input v-model="nuevoComp.description" type="text" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" placeholder="Ej: Supermercado" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-gray-500 uppercase">Posts</label>
            <input v-model="nuevoComp.posts_count" type="number" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-gray-500 uppercase">Frecuencia</label>
            <input v-model="nuevoComp.frequency" type="number" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-gray-500 uppercase">Interacción</label>
            <input v-model="nuevoComp.interaction" type="number" step="0.1" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-gray-500 uppercase">Seguidores</label>
            <input v-model="nuevoComp.followers" type="number" step="0.1" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" />
          </div>
          <div>
            <label class="text-[10px] font-bold text-gray-500 uppercase">Aumento Seg.</label>
            <input v-model="nuevoComp.gained_followers" type="number" step="0.1" class="w-full border-2 border-gray-200 p-2 rounded-lg text-sm" />
          </div>

          <div class="flex items-center justify-center bg-white border p-2 rounded-lg">
            <label class="text-[10px] font-bold text-pluxeeBlue uppercase flex items-center cursor-pointer">
              <input v-model="nuevoComp.is_main_brand" type="checkbox" class="mr-1" />
              Pluxee?
            </label>
          </div>
          <button @click="agregarCompetidor" class="bg-pluxeeBlue text-white p-2 rounded-lg font-bold text-sm">Guardar</button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="text-gray-400 text-xs uppercase border-b-2">
                <th class="pb-2">Marca</th>
                <th class="pb-2">Posts</th>
                <th class="pb-2">Frecuencia</th>
                <th class="pb-2">Interacción</th>
                <th class="pb-2">Seguidores</th>
                <th class="pb-2">Aumento</th>
                <th class="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="comp in listaCompetidores" :key="comp.id" class="border-b hover:bg-gray-50 transition-colors" :class="comp.is_main_brand ? 'bg-yellow-50' : ''">
                <td class="py-3 pr-2">
                  <div class="flex items-center">
                    <span v-if="comp.is_main_brand" class="text-pluxeeBlue text-xs mr-1">★</span>
                    <input v-model="comp.brand_name" class="bg-transparent font-bold w-full outline-none focus:text-pluxeeBlue border-b border-transparent focus:border-gray-300" @change="actualizarCompetidor(comp)" />
                  </div>
                  <input v-model="comp.description" class="bg-transparent text-xs font-normal text-gray-500 w-full outline-none focus:text-pluxeeBlue border-b border-transparent focus:border-gray-300" @change="actualizarCompetidor(comp)" />
                </td>

                <td class="py-3 pr-2">
                  <input type="number" v-model="comp.posts_count" class="bg-transparent w-16 outline-none focus:text-pluxeeBlue border-b border-transparent focus:border-gray-300" @change="actualizarCompetidor(comp)" />
                </td>

                <td class="py-3 pr-2">
                  <input type="number" step="0.1" v-model="comp.frequency" class="bg-transparent w-16 outline-none focus:text-pluxeeBlue border-b border-transparent focus:border-gray-300" @change="actualizarCompetidor(comp)" />
                </td>

                <td class="py-3 pr-2">
                  <input type="number" v-model="comp.interaction" class="bg-transparent w-20 outline-none focus:text-pluxeeBlue border-b border-transparent focus:border-gray-300" @change="actualizarCompetidor(comp)" />
                </td>

                <td class="py-3 pr-2">
                  <input type="number" v-model="comp.followers" class="bg-transparent w-24 outline-none focus:text-pluxeeBlue border-b border-transparent focus:border-gray-300" @change="actualizarCompetidor(comp)" />
                </td>

                <td class="py-3 pr-2 font-bold flex items-center" :class="comp.gained_followers >= 0 ? 'text-green-600' : 'text-red-600'">
                  <span v-if="comp.gained_followers > 0">+</span>

                  <input
                    type="number"
                    v-model="comp.gained_followers"
                    class="bg-transparent w-20 outline-none border-b border-transparent ml-1 transition-colors"
                    :class="comp.gained_followers >= 0 ? 'focus:text-green-800 focus:border-green-300' : 'focus:text-red-800 focus:border-red-300'"
                    @change="actualizarCompetidor(comp)" />
                </td>
                <td class="py-3 text-right">
                  <button @click="borrarCompetidor(comp.id)" class="text-red-400 hover:text-red-600 transition-transform hover:scale-110">🗑️</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr class="my-12 border-gray-200" />

        <div class="mb-8">
          <h3 class="font-bold text-gray-500 mb-2 text-sm uppercase">Insights de la competencia</h3>
          <div class="flex gap-2 mb-4">
            <input v-model="nuevoBenchmarkInsight" type="text" placeholder="Nuevo insight..." class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-pluxeeBlue outline-none transition" @keyup.enter="agregarBenchmarkInsight" />
            <button @click="agregarBenchmarkInsight" class="bg-pluxeeBlue text-white px-4 py-2 rounded-lg font-bold text-sm">Agregar Insight</button>
          </div>
          <div class="space-y-2">
            <div v-for="item in listaBenchmarkInsights" :key="item.id" class="flex gap-2 bg-gray-50 p-2 rounded-lg group text-sm">
              <input v-model="item.insight" class="bg-transparent flex-1 outline-none" @change="actualizarBenchmarkInsight(item)" />
              <button @click="borrarBenchmarkInsight(item.id)" class="text-red-400 opacity-0 group-hover:opacity-100">🗑️</button>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <h2 class="text-2xl font-black text-pluxeeBlue uppercase mb-6 flex items-center">
          <span class="mr-3">💡</span>
          Editar Insights de Benchmark
        </h2>

        <div class="flex gap-4 mb-8">
          <input
            v-model="nuevoBenchmarkInsight"
            type="text"
            placeholder="Escribe una conclusión del análisis de competencia..."
            class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-pluxeeBlue outline-none transition"
            @keyup.enter="agregarBenchmarkInsight" />
          <button @click="agregarBenchmarkInsight" class="bg-pluxeeBlue text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95">Agregar +</button>
        </div>

        <div class="space-y-3">
          <div v-for="item in listaBenchmarkInsights" :key="item.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group">
            <div class="flex-1">
              <input v-model="item.insight" class="bg-transparent w-full font-medium text-gray-700 outline-none focus:text-pluxeeBlue" @change="actualizarBenchmarkInsight(item)" />
            </div>
            <button @click="borrarBenchmarkInsight(item.id)" class="text-red-400 hover:text-red-600 ml-4 opacity-0 group-hover:opacity-100 transition">🗑️ Borrar</button>
          </div>
        </div>
      </section>

      <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <h2 class="text-2xl font-black text-red-500 uppercase mb-6 flex items-center">
          <span class="mr-3">⚠️</span>
          Editar Principales Quejas (CS)
        </h2>

        <div class="flex gap-4 mb-8">
          <input v-model="nuevaQueja" type="text" placeholder="Escribe una nueva queja recurrente..." class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition" @keyup.enter="agregarQueja" />
          <button @click="agregarQueja" class="bg-red-500 text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95">Agregar +</button>
        </div>

        <div class="space-y-3">
          <div v-for="item in listaQuejas" :key="item.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group">
            <div class="flex-1">
              <input v-model="item.queja" class="bg-transparent w-full font-medium text-gray-700 outline-none focus:text-red-500" @change="actualizarQueja(item)" />
            </div>
            <button @click="borrarQueja(item.id)" class="text-red-400 hover:text-red-600 ml-4 opacity-0 group-hover:opacity-100 transition">🗑️ Borrar</button>
          </div>

          <div v-if="listaQuejas.length === 0" class="text-center text-gray-400 py-4 italic">No hay quejas registradas. ¡Excelente trabajo del equipo!</div>
        </div>
      </section>

      <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <h2 class="text-2xl font-black text-pluxeeGreen uppercase mb-6 flex items-center">
          <span class="mr-3">🚀</span>
          Editar Propuestas (Next Steps)
        </h2>

        <div class="flex gap-4 mb-8">
          <input
            v-model="nuevaPropuesta"
            type="text"
            placeholder="Escribe una nueva estrategia o acción..."
            class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-pluxeeGreen outline-none transition"
            @keyup.enter="agregarPropuesta" />
          <button @click="agregarPropuesta" class="bg-pluxeeGreen text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95">Agregar +</button>
        </div>

        <div class="space-y-3">
          <div v-for="item in listaPropuestas" :key="item.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group">
            <div class="flex-1">
              <input v-model="item.propuesta" class="bg-transparent w-full font-medium text-gray-700 outline-none focus:text-pluxeeGreen" @change="actualizarPropuesta(item)" />
            </div>
            <button @click="borrarPropuesta(item.id)" class="text-red-400 hover:text-red-600 ml-4 opacity-0 group-hover:opacity-100 transition">🗑️ Borrar</button>
          </div>

          <div v-if="listaPropuestas.length === 0" class="text-center text-gray-400 py-4 italic">No hay próximos pasos definidos aún.</div>
        </div>
      </section>

      <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <h2 class="text-2xl font-black text-pluxeePink uppercase mb-6 flex items-center">
          <span class="mr-3">🚀</span>
          Editar Compromisos (Next Steps)
        </h2>

        <div class="flex gap-4 mb-8">
          <input v-model="nuevoCompromiso" type="text" placeholder="Escribe una nuevo compromiso..." class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-pluxeeGreen outline-none transition" @keyup.enter="agregarCompromiso" />
          <button @click="agregarCompromiso" class="bg-pluxeePink text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95">Agregar +</button>
        </div>

        <div class="space-y-3">
          <div v-for="item in listaCompromisos" :key="item.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group">
            <div class="flex-1">
              <input v-model="item.compromiso" class="bg-transparent w-full font-medium text-gray-700 outline-none focus:text-pluxeeGreen" @change="actualizarCompromiso(item)" />
            </div>
            <button @click="borrarCompromiso(item.id)" class="text-red-400 hover:text-red-600 ml-4 opacity-0 group-hover:opacity-100 transition">🗑️ Borrar</button>
          </div>

          <div v-if="listaCompromisos.length === 0" class="text-center text-gray-400 py-4 italic">No hay compromisos definidos aún.</div>
        </div>
      </section>

      <section class="mb-10">
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
      </section>

      <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-black text-pluxeeBlue uppercase flex items-center">
            <span class="mr-3">📊</span>
            Métricas de Customer Service
          </h2>
          <button @click="guardarMetricas" class="bg-pluxeeBlue text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95">💾 Guardar Métricas</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label class="block text-sm font-bold text-gray-500 mb-2">Casos Escalados</label>
            <input v-model="metricas.cs_escalated" type="number" class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-pluxeeBlue font-bold text-lg text-gray-800" />
          </div>
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label class="block text-sm font-bold text-gray-500 mb-2">Mensajes Facebook</label>
            <input v-model="metricas.msj_fb" type="number" class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-pluxeeBlue font-bold text-lg text-gray-800" />
          </div>
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label class="block text-sm font-bold text-gray-500 mb-2">Mensajes Instagram</label>
            <input v-model="metricas.msj_ig" type="number" class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-pluxeeBlue font-bold text-lg text-gray-800" />
          </div>
        </div>
      </section>

      <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <h2 class="text-2xl font-black text-orange-500 uppercase mb-6 flex items-center">
          <span class="mr-3">🎧</span>
          Editar Casos de Atención (Tipos)
        </h2>

        <div class="flex gap-4 mb-8">
          <input v-model="nuevoMotivo" type="text" placeholder="Ej: Actualización de datos" class="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-orange-500 outline-none transition" />
          <input v-model="nuevaCantidad" type="number" placeholder="Cantidad" class="w-32 border-2 border-gray-200 rounded-xl px-4 py-2 focus:border-orange-500 outline-none transition" @keyup.enter="agregarCasoCS" />
          <button @click="agregarCasoCS" class="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95">Agregar +</button>
        </div>

        <div class="space-y-3">
          <div v-for="item in listaCasosCS" :key="item.id" class="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100 group">
            <div class="flex-1 flex gap-4">
              <input v-model="item.motivo" class="bg-transparent flex-1 font-medium text-gray-700 outline-none focus:text-orange-500 border-b border-transparent focus:border-orange-300" @change="actualizarCasoCS(item)" />
              <input v-model="item.cantidad" type="number" class="bg-transparent w-20 text-center font-black text-gray-700 outline-none focus:text-orange-500 border-b border-transparent focus:border-orange-300" @change="actualizarCasoCS(item)" />
            </div>
            <button @click="borrarCasoCS(item.id)" class="text-red-400 hover:text-red-600 ml-4 opacity-0 group-hover:opacity-100 transition">🗑️ Borrar</button>
          </div>
          <div v-if="listaCasosCS.length === 0" class="text-center text-gray-400 py-4 italic">No hay casos registrados.</div>
        </div>
      </section>

      <section class="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-black text-pluxeeBlue uppercase flex items-center">
            <span class="mr-3">📌</span>
            Editar Conclusión Final
          </h2>
          <button @click="guardarConclusion" class="bg-pluxeeBlue text-white px-6 py-2 rounded-xl font-bold hover:scale-105 transition active:scale-95">💾 Guardar Conclusión</button>
        </div>

        <textarea
          v-model="conclusionData.texto"
          rows="5"
          placeholder="Escribe el resumen o la conclusión final del reporte mensual aquí..."
          class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pluxeeBlue outline-none transition resize-none text-gray-700 font-medium leading-relaxed"></textarea>
      </section>

      <section class="mt-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm mb-10">
        <h2 class="text-2xl font-black text-pluxeeBlue uppercase mb-6 flex items-center">
          <span class="mr-3">🖼️</span>
          Galería de Posts (Fijar Imágenes)
        </h2>

        <button @click="cargarPostsParaEditar" class="bg-pluxeeBlue text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition mb-6">🔍 Cargar Posts de este Mes</button>

        <div v-if="postsParaEditar.length > 0" class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div v-for="post in postsParaEditar" :key="post.id" class="border border-gray-200 p-4 rounded-xl flex flex-col items-center text-center bg-gray-50 relative">
            <img :src="post.picture" class="h-24 w-24 object-cover mb-3 rounded-lg shadow-sm bg-gray-200 border" />

            <a v-if="post.link" :href="post.link" target="_blank" class="text-xs text-pluxeeBlue font-black underline mb-2 hover:text-blue-800 transition">🔗 Ver Post Original</a>

            <p class="text-xs text-gray-500 mb-3 line-clamp-2 w-full h-8" :title="post.text">{{ post.text }}</p>

            <label class="bg-blue-100 text-pluxeeBlue text-xs font-bold px-3 py-1 rounded cursor-pointer hover:bg-blue-200 transition w-full">
              Subir Imagen
              <input type="file" class="hidden" accept="image/*" @change="subirImagenPost(post.id, $event)" />
            </label>
          </div>
        </div>
        <div v-else-if="postsParaEditar.length === 0" class="text-center text-gray-400 py-8 italic border-2 border-dashed rounded-xl mt-4">🎉 ¡Todos los posts están perfectos! No hay imágenes rotas que arreglar.</div>
      </section>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  const alert = ref({ show: false, message: '', type: '' })
  const listaContexto = ref([])
  const nuevoPunto = ref('')
  const listaQuejas = ref([])
  const nuevaQueja = ref('')
  const listaPropuestas = ref([])
  const nuevaPropuesta = ref('')
  const listaCompromisos = ref([])
  const nuevoCompromiso = ref('')
  const listaBenchmarkInsights = ref([])
  const nuevoBenchmarkInsight = ref('')
  const listaCasosCS = ref([])
  const nuevoMotivo = ref('')
  const nuevaCantidad = ref('')
  const metricas = ref({ cs_escalated: 0, msj_fb: 0, msj_ig: 0 })

  const listaCompetidores = ref([])
  const nuevoComp = ref({
    brand_name: '',
    description: '',
    posts_count: 0,
    frequency: 0,
    interaction: 0,
    followers: 0,
    gained_followers: 0,
    is_main_brand: false,
  })
  const conclusionData = ref({ id: null, texto: '' })
  const postsParaEditar = ref([])
  const customPostImages = ref({})

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
    fetchQuejas()
    fetchBenchmarkInsights()
    fetchCompetidores()
    fetchPropuestas()
    fetchCompromisos()
    fetchMetricas()
    fetchCasosCS()
    fetchConclusiones()
  })

  //  LÓGICA PARA CONTEXTO
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

  //  LÓGICA PARA QUEJAS
  const fetchQuejas = async () => {
    const res = await fetch(`${apiUrl}/api/quejas`)
    listaQuejas.value = await res.json()
  }

  const agregarQueja = async () => {
    if (!nuevaQueja.value.trim()) return
    const res = await fetch(`${apiUrl}/api/quejas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queja: nuevaQueja.value }),
    })
    if (res.ok) {
      nuevaQueja.value = ''
      fetchQuejas()
      showAlert('Queja agregada con éxito', 'success')
    }
  }

  const actualizarQueja = async item => {
    await fetch(`${apiUrl}/api/quejas/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queja: item.queja }),
    })
    showAlert('Cambio guardado', 'success')
  }

  const borrarQueja = async id => {
    if (!confirm('¿Seguro que quieres eliminar esta queja?')) return
    await fetch(`${apiUrl}/api/quejas/${id}`, { method: 'DELETE' })
    fetchQuejas()
  }

  //  LÓGICA PARA PROPUESTAS - PRÓXIMOS PASOS
  const fetchPropuestas = async () => {
    const res = await fetch(`${apiUrl}/api/propuestas`)
    listaPropuestas.value = await res.json()
  }

  const agregarPropuesta = async () => {
    if (!nuevaPropuesta.value.trim()) return
    const res = await fetch(`${apiUrl}/api/propuestas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propuesta: nuevaPropuesta.value }),
    })
    if (res.ok) {
      nuevaPropuesta.value = ''
      fetchPropuestas()
      showAlert('Paso agregado con éxito', 'success')
    }
  }

  const actualizarPropuesta = async item => {
    await fetch(`${apiUrl}/api/propuestas/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propuesta: item.paso }),
    })
    showAlert('Cambio guardado', 'success')
  }

  const borrarPropuesta = async id => {
    if (!confirm('¿Seguro que quieres eliminar este paso?')) return
    await fetch(`${apiUrl}/api/propuestas/${id}`, { method: 'DELETE' })
    fetchPropuestas()
  }

  //  LÓGICA PARA COMPROMISOS - PRÓXIMOS PASOS
  const fetchCompromisos = async () => {
    const res = await fetch(`${apiUrl}/api/compromisos`)
    listaCompromisos.value = await res.json()
  }

  const agregarCompromiso = async () => {
    if (!nuevoCompromiso.value.trim()) return
    const res = await fetch(`${apiUrl}/api/compromisos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compromiso: nuevoCompromiso.value }),
    })
    if (res.ok) {
      nuevoCompromiso.value = ''
      fetchCompromisos()
      showAlert('Compromiso agregado con éxito', 'success')
    }
  }

  const actualizarCompromiso = async item => {
    await fetch(`${apiUrl}/api/compromisos/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compromiso: item.paso }),
    })
    showAlert('Cambio guardado', 'success')
  }

  const borrarCompromiso = async id => {
    if (!confirm('¿Seguro que quieres eliminar este compromiso?')) return
    await fetch(`${apiUrl}/api/compromisos/${id}`, { method: 'DELETE' })
    fetchCompromisos()
  }

  // LÓGICA DE MÉTRICAS GLOBALES
  const fetchMetricas = async () => {
    const res = await fetch(`${apiUrl}/api/metricas`)
    const data = await res.json()
    // Fusionamos los datos de la BD con nuestro objeto reactivo (por si la BD está vacía al inicio)
    metricas.value = { ...metricas.value, ...data }
  }

  const guardarMetricas = async () => {
    const res = await fetch(`${apiUrl}/api/metricas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metricas.value),
    })
    if (res.ok) showAlert('Métricas globales guardadas con éxito', 'success')
  }

  // LÓGICA DE CASOS CS (Dinámicos)
  const fetchCasosCS = async () => {
    const res = await fetch(`${apiUrl}/api/casos-cs`)
    listaCasosCS.value = await res.json()
  }

  const agregarCasoCS = async () => {
    if (!nuevoMotivo.value.trim() || nuevaCantidad.value === '') return
    const res = await fetch(`${apiUrl}/api/casos-cs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: nuevoMotivo.value, cantidad: nuevaCantidad.value }),
    })
    if (res.ok) {
      nuevoMotivo.value = ''
      nuevaCantidad.value = ''
      fetchCasosCS()
      showAlert('Caso agregado con éxito', 'success')
    }
  }

  const actualizarCasoCS = async item => {
    await fetch(`${apiUrl}/api/casos-cs/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivo: item.motivo, cantidad: item.cantidad }),
    })
    showAlert('Caso actualizado', 'success')
  }

  const borrarCasoCS = async id => {
    if (!confirm('¿Seguro que quieres eliminar este tipo de caso?')) return
    await fetch(`${apiUrl}/api/casos-cs/${id}`, { method: 'DELETE' })
    fetchCasosCS()
  }

  // LÓGICA BENCHMARK INSIGHTS
  const fetchBenchmarkInsights = async () => {
    const res = await fetch(`${apiUrl}/api/benchmark-insights`)
    listaBenchmarkInsights.value = await res.json()
  }
  const agregarBenchmarkInsight = async () => {
    if (!nuevoBenchmarkInsight.value.trim()) return
    await fetch(`${apiUrl}/api/benchmark-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ insight: nuevoBenchmarkInsight.value }),
    })
    nuevoBenchmarkInsight.value = ''
    fetchBenchmarkInsights()
  }
  const actualizarBenchmarkInsight = async item => {
    await fetch(`${apiUrl}/api/benchmark-insights/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ insight: item.insight }),
    })
    showAlert('Insight actualizado', 'success')
  }
  const borrarBenchmarkInsight = async id => {
    if (!confirm('¿Eliminar insight?')) return
    await fetch(`${apiUrl}/api/benchmark-insights/${id}`, { method: 'DELETE' })
    fetchBenchmarkInsights()
  }

  // LÓGICA COMPETIDORES
  const fetchCompetidores = async () => {
    const res = await fetch(`${apiUrl}/api/benchmark-competitors`)
    listaCompetidores.value = await res.json()
  }
  const agregarCompetidor = async () => {
    if (!nuevoComp.value.brand_name.trim()) return
    const dataToSave = { ...nuevoComp.value, is_main_brand: nuevoComp.value.is_main_brand ? 1 : 0 }
    const res = await fetch(`${apiUrl}/api/benchmark-competitors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSave),
    })
    if (res.ok) {
      nuevoComp.value = { brand_name: '', description: '', posts_count: 0, frequency: 0, interaction: 0, followers: 0, gained_followers: 0, is_main_brand: false }
      fetchCompetidores()
      showAlert('Competidor agregado', 'success')
    }
  }

  const actualizarCompetidor = async comp => {
    // Nos aseguramos de mantener el is_main_brand original para MySQL
    const dataToSave = { ...comp, is_main_brand: comp.is_main_brand ? 1 : 0 }

    await fetch(`${apiUrl}/api/benchmark-competitors/${comp.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSave),
    })

    showAlert('Competidor actualizado', 'success')
  }

  const borrarCompetidor = async id => {
    if (!confirm('¿Eliminar competidor?')) return
    await fetch(`${apiUrl}/api/benchmark-competitors/${id}`, { method: 'DELETE' })
    fetchCompetidores()
  }

  // LÓGICA DE CONCLUSIÓN
  const fetchConclusiones = async () => {
    const res = await fetch(`${apiUrl}/api/conclusiones`)
    const data = await res.json()
    // Si ya hay una conclusión guardada en BD, tomamos la primera
    if (data.length > 0) {
      conclusionData.value.id = data[0].id
      conclusionData.value.texto = data[0].conclusion
    }
  }

  const guardarConclusion = async () => {
    if (!conclusionData.value.texto.trim()) return

    if (conclusionData.value.id) {
      // Si ya tiene ID, significa que existe en la BD y hacemos un UPDATE (PUT)
      await fetch(`${apiUrl}/api/conclusiones/${conclusionData.value.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conclusion: conclusionData.value.texto }),
      })
      showAlert('Conclusión actualizada', 'success')
    } else {
      // Si no tiene ID, es la primera vez que se guarda y hacemos un CREATE (POST)
      const res = await fetch(`${apiUrl}/api/conclusiones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conclusion: conclusionData.value.texto }),
      })
      if (res.ok) {
        const result = await res.json()
        conclusionData.value.id = result.id // Guardamos el ID que nos devolvió MySQL
        showAlert('Conclusión guardada', 'success')
      }
    }
  }

  // LÓGICA DE POSTS (Trae el reporte, saca los posts y te deja editarlos)
  const cargarPostsParaEditar = async () => {
    try {
      // 1. Calculamos el periodo (mes anterior, igual que en ReportView)
      const hoy = new Date()
      hoy.setMonth(hoy.getMonth() - 1)
      const año = hoy.getFullYear()
      const mesAnterior = String(hoy.getMonth() + 1).padStart(2, '0')
      const periodId = `${año}-${mesAnterior}`

      // 2. Traemos los datos crudos del reporte
      const resReporte = await fetch(`${apiUrl}/api/reports/${periodId}`)
      if (!resReporte.ok) return showAlert('Error cargando el reporte mensual', 'error')
      const data = await resReporte.json()

      // (Opcional) Ver en consola F12 exactamente qué está llegando
      console.log('Datos del reporte crudos:', data)

      // 3. Traemos las imágenes que ya arreglaste desde MySQL
      const resImages = await fetch(`${apiUrl}/api/post-images`)
      const imagesData = await resImages.json()

      // Limpiamos y llenamos el diccionario de imágenes arregladas
      customPostImages.value = {}
      imagesData.forEach(img => {
        customPostImages.value[img.post_id] = img.image_url
      })

      // 4. Buscamos los posts usando TODAS las posibles combinaciones de nombres
      const fbPosts = data.facebook?.topPosts || data.facebook?.realPosts || data.facebook?.posts || data.facebook?.top_posts || []
      const igPosts = data.instagram?.topPosts || data.instagram?.realPosts || data.instagram?.posts || data.instagram?.top_posts || []

      const todosLosPosts = [...fbPosts, ...igPosts]

      // 5. Mapeamos cada post sacando los datos de las llaves correctas de Hootsuite
      const mappedPosts = todosLosPosts.map(p => {
        // Sacamos el ID (fundamental para guardar la imagen)
        const id = p.id || p.post_id || p.Post_ID

        return {
          id: id,
          text: p.text || p.message || p.Post_Caption || p.Post_Message || 'Sin texto',
          picture: p.picture || p.thumbnail || p.image_url || p.Post_Image_URL || '',
          // 🔥 Aquí buscamos la URL original del post para tu enlace
          link: p.permalink || p.url || p.link || p.post_link || p.Post_URL || null,
          custom_image: customPostImages.value[id] || null,
        }
      })

      // 6. FILTRO: Solo dejamos los posts que NO tienen imagen personalizada (los pendientes)
      postsParaEditar.value = mappedPosts.filter(p => !p.custom_image)

      // 7. Notificaciones visuales para el usuario
      if (postsParaEditar.value.length === 0) {
        showAlert('✨ ¡Todos los posts están listos o no hay posts en este mes!', 'success')
      } else {
        showAlert(`🔍 Se encontraron ${postsParaEditar.value.length} posts para revisión.`, 'success')
      }
    } catch (error) {
      console.error('Error al cargar posts para editar:', error)
      showAlert('Hubo un error al procesar los posts. Revisa la consola.', 'error')
    }
  }

  const subirImagenPost = async (postId, event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    // ✨ CORRECCIÓN: Primero enviamos el texto (ID), luego el archivo (Imagen) ✨
    formData.append('post_id', postId)
    formData.append('image', file)

    try {
      const res = await fetch(`${apiUrl}/api/post-images`, { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Error al subir imagen')

      showAlert('Imagen del post actualizada', 'success')
      cargarPostsParaEditar() // Recargamos para que se vea la nueva imagen
    } catch (error) {
      showAlert(error.message, 'error')
    }
  }
</script>
