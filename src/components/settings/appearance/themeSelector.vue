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
      dropdownId="themeDropdown"
      contentWidth="8rem"
      direction="down"
      position="right"
    >
      <template #label>
        <Button class="text-sm md:text-base px-4 py-2">
          <component :is="currentThemeIcon" :size="20" class="mr-2" />
          {{ currentThemeText }}
          <div
            class="p-1 ml-2 rounded-full hover:bg-cream-300 dark:hover:bg-gray-600 transition-transform duration-200"
            :class="{
              'rotate-180 bg-cream-300 dark:bg-gray-600':
                uiStore.activeDropdown === 'themeDropdown',
            }"
          >
            <PhCaretDown class="size-4" />
          </div>
        </Button>
      </template>
      <DropdownItem
        v-for="(theme, index) in themeOptions"
        :key="index"
        :icon="theme.icon"
        :label="theme.label"
        :itemType="uiStore.theme === theme.type ? 'active' : 'normal'"
        @click="setTheme(theme.type)"
        class="text-sm md:text-base"
      />
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import {
    PhDesktopTower,
    PhSun,
    PhMoon,
    PhCaretDown,
  } from '@phosphor-icons/vue';
  import { uiStore } from '@/store';
  import Button from '@/components/ui/button.vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import { Theme } from '@/store/uiStore/types';

  interface ThemeOption {
    label: string;
    icon: any;
    type: Theme;
  }

  const themeOptions: ThemeOption[] = [
    { label: 'Light', icon: PhSun, type: 'light' },
    { label: 'Dark', icon: PhMoon, type: 'dark' },
    { label: 'System', icon: PhDesktopTower, type: 'system' },
  ];

  const currentThemeText = computed(() => {
    return uiStore.theme.charAt(0).toUpperCase() + uiStore.theme.slice(1);
  });

  const currentThemeIcon = computed(() => {
    const theme = themeOptions.find((option) => option.type === uiStore.theme);
    return theme ? theme.icon : PhDesktopTower;
  });

  const setTheme = (theme: Theme) => {
    uiStore.setTheme(theme);
    uiStore.setActiveDropdown(null);
  };
</script>
