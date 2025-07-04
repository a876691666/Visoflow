import { createRouter, createWebHistory } from 'vue-router'
import Examples from '@/examples/Examples.vue'

const routes = [
  {
    path: '/',
    name: 'Examples',
    component: Examples
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 