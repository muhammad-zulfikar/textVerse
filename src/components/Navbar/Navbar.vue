<template>
  <div class="navbar">
    <router-link :to="{ path: '/' }" class="nav-link dark:text-white dark:border-white" :class="{ 'font-bold border-b-2 border-black': $route.path === '/' }">Home</router-link>
    <span class="dark:text-white">|</span>
    <router-link :to="{ path: '/about' }" class="nav-link dark:text-white dark:border-white" :class="{ 'font-bold border-b-2 border-black': $route.path === '/about' }">About</router-link>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.navbar {
  text-align: center;
  margin-top: 20px;
}

.nav-link {
  text-decoration: none;
  margin: 0 10px;
  cursor: pointer;
}
</style>