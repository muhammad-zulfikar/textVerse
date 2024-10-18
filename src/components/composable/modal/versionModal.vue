<!--versionModal.vue-->

<template>
  <Modal :modelValue="isOpen" id="version" transition="sidebar-right">
    <div
      class="flex flex-col fixed inset-y-0 right-0 p-2 md:p-4 overflow-y-auto w-2/3 md:w-1/4 card text-sm"
    >
      <h2 class="text-xl font-bold mb-2 mt-1 md:mt-0 px-1 md:px-0">
        Version History
      </h2>
      <Separator />
      <div class="overflow-y-auto my-4 h-full">
        <div
          v-for="(group, date, _index) in sortedGroupedHistory"
          :key="date"
          class="mb-2"
        >
          <button
            @click="toggleDate(date)"
            class="flex items-center space-x-2 w-full text-left font-semibold p-2 card hover:bg-cream-200 dark:hover:bg-gray-700"
          >
            <div
              class="p-1 rounded-full md:hover:bg-cream-300 md:dark:hover:bg-gray-600 active:bg-cream-300 active:dark:bg-gray-600"
              :class="{ 'dark:bg-gray-600': expandedDates[date] }"
            >
              <PhCaretRight
                :class="{ 'rotate-90': expandedDates[date] }"
                :size="20"
                class="transition-transform duration-200"
              />
            </div>
            <span>
              {{ formatDate(date) }}
            </span>
          </button>
          <div v-if="expandedDates[date]" class="mt-2 space-y-1">
            <button
              v-for="(version, vIndex) in group"
              :key="getVersionKey(version)"
              @click="selectVersion(version)"
              class="flex items-center block w-full text-left py-2 px-4 hover:bg-cream-200 dark:hover:bg-gray-700 rounded-md"
              :class="{
                'bg-cream-200 dark:bg-gray-700': isSelectedVersion(version),
              }"
            >
              <span class="mr-2">
                {{ vIndex === group.length - 1 ? '└── ' : '├── ' }}
              </span>
              <component
                :is="
                  isCurrentVersion(version)
                    ? PhCalendarBlank
                    : PhClockCounterClockwise
                "
                :size="20"
                class="mr-2 flex-shrink-0"
              />
              {{ formatTime(version.timestamp) }}
              <span v-if="isCurrentVersion(version)" class="ml-2 text-blue-500">
                (Current)
              </span>
            </button>
          </div>
        </div>
      </div>
      <div class="flex justify-end space-x-2 md:space-x-4 mt-auto">
        <Button
          @click="handleCancel"
          class="flex items-center px-2 py-1 text-sm"
        >
          <PhProhibit :size="20" class="mr-2" />
          <span>Cancel</span>
        </Button>
        <Button
          @click="handlePreview"
          class="flex items-center px-2 py-1 text-sm"
          :disabled="!selectedVersion"
        >
          <PhEye :size="20" class="mr-2" />
          <span>Preview</span>
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import {
    PhProhibit,
    PhEye,
    PhCaretRight,
    PhClockCounterClockwise,
    PhCalendarBlank,
  } from '@phosphor-icons/vue';
  import Modal from '@/components/ui/modal.vue';
  import Button from '@/components/ui/button.vue';
  import { uiStore, notesStore } from '@/store';
  import { NoteHistory } from '@/store/notesStore/types';
  import Separator from '@/components/ui/separator.vue';

  const isOpen = computed(() => uiStore.activeModal === 'version');
  const selectedNote = computed(() => notesStore.selectedNote);

  const groupedHistory = computed(() => {
    if (!selectedNote.value?.history) return {};

    return selectedNote.value.history.reduce(
      (acc: Record<string, NoteHistory[]>, entry: NoteHistory) => {
        const date = new Date(entry.timestamp).toDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].unshift(entry);
        return acc;
      },
      {}
    );
  });

  const sortedGroupedHistory = computed(() => {
    const sortedDates = Object.keys(groupedHistory.value).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );
    return sortedDates.reduce((acc: Record<string, NoteHistory[]>, date) => {
      acc[date] = groupedHistory.value[date];
      return acc;
    }, {});
  });

  const expandedDates = ref<Record<string, boolean>>({});
  const selectedVersion = ref<NoteHistory | null>(null);

  const getVersionKey = (version: NoteHistory): string => {
    return version.timestamp instanceof Date
      ? version.timestamp.toISOString()
      : version.timestamp;
  };

  const toggleDate = (date: string) => {
    expandedDates.value[date] = !expandedDates.value[date];
  };

  const selectVersion = (version: NoteHistory) => {
    selectedVersion.value = version;
  };

  const isSelectedVersion = (version: NoteHistory) => {
    return selectedVersion.value === version;
  };

  const isCurrentVersion = (version: NoteHistory) => {
    return (
      selectedNote.value?.title === version.title &&
      selectedNote.value?.content === version.content
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const handleCancel = () => {
    if (uiStore.versionOptions?.cancel) {
      uiStore.versionOptions.cancel();
    }
    uiStore.versionOptions = null;
    uiStore.setActiveModal(null);
  };

  const handlePreview = () => {
    if (selectedVersion.value && uiStore.versionOptions?.preview) {
      uiStore.versionOptions.preview(selectedVersion.value);
    }
    uiStore.versionOptions = null;
    uiStore.setActiveModal(null);
  };

  watch(
    () => selectedNote.value?.history,
    () => {
      // This empty watcher will trigger re-computation of groupedHistory and sortedGroupedHistory
    },
    { deep: true }
  );

  watch(isOpen, (newVal) => {
    if (!newVal) {
      expandedDates.value = {};
      selectedVersion.value = null;
    }
  });
</script>
