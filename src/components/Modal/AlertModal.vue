<!-- AlertModal.vue -->

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-40 bg-black bg-opacity-30 backdrop-blur-[2px]"
  ></div>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center font-serif"
  >
    <div
      class="custom-card p-5 relative flex flex-col w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3"
    >
      <h1 class="text-xl font-bold mb-4 relative mt-2">Confirmation</h1>
      <p class="mb-6">{{ message }}</p>
      <div class="flex justify-end">
        <button
          @click="$emit('cancel')"
          class="hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none mr-6 cursor-pointer"
        >
          <span class="text-sm">Cancel</span>
        </button>
        <button
          @click="$emit('confirm')"
          class="text-red-500 hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none cursor-pointer"
        >
          <span class="text-sm">Proceed</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineProps<{
    isOpen: boolean;
    message: string;
  }>();

  defineEmits<{
    (e: 'cancel'): void;
    (e: 'confirm'): void;
  }>();
</script>
