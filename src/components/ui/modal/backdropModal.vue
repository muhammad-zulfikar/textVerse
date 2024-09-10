<!-- modalBackdrop.vue -->

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-40 z-40"
    :class="{ 'backdrop-blur-[2px]': uiStore.blurEnabled }"
    @click="$emit('update:modelValue', false)"
  ></div>
</template>

<script setup lang="ts">
  import { uiStore } from '@/utils/stores';

  defineProps({
    modelValue: {
      type: Boolean,
      required: true,
    },
  });

  defineEmits(['update:modelValue']);
</script>
