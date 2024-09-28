<template>
  <div class="flex">
    <Dropdown
      v-if="!isTrash && note.value.history"
      ref="dropdownRef"
      dropdownId="noteHistoryDropdown"
      contentWidth="14rem"
      position="right"
      direction="down"
    >
      <template #label>
        <div
          class="flex items-center px-2 py-1.5 cursor-pointer card hover:bg-cream-200 dark:hover:bg-gray-600"
        >
          <div class="items-center flex mx-2 md:mx-4" title="Last Edited">
            <PhSpinnerGap v-if="isSaving" :size="20" class="animate-spin" />
            <PhCalendarCheck v-else :size="20" />
            <span class="hidden md:flex md:ml-2">
              {{ localeDate(note.value.last_edited) }}
            </span>
          </div>
        </div>
      </template>

      <DropdownItem
        v-for="(historyEntry, index) in note.value.history"
        :key="index"
        @click="openNoteHistory(index)"
        :icon="PhCalendarBlank"
        :label="localeDate(historyEntry.timestamp)"
      />
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { Ref } from 'vue';
  import {
    PhSpinnerGap,
    PhCalendarCheck,
    PhCalendarBlank,
  } from '@phosphor-icons/vue';
  import { Note } from '@/store/notesStore/types';
  import { localeDate } from '@/store/notesStore/helpers';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import { notesStore } from '@/store';

  const props = defineProps<{
    note: Ref<Note>;
    isEditing: boolean;
    isTrash: boolean;
    isSaving: boolean;
  }>();

  const openNoteHistory = (index: number) => {
    if (props.note.value.history && props.note.value.history.length > index) {
      notesStore.currentHistoryIndex = index;
      const historyEntry = props.note.value.history[index];
      props.note.value.title = historyEntry.title;
      props.note.value.content = historyEntry.content;
    } else {
      console.error('Invalid history index or history not available');
    }
  };
</script>
