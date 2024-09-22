<template>
  <button
    :class="[
      'card flex items-center justify-center px-2 py-1.5',
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
    default: 'hover:bg-cream-200 dark:hover:bg-gray-700',
    danger:
      'hover:bg-red-700/50 dark:hover:bg-red-800/60 text-red-500 hover:text-red-100',
    confirm:
      'hover:bg-blue-600 dark:hover:bg-blue-900/60 text-blue-500 hover:text-blue-200',
  } as const;

  const handleClick = (event: MouseEvent) => {
    if (!props.disabled) {
      emit('click', event);
    }
  };
</script>
