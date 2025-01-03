import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/home.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/pages/settings.vue'),
  },
  {
    path: '/trash',
    name: 'Trash',
    component: () => import('@/pages/trash.vue'),
  },
  {
    path: '/trash/:id',
    name: 'Deleted Note',
    component: () => import('@/pages/trash.vue'),
  },
  {
    path: '/sign-in',
    name: 'Sign In',
    component: () => import('@/pages/signIn.vue'),
  },
  {
    path: '/public/:publicId',
    name: 'Public',
    component: () => import('@/pages/public.vue'),
    props: true,
  },
  {
    path: '/:id',
    name: 'Note',
    component: () => import('@/pages/home.vue'),
  },
  {
    path: '/reset-password',
    name: 'Reset Password',
    component: () => import('@/pages/resetPassword.vue'),
  },
  {
    path: '/:catchAll(.*)',
    name: '404',
    component: () => import('@/pages/404.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
