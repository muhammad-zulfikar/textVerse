<template>
  <button
    :class="[
      'card flex items-center justify-center px-2 py-1.5 font-serif',
      variantClasses[variant as keyof typeof variantClasses],
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
    @click="handleClick"
    :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
  type VariantType = 'default' | 'danger' | 'confirm';

  const props = withDefaults(
    defineProps<{
      variant?: VariantType;
      disabled?: boolean;
    }>(),
    {
      variant: 'default',
      disabled: false,
    }
  );

  const emit = defineEmits(['click']);

  const variantClasses = {
    default:
      'md:hover:bg-cream-200 md:dark:hover:bg-gray-700 active:bg-cream-200 active:dark:bg-gray-700',
    danger:
      'md:hover:bg-red-700/50 md:dark:hover:bg-red-800/60 active:bg-red-700/50 active:dark:bg-red-800/60 text-red-500 md:hover:text-red-100 active:text-red-100',
    confirm:
      'md:hover:bg-blue-400 md:dark:hover:bg-blue-900/60 active:bg-blue-400 active:dark:bg-blue-900/60 text-blue-500 md:hover:text-blue-100 active:text-blue-100',
  } as const;

  const handleClick = (event: MouseEvent) => {
    if (!props.disabled) {
      emit('click', event);
    }
  };
</script>
