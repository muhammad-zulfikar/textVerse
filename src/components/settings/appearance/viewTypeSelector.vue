<template>
  <div class="flex items-center justify-between relative md:mb-2">
    <div class="mr-6">
      <label for="viewType" class="text-lg font-semibold mb-1">View Type</label>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Choose how your notes are displayed.
      </p>
    </div>
    <Dropdown
      label="ViewType"
      dropdownId="viewType"
      contentWidth="8rem"
      direction="down"
      position="right"
    >
      <template #label>
        <Button class="text-sm md:text-base px-4 py-2">
          <component :is="currentViewTypeIcon" :size="20" class="mr-2" />
          {{ currentViewTypeText }}
          <div
            class="p-1 ml-2 rounded-full hover:bg-cream-300 dark:hover:bg-gray-600 transition-transform duration-200"
            :class="{
              'rotate-180 bg-cream-300 dark:bg-gray-600':
                uiStore.activeDropdown === 'viewType',
            }"
          >
            <PhCaretDown class="size-4" />
          </div>
        </Button>
      </template>
      <DropdownItem
        v-for="(view, index) in viewOptions"
        :key="index"
        :label="view.label"
        :icon="view.icon"
        :itemType="uiStore.viewType === view.type ? 'active' : 'normal'"
        @click="setViewType(view.type)"
        class="text-sm md:text-base"
      />
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import {
    PhSquaresFour,
    PhTable,
    PhCaretDown,
    PhTreeView,
  } from '@phosphor-icons/vue';
  import { uiStore } from '@/store';
  import Button from '@/components/ui/button.vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import type { ViewType } from '@/store/uiStore/types';

  interface ViewOption {
    label: string;
    icon: any;
    type: ViewType;
  }

  const viewOptions: ViewOption[] = [
    { label: 'Card', icon: PhSquaresFour, type: 'card' },
    { label: 'Table', icon: PhTable, type: 'table' },
    { label: 'Tree', icon: PhTreeView, type: 'tree' },
  ];

  const currentViewTypeText = computed(() => {
    return uiStore.viewType.charAt(0).toUpperCase() + uiStore.viewType.slice(1);
  });

  const currentViewTypeIcon = computed(() => {
    switch (uiStore.viewType) {
      case 'card':
        return PhSquaresFour;
      case 'table':
        return PhTable;
      case 'tree':
        return PhTreeView;
      default:
        return PhSquaresFour;
    }
  });

  const isMobile = ref(window.innerWidth < 640);

  const setViewType = (type: ViewType) => {
    uiStore.setViewType(type);
    if (type !== 'card') {
      uiStore.setColumns(isMobile.value ? 1 : 4);
    }
    uiStore.showToastMessage('View type updated');
    uiStore.setActiveDropdown(null);
  };
</script>
