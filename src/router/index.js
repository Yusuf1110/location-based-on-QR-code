import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import("../pages/LocationView.vue"),
      meta: {
        title: '首页',
      },
    },
    {
      path: '/*',
      redirect: '/',
    },
  ]
})

export default router