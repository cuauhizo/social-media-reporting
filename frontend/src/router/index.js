import { createRouter, createWebHistory } from 'vue-router'
import ReportView from '../views/ReportView.vue'
import AdminView from '../views/AdminView.vue'
import LoginView from '../views/LoginView.vue'

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
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { title: 'Iniciar Sesión | Admin' },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { title: 'Admin | Subida de Datos', requiresAuth: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Social Reporting'

  const isAuthenticated = !!localStorage.getItem('auth_token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    next('/admin')
  } else {
    next()
  }
})

export default router
