<template>
  <thead>
    <tr class="bg-cream-200 dark:bg-gray-800">
      <th
        v-if="isSelectMode"
        class="p-3 text-left w-10 border-b-[1px] border-r-[1px] border-black dark:border-white"
      >
        <input
          type="checkbox"
          :checked="allSelected"
          @change="$emit('toggle-select-all')"
          class="cursor-pointer"
        />
      </th>
      <th
        v-for="column in visibleColumns"
        :key="column"
        :class="{ 'hidden md:table-cell': column === 'Content' }"
        class="p-3 text-left border-b-[1px] border-r-[1px] border-black dark:border-white whitespace-nowrap"
      >
        <div class="flex items-center">
          <component :is="getColumnIcon(column)" :size="20" class="mr-2" />
          <span>{{ column }}</span>
        </div>
      </th>
    </tr>
  </thead>
</template>

<script setup lang="ts">
  import {
    PhTextT,
    PhArticle,
    PhFolder,
    PhCalendar,
  } from '@phosphor-icons/vue';

  defineProps<{
    visibleColumns: string[];
    isSelectMode: boolean;
    allSelected: boolean;
  }>();

  defineEmits<{
    (e: 'toggle-select-all'): void;
  }>();

  const getColumnIcon = (column: string) => {
    switch (column) {
      case 'Title':
        return PhTextT;
      case 'Content':
        return PhArticle;
      case 'Folder':
        return PhFolder;
      case 'Date':
        return PhCalendar;
      default:
        return null;
    }
  };
</script>

<style scoped>
  table th:first-child,
  table td:first-child {
    border-left: 0;
  }

  table th:last-child,
  table td:last-child {
    border-right: 0;
  }
</style>
