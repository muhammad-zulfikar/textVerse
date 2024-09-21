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
          class="w-full text-left cursor-pointer p-2 rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
          :class="{
            'bg-cream-200 dark:bg-gray-700': uiStore.sortType === 'date',
          }"
          @click="setSortType('date')"
        >
          <PhCalendarBlank :size="20" class="mr-2" />
          Date
        </li>
        <li
          class="w-full text-left cursor-pointer p-2 rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
          :class="{
            'bg-cream-200 dark:bg-gray-700': uiStore.sortType === 'title',
          }"
          @click="setSortType('title')"
        >
          <PhTextAa :size="20" class="mr-2" />
          Title
        </li>
      </div>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { PhFunnel, PhTextAa, PhCalendarBlank } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import Button from '@/components/ui/button.vue';
  import { notesStore, uiStore } from '@/store';

  const setSortType = (sortType: 'date' | 'title') => {
    uiStore.setSortType(sortType);
    notesStore.reorderNotes();
  };
</script>
