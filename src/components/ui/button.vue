<template>
  <button
    :class="[
      'flex items-center card px-2 py-1.5',
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
    default: 'hover:bg-[#ebdfc0] dark:hover:bg-gray-700',
    danger:
      'hover:bg-red-700/50 dark:hover:bg-red-800/60 text-red-500 hover:text-red-100',
    confirm: '',
  } as const;

  const handleClick = (event: MouseEvent) => {
    if (!props.disabled) {
      emit('click', event);
    }
  };
</script>
