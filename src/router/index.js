import { createRouter, createWebHistory } from 'vue-router'
import GeneratePitchView from '../views/GeneratePitchView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'generatepitch',
      component: GeneratePitchView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/slides/:id',
      name: 'slides',
      component: () => import('../views/SlidesView.vue')
    }
  ]
})

export default router
