<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
      <div class="text-center mb-8">
        <img src="@/assets/img/logo-tolko.png" alt="Tolko Logo" class="w-24 mx-auto mb-4" />
        <h1 class="text-2xl font-black text-pluxeeBlue uppercase">Panel de Control</h1>
        <p class="text-gray-500 font-medium mt-2">Ingresa tus credenciales para continuar</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Usuario</label>
          <input v-model="username" type="text" required class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-pluxeeBlue outline-none transition font-bold" />
        </div>

        <div>
          <label class="block text-sm font-bold text-gray-700 mb-1">Contraseña</label>
          <div class="relative">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" required class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-pluxeeBlue outline-none transition font-bold" />

            <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 px-4 flex items-center text-xl text-gray-400 hover:text-pluxeeBlue transition-colors focus:outline-none">
              <span v-if="showPassword"><EyeOff class="w-5 h-5" /></span>
              <span v-else><Eye class="w-5 h-5" /></span>
            </button>
          </div>
        </div>

        <div v-if="errorMessage" class="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded-lg">
          {{ errorMessage }}
        </div>

        <button type="submit" :disabled="isLoading" class="w-full bg-pluxeeBlue text-white rounded-xl py-3 font-bold hover:bg-opacity-90 transition active:scale-95 disabled:opacity-50 mt-4">
          {{ isLoading ? 'Verificando...' : 'Entrar al Sistema' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { Eye, EyeOff } from 'lucide-vue-next'

  const username = ref('')
  const password = ref('')
  const errorMessage = ref('')
  const isLoading = ref(false)

  const showPassword = ref(false)

  const router = useRouter()

  const handleLogin = async () => {
    isLoading.value = true
    errorMessage.value = ''
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.value, password: password.value }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('auth_token', data.token) // Guardamos el gafete
        router.push('/admin') // Lo dejamos entrar
      } else {
        errorMessage.value = data.error || 'Credenciales inválidas'
      }
    } catch (e) {
      errorMessage.value = 'Error al conectar con el servidor'
    } finally {
      isLoading.value = false
    }
  }
</script>
