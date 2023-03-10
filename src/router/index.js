import { createRouter, createWebHistory } from 'vue-router'
import { defineAsyncComponent } from 'vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: defineAsyncComponent(() => import(`../pages/Location`)),
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