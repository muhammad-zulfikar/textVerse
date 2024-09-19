import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/home.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('@/pages/about.vue'),
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
    path: '/:catchAll(.*)',
    name: 'NotFound',
    component: () => import('@/pages/notFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
