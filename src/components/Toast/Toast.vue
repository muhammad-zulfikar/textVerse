<!-- Toast.vue -->

<template>
  <div
    v-if="visible"
    class="fixed z-51 bottom-[1rem] right-[1rem] shadow-sm text-sm md:text-base cursor-default hover:shadow-xl rounded-lg py-[.5rem] px-[1rem] bg-cream dark:bg-gray-800 font-serif border-[1px] md:border-2 border-black dark:border-white"
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
