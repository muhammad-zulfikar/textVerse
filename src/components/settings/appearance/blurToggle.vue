<template>
  <div class="flex items-center justify-between">
    <div>
      <label for="blur" class="text-lg font-semibold mb-1">Blur Effect</label>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Enable blur effect. This may cause heavy resource usage.
      </p>
    </div>
    <div class="mt-2 md:mt-0 flex items-center">
      <input
        type="checkbox"
        id="blur"
        v-model="uiStore.blurEnabled"
        @click="toggleBlur"
        class="hidden"
      />
      <label
        for="blur"
        :class="{
          'bg-cream dark:bg-gray-700': !uiStore.blurEnabled,
          'bg-[#ebdfc0] dark:bg-gray-800': uiStore.blurEnabled,
        }"
        class="relative inline-block custom-card-switch w-16 h-9 cursor-pointer transition-colors duration-300"
      >
        <span
          :class="{
            'translate-x-[0.3px]': !uiStore.blurEnabled,
            'translate-x-[30px]': uiStore.blurEnabled,
          }"
          class="absolute left-0 top-[0.2px] bottom-0 w-8 h-[34px] custom-card shadow-md transform transition-transform duration-300"
        ></span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { uiStore } from '@/utils/stores';

  const toggleBlur = () => {
    uiStore.setBlurEnabled(!uiStore.blurEnabled);
  };
</script>
