<template>
  <div class="text-sm cursor-pointer relative px-1">
    <span
      class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
      :class="[
        itemType === 'normal' && 'hover:bg-cream-200 dark:hover:bg-gray-700',
        itemType === 'destructive' &&
          'hover:bg-red-700/50 dark:hover:bg-red-800/60',
        itemType === 'active' && 'bg-cream-200 dark:bg-gray-700',
      ]"
    >
      <div @click="handleMainClick" class="flex items-center w-full">
        <component :is="icon" v-if="icon" :size="20" class="size-5 mr-2" />
        <slot name="label">
          {{ label }}
        </slot>
      </div>
      <div
        @click.stop="toggleSubmenu"
        class="absolute right-2 p-1 rounded-full hover:bg-cream-300 dark:hover:bg-gray-600 transition-transform duration-200"
        :class="{
          'rotate-180 bg-cream-300 dark:bg-gray-600': modelValue,
        }"
      >
        <PhCaretRight :size="16" />
      </div>
    </span>
    <Transition name="fade">
      <div
        v-if="modelValue"
        :class="[
          'absolute py-1 space-y-1 min-w-36 whitespace-nowrap card',
          submenuPosition.horizontal === 'right'
            ? 'left-full -ml-1'
            : 'right-full -mr-1',
          submenuPosition.vertical === 'top' ? 'bottom-0 mb-2' : 'top-0 mt-2',
        ]"
      >
        <slot></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, PropType, onMounted, onUnmounted } from 'vue';
  import { PhCaretRight } from '@phosphor-icons/vue';

  const props = defineProps({
    modelValue: Boolean,
    label: String,
    icon: Object as PropType<any>,
    initialPosition: {
      type: String as PropType<'left' | 'right'>,
      default: 'right',
    },
    itemType: {
      type: String as PropType<'normal' | 'destructive' | 'active'>,
      default: 'normal',
    },
    mainClick: {
      type: Function as PropType<(event: MouseEvent) => void>,
      required: false,
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const submenuPosition = ref({
    horizontal: props.initialPosition,
    vertical: 'bottom',
  });

  const toggleSubmenu = (event: MouseEvent) => {
    event.stopPropagation();
    const targetElement = event.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - rect.right;
    const spaceBelow = window.innerHeight - rect.bottom;
    const requiredSpace = 200;

    submenuPosition.value.horizontal =
      spaceOnRight >= requiredSpace ? 'right' : 'left';

    submenuPosition.value.vertical =
      spaceBelow >= requiredSpace ? 'bottom' : 'top';

    emit('update:modelValue', !props.modelValue);
  };

  const handleMainClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (props.mainClick) {
      props.mainClick(event);
    } else {
      toggleSubmenu(event);
    }
  };

  const closeSubmenu = (_event: MouseEvent) => {
    if (props.modelValue) {
      emit('update:modelValue', false);
    }
  };

  onMounted(() => {
    document.addEventListener('click', closeSubmenu);
  });

  onUnmounted(() => {
    document.removeEventListener('click', closeSubmenu);
    emit('update:modelValue', false);
  });
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
