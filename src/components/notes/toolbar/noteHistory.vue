<!--noteHistory-->

<template>
  <div class="flex">
    <Dropdown
      ref="dropdownRef"
      dropdownId="noteHistoryDropdown"
      contentWidth="9rem"
      position="right"
      direction="down"
      class="max-h-64"
    >
      <template #label>
        <div
          class="flex items-center px-2 py-1.5 cursor-pointer card hover:bg-cream-200 dark:hover:bg-gray-600"
        >
          <div class="items-center flex" title="Note History">
            <PhSpinnerGap v-if="isSaving" :size="20" class="animate-spin" />
            <PhCalendarCheck v-else-if="isLatestVersion" :size="20" />
            <PhClockCounterClockwise v-else :size="20" />
            <span class="hidden md:flex md:ml-2">
              {{ localeDate(currentHistoryEntry.timestamp) }}
            </span>
          </div>
        </div>
      </template>

      <DropdownItem
        v-if="!note.value.history || note.value.history.length === 0"
        @click="openNoteHistory(-1)"
        :icon="PhCalendarCheck"
        :label="localeDate(note.value.last_edited)"
        :itemType="isLatestVersion ? 'active' : 'normal'"
      />
      <template v-else>
        <DropdownItem
          v-for="(historyEntry, index) in reversedHistory"
          :key="index"
          @click="openNoteHistory(note.value.history.length - 1 - index)"
          :icon="index === 0 ? PhCalendarCheck : PhClockCounterClockwise"
          :label="localeDate(historyEntry.timestamp)"
          :itemType="
            currentHistoryIndex === note.value.history.length - 1 - index ||
            (currentHistoryIndex === null && index === 0)
              ? 'active'
              : 'normal'
          "
        />
      </template>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { Ref, computed, onMounted } from 'vue';
  import {
    PhSpinnerGap,
    PhCalendarCheck,
    PhClockCounterClockwise,
  } from '@phosphor-icons/vue';
  import { Note } from '@/store/notesStore/types';
  import { localeDate } from '@/store/notesStore/helpers';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import { notesStore, uiStore } from '@/store';

  const props = defineProps<{
    note: Ref<Note>;
    isSaving: boolean;
  }>();

  const currentHistoryIndex = computed(() => notesStore.currentHistoryIndex);

  const isLatestVersion = computed(() => {
    return (
      currentHistoryIndex.value === null ||
      (props.note.value.history &&
        currentHistoryIndex.value === props.note.value.history.length - 1)
    );
  });

  const currentHistoryEntry = computed(() => {
    if (currentHistoryIndex.value === null || !props.note.value.history) {
      return { timestamp: props.note.value.last_edited };
    }
    return props.note.value.history[currentHistoryIndex.value];
  });

  const reversedHistory = computed(() => {
    if (!props.note.value.history) return [];
    return [...props.note.value.history].reverse();
  });

  function openNoteHistory(index: number) {
    notesStore.currentHistoryIndex = index;
    if (index === -1 || !props.note.value.history) {
      props.note.value.title = props.note.value.title;
      props.note.value.content = props.note.value.content;
      props.note.value.last_edited = props.note.value.last_edited;
    } else if (
      props.note.value.history &&
      index < props.note.value.history.length
    ) {
      const historyEntry = props.note.value.history[index];
      props.note.value.title = historyEntry.title;
      props.note.value.content = historyEntry.content;
      props.note.value.last_edited = historyEntry.timestamp;
    } else {
      uiStore.showToastMessage('History not available');
    }
  }

  onMounted(() => {
    if (props.note.value.history && props.note.value.history.length > 0) {
      notesStore.currentHistoryIndex = props.note.value.history.length - 1;
    } else {
      notesStore.currentHistoryIndex = null;
    }
  });
</script>
