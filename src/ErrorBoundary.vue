<template>
  <div>
    <slot v-if="!error"></slot>
    <div v-else class="error-message">
      <h2>An error occurred</h2>
      <p>{{ error.message }}</p>
      <button @click="reload">Reload App</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onErrorCaptured } from 'vue';

  const error = ref<Error | null>(null);

  onErrorCaptured((e: Error) => {
    error.value = e;
    return false;
  });

  const reload = () => {
    window.location.reload();
  };
</script>

<style scoped>
  .error-message {
    padding: 20px;
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
    margin: 20px 0;
  }
</style>
