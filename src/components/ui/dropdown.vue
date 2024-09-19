<template>
  <div class="relative inline-block text-left font-serif" ref="dropdownRef">
    <button
      @click.stop="toggleDropdown"
      :class="{ 'z-50': isOpen }"
      class="outline-none flex items-center relative cursor-pointer"
    >
      <slot name="label"></slot>
    </button>
    <Transition name="zoom">
      <div
        v-if="isOpen"
        :class="[
          'card z-50 absolute dropdown-content',
          `dropdown-${props.direction || 'down'}`,
          `dropdown-${props.position || 'left'}`,
        ]"
        :style="{ width: props.contentWidth || 'auto' }"
      >
        <div class="py-1" role="menu" aria-orientation="vertical">
          <slot></slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { uiStore } from '@/store';

  const props = defineProps<{
    dropdownId: string;
    contentWidth?: string;
    direction?: 'up' | 'down';
    position?: 'left' | 'center' | 'right';
  }>();

  const isOpen = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);

  const toggleDropdown = () => {
    if (isOpen.value) {
      closeDropdown();
    } else {
      uiStore.setActiveDropdown(props.dropdownId);
    }
  };

  const closeDropdown = () => {
    uiStore.setActiveDropdown(null);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      dropdownRef.value &&
      !dropdownRef.value.contains(event.target as Node)
    ) {
      closeDropdown();
    }
  };

  onMounted(() => document.addEventListener('click', handleOutsideClick));
  onUnmounted(() => document.removeEventListener('click', handleOutsideClick));

  watch(
    () => uiStore.activeDropdown,
    (newValue) => {
      isOpen.value = newValue === props.dropdownId;
    }
  );
</script>

<style scoped>
  .dropdown-content {
    transform-origin: top center;
  }

  .dropdown-down {
    top: 100%;
    margin-top: 0.5rem;
  }

  .dropdown-up {
    bottom: 100%;
    margin-bottom: 0.5rem;
  }

  .dropdown-left {
    left: 0;
  }

  .dropdown-center {
    left: 50%;
    transform: translateX(-50%);
  }

  .dropdown-right {
    right: 0;
  }

  .zoom-enter-active,
  .zoom-leave-active {
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  .zoom-enter-from,
  .zoom-leave-to {
    opacity: 0;
    transform: scale(0.95) translateY(0.5rem);
  }

  .dropdown-center.zoom-enter-from,
  .dropdown-center.zoom-leave-to {
    transform: scale(0.95) translate(-50%);
  }

  .dropdown-left.zoom-enter-from,
  .dropdown-left.zoom-leave-to {
    transform: scale(0.95) translate(0%);
  }

  .dropdown-up.dropdown-left.zoom-enter-from,
  .dropdown-up.dropdown-left.zoom-leave-to {
    transform: scale(0.95) translate(0%, 0.5rem);
  }
</style>
