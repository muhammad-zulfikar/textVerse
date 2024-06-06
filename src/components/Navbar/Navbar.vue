<template>
  <div class="navbar">
    <router-link :to="{ path: '/' }" class="nav-link" :class="{ 'font-bold border-b-2 border-black': $route.path === '/' }">Home</router-link> |
    <router-link :to="{ path: '/about' }" class="nav-link" :class="{ 'font-bold border-b-2 border-black': $route.path === '/about' }">About</router-link>
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
  color: #333;
  margin: 0 10px;
  cursor: pointer;
}
</style>