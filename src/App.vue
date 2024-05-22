<template>
  <div>
    <Navbar />
    <router-view />
  </div>
</template>

<script setup lang="ts">
  import Navbar from '@/components/Navbar/Navbar.vue';
</script>