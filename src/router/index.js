import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import("../pages/QRNavigation.vue"),
      meta: {
        title: '首页',
      },
    },
    {
      path: '/test',
      name: 'test',
      component: () => import("../pages/TestView.vue"),
      meta: {
        title: '测试',
      },
    },
    {
      path: '/QRcodeCreate',
      name: 'QRcodeCreate',
      component: () => import("../pages/QRcodeCreate.vue"),
      meta: {
        title: '生成二维码',
      },
    },
    {
      path: '/*',
      redirect: '/',
    },
  ]
})

export default router