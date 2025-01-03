<template>
  <Transition name="fade">
    <Backdrop v-if="props.modelValue" />
  </Transition>
  <Transition :name="transition">
    <div
      v-if="props.modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center font-serif"
    >
      <div @click="closeModal" class="absolute inset-0"></div>
      <slot></slot>
    </div>
  </Transition>
</template>

<script setup lang="ts">
  import Backdrop from './backdrop.vue';

  const props = defineProps<{
    modelValue: boolean;
    close?: () => void;
    transition?: string;
    id: string;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void;
    (e: 'close'): void;
  }>();

  const transition = props.transition || 'zoom';

  const closeModal = () => {
    emit('close');
  };
</script>
