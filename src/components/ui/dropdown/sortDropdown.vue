<template>
  <div class="flex items-center">
    <Dropdown
      dropdownId="sort"
      contentWidth="6.4rem"
      direction="down"
      position="right"
    >
      <template #label>
        <Button class="text-sm">
          <PhFunnel :size="20" />
          <span class="hidden md:flex md:ml-2">Sort</span>
        </Button>
      </template>
      <div class="w-full text-sm px-1 space-y-1">
        <li
          class="w-full text-left cursor-pointer p-2 rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
          :class="{
            'bg-[#ebdfc0] dark:bg-gray-700': notesStore.sortType === 'title',
          }"
          @click="setSortType('title')"
        >
          <PhTextAa :size="20" class="mr-2" />
          Title
        </li>
        <li
          class="w-full text-left cursor-pointer p-2 rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
          :class="{
            'bg-[#ebdfc0] dark:bg-gray-700': notesStore.sortType === 'date',
          }"
          @click="setSortType('date')"
        >
          <PhCalendarBlank :size="20" class="mr-2" />
          Date
        </li>
      </div>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { PhFunnel, PhTextAa, PhCalendarBlank } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import Button from '@/components/ui/button.vue';
  import { notesStore, uiStore } from '@/utils/stores';

  const setSortType = (sortType: 'date' | 'title') => {
    notesStore.setSortType(sortType);
    uiStore.sortType = sortType;
    uiStore.saveSettings();
  };
</script>
