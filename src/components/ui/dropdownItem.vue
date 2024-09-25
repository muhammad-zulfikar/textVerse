<template>
  <div
    @click="handleClick"
    class="text-sm cursor-pointer px-1"
    :class="[
      itemType === 'destructive'
        ? 'text-red-500 hover:text-red-100'
        : 'text-inherit',
    ]"
    role="menuitem"
  >
    <span
      class="p-2 w-full text-left rounded-md transition-colors duration-200 flex items-center whitespace-nowrap cursor-pointer"
      :class="[
        itemType === 'normal' && 'hover:bg-cream-200 dark:hover:bg-gray-700',
        itemType === 'destructive' &&
          'hover:bg-red-700/50 dark:hover:bg-red-800/60',
        itemType === 'active' && 'bg-cream-200 dark:bg-gray-700',
      ]"
    >
      <component
        :is="props.icon"
        v-if="props.icon"
        :size="20"
        class="size-5 mr-2"
      />
      <slot>{{ props.label }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
  import { PropType } from 'vue';

  const props = defineProps({
    label: String,
    icon: Object as PropType<any>,
    itemType: {
      type: String as PropType<'normal' | 'destructive' | 'active'>,
      default: 'normal',
    },
  });

  const emit = defineEmits(['click']);

  const handleClick = (event: MouseEvent) => {
    emit('click', event);
  };
</script>
