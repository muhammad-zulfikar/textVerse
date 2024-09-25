<template>
  <Transition name="toast-slide">
    <div
      v-if="uiStore.showToast"
      @click="hideToast"
      class="fixed z-[10000] bottom-[1rem] right-[1rem] cursor-pointer shadow-md text-sm md:text-base cursor-default hover:shadow-xl rounded-lg py-[.5rem] px-[1rem] bg-cream-100 dark:bg-gray-750 font-serif border-[1px] border-black dark:border-white transition-all duration-300"
    >
      <div class="flex items-center">
        <PhInfo size="20" class="mr-2" />
        {{ uiStore.toastMessage }}
      </div>
    </div>
  </Transition>
</template>

<script lang="ts" setup>
  import { PhInfo } from '@phosphor-icons/vue';
  import { uiStore } from '@/store';

  const hideToast = () => {
    uiStore.showToast = false;
  };
</script>
