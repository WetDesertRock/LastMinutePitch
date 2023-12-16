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
      path: '/list',
      name: 'list',
      component: () => import('../views/PitchList.vue')
    },
    {
      path: '/slides/:id',
      name: 'slides',
      component: () => import('../views/SlidesView.vue')
    }
  ]
})

export default router
