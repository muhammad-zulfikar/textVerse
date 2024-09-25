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
      <DropdownItem
        @click="setSortType('date')"
        :icon="PhCalendarBlank"
        label="Date"
        :itemType="uiStore.sortType === 'date' ? 'active' : 'normal'"
      />
      <DropdownItem
        @click="setSortType('title')"
        :icon="PhTextAa"
        label="Title"
        :itemType="uiStore.sortType === 'title' ? 'active' : 'normal'"
      />
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { PhFunnel, PhTextAa, PhCalendarBlank } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import Button from '@/components/ui/button.vue';
  import { notesStore, uiStore } from '@/store';

  const setSortType = (sortType: 'date' | 'title') => {
    uiStore.setSortType(sortType);
    notesStore.reorderNotes();
  };
</script>
