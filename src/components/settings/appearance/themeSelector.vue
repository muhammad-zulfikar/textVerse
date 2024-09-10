<!--themeSelector-->

<template>
  <div class="flex items-center justify-between relative md:mb-2">
    <div class="mr-6">
      <label for="theme" class="text-lg font-semibold mb-1">Theme</label>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Choose how textVerse looks to you.
      </p>
    </div>
    <Dropdown
      label="Theme"
      dropdownId="theme"
      contentWidth="8rem"
      content-margin-left="-0.75rem"
      showArrow="false"
      direction="down"
    >
      <template #label>
        <button
          @click="toggleDropdown"
          :class="[
            'mt-2 md:mt-0 text-sm md:text-base px-4 py-2 flex items-center relative',
            uiStore.blurEnabled ? 'custom-card-blur' : 'custom-card',
          ]"
        >
          <component :is="currentThemeIcon" :size="20" class="mr-2" />
          {{ currentThemeText }}
          <div
            class="p-1 ml-2 rounded-full hover:bg-[#d9c698] dark:hover:bg-gray-600 transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          >
            <PhCaretDown class="size-4" />
          </div>
        </button>
      </template>
      <a
        v-for="theme in themes"
        :key="theme"
        @click="setTheme(theme as 'light' | 'dark' | 'system')"
        class="flex items-center flex-grow flex-shrink mx-1 p-2 hover:bg-[#d9c698] dark:hover:bg-gray-700 text-sm md:text-base rounded-md cursor-pointer"
        role="menuitem"
      >
        <component :is="themeIcon(theme)" :size="20" class="mr-2" />
        {{ theme.charAt(0).toUpperCase() + theme.slice(1) }}
      </a>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
  import {
    PhDesktopTower,
    PhSun,
    PhMoon,
    PhCaretDown,
  } from '@phosphor-icons/vue';
  import { uiStore } from '@/utils/stores';
  import Dropdown from '@/components/ui/dropdown.vue';

  const isOpen = ref(false);
  const themes = ['system', 'dark', 'light'];

  const currentThemeText = computed(
    () => uiStore.theme.charAt(0).toUpperCase() + uiStore.theme.slice(1)
  );

  const currentThemeIcon = computed(() => {
    switch (uiStore.theme) {
      case 'light':
        return PhSun;
      case 'dark':
        return PhMoon;
      default:
        return PhDesktopTower;
    }
  });

  const themeIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return PhSun;
      case 'dark':
        return PhMoon;
      default:
        return PhDesktopTower;
    }
  };

  const setTheme = (theme: 'light' | 'dark' | 'system') => {
    uiStore.setTheme(theme);
    isOpen.value = false;
  };

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('[dropdown-id="theme"]')) {
      isOpen.value = false;
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>
