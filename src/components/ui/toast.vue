<template>
  <div
    v-if="visible"
    @click="hideToast"
    class="fixed z-[10000] bottom-[1rem] right-[1rem] cursor-pointer shadow-md text-sm md:text-base cursor-default hover:shadow-xl rounded-lg py-[.5rem] px-[1rem] bg-cream-300 dark:bg-gray-750 font-serif border-[1px] border-black dark:border-white transition-all duration-300"
  >
    {{ message }}
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, onMounted } from 'vue';

  interface Props {
    message: string;
  }

  const props = defineProps<Props>();
  const visible = ref(false);
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const showToast = () => {
    visible.value = true;
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      visible.value = false;
      timeoutId = null;
    }, 3000);
  };

  const hideToast = () => {
    visible.value = false;
  };

  onMounted(showToast);

  watch(
    () => props.message,
    (newMessage) => {
      if (newMessage) {
        showToast();
      }
    }
  );
</script>

<style scoped>
  .toast-slide-enter-active,
  .toast-slide-leave-active {
    transition: all 0.3s ease;
  }

  .toast-slide-enter-from,
  .toast-slide-leave-to {
    transform: translateX(100%);
    opacity: 0;
  }
</style>
