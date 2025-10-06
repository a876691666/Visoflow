import { createRouter, createWebHistory } from 'vue-router';
import Examples from '@/examples/Examples.vue';

const routes = [
  {
    path: '/',
    name: 'Examples',
    component: Examples
  }
];

const router = createRouter({
  // 使用 Vite 的 BASE_URL 作为 history base，方便部署到子路径（如 /visoflow/）
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
