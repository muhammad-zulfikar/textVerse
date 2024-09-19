<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 bg-black bg-opacity-40 z-40"
    @click="$emit('update:modelValue', false)"
  ></div>
</template>

<script setup lang="ts">
  defineProps({
    modelValue: {
      type: Boolean,
      required: true,
    },
  });

  defineEmits(['update:modelValue']);
</script>
