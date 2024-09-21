<template>
  <div class="fixed inset-0 flex items-center justify-center p-4">
    <div
      class="font-serif card px-10 py-8 md:p-8 relative flex flex-col mx-auto max-w-md w-full"
    >
      <h2 class="text-2xl font-bold mb-4 flex justify-center">
        Page Not Found
      </h2>
      <p class="text-center mb-4 text-gray-700 dark:text-gray-300">
        Sorry, the page you are looking for does not exist.
      </p>
      <button
        @click="goHome"
        class="flex w-full md:w-fit items-center justify-center px-4 py-2 mt-4 mx-auto card"
      >
        <PhHouseLine :size="20" class="mr-2" />
        Go to Home
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import { PhHouseLine } from '@phosphor-icons/vue';

  const router = useRouter();

  const goHome = () => {
    router.push('/');
  };
</script>
