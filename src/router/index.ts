/**
 * Vue Router 設定
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/faq',
    name: 'faq',
    component: () => import('@/views/FAQ.vue')
  },
  {
    path: '/project/:userName/:slug',
    name: 'project-view',
    component: () => import('@/views/ProjectView.vue'),
    props: true
  },
  {
    path: '/project/:userName/:slug/edit',
    name: 'project-edit',
    component: () => import('@/views/ProjectEditor.vue'),
    props: true,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 認証ガード
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // Clerk の認証状態をチェック
    // 実際には Clerk の状態を確認する必要があります
    const isAuthenticated = !!(window as any).__clerk?.user
    if (!isAuthenticated) {
      next('/login')
      return
    }
  }
  next()
})

export default router
