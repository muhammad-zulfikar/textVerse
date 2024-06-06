<template>
  <div>
    <Navbar />
    <router-view />
  </div>
</template>

<script setup lang="ts">
  import Navbar from '@/components/Navbar/Navbar.vue';
</script>

<style>
  html {
    background-color: rgb(224, 196, 143);
  }
</style>