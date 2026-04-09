import { createRouter, createWebHistory } from 'vue-router'
import ReportView from '../views/ReportView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'report',
      component: ReportView,
      meta: { title: 'Reporte Pluxee' },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { title: 'Admin | Subida de Datos' },
    },
  ],
})

router.beforeEach((to, from, next) => {
  // Busca el título en los metas de la ruta a la que vamos, si no hay, usa uno por defecto
  document.title = to.meta.title || 'Social Reporting'

  // Le decimos al router que continúe con la navegación normal
  next()
})

export default router
