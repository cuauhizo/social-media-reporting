import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import { Chart as ChartJS } from 'chart.js'
ChartJS.defaults.animation = false

const app = createApp(App)
app.use(router)
app.mount('#app')
