import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/components/Home.vue';
import About from '@/components/About.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/vue-notes',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
];

const router = createRouter({
  history: createWebHistory('/vue-notes/'),
  routes
});

export default router;
