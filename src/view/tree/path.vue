<template>
  <div
    class="w-full h-full bg-cream-50 dark:bg-gray-700 overflow-y-auto select-none md:max-w-prose md:mx-auto"
  >
    <div class="p-2">
      <div
        v-for="(folder, _folderIndex) in filteredFolders"
        :key="folder"
        class="mb-2"
      >
        <div
          v-if="getNotesCountInFolder(folder) !== 0"
          @click="toggleFolder(folder)"
          class="flex items-center cursor-pointer p-2 card hover:bg-cream-200 dark:hover:bg-gray-750 rounded"
          :class="{
            'bg-cream-200 dark:bg-gray-750': expandedFolders.includes(folder),
          }"
        >
          <PhCaretRight
            :size="16"
            class="mr-1 transition-transform duration-200"
            :class="{ 'rotate-90': expandedFolders.includes(folder) }"
          />
          <PhFolder :size="16" class="mr-2" />
          <span class="truncate">{{ folder }}</span>
        </div>

        <div v-if="expandedFolders.includes(folder)" class="ml-5 mt-1">
          <div
            v-for="(note, noteIndex) in getNotesInFolder(folder)"
            :key="note.id"
            @click="selectNote(note.id)"
            class="flex items-center cursor-pointer px-2 py-1 mb-1 hover:bg-cream-200 dark:hover:bg-gray-750 rounded"
            :class="{
              'bg-cream-200 dark:bg-gray-700': selectedNoteId === note.id,
            }"
          >
            <span class="mr-2">
              {{
                noteIndex === getNotesInFolder(folder).length - 1
                  ? '└──'
                  : '├──'
              }}
            </span>
            <PhFile :size="16" class="mr-2 flex-shrink-0" />
            <span class="truncate">{{ note.title }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { PhCaretRight, PhFolder, PhFile } from '@phosphor-icons/vue';
  import { folderStore } from '@/store';
  import { Note } from '@/store/notesStore/types';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';

  const props = defineProps<{
    notes: Note[];
    isTrash?: boolean;
  }>();

  const expandedFolders = ref<string[]>([]);
  const selectedNoteId = ref<string | null>(null);

  const filteredNotes = computed(() => {
    return props.isTrash
      ? props.notes.filter((note) => note.time_deleted)
      : props.notes;
  });

  const filteredFolders = computed(() => {
    if (props.isTrash) {
      const foldersWithDeletedNotes = new Set(
        filteredNotes.value.map(
          (note) => note.folder || DEFAULT_FOLDERS.UNCATEGORIZED
        )
      );
      return Array.from(foldersWithDeletedNotes);
    }

    const folders = folderStore.folders.filter(
      (folder) => folder !== DEFAULT_FOLDERS.ALL_NOTES
    );
    const uncategorizedIndex = folders.indexOf(DEFAULT_FOLDERS.UNCATEGORIZED);
    if (uncategorizedIndex !== -1) {
      folders.splice(uncategorizedIndex, 1);
      folders.push(DEFAULT_FOLDERS.UNCATEGORIZED);
    }
    return folders;
  });

  const getNotesCountInFolder = (folder: string): number => {
    return getNotesInFolder(folder).length;
  };

  const toggleFolder = (folder: string) => {
    const index = expandedFolders.value.indexOf(folder);
    if (index === -1) {
      expandedFolders.value.push(folder);
    } else {
      expandedFolders.value.splice(index, 1);
    }
  };

  const emit = defineEmits(['select-note']);

  const selectNote = (noteId: string) => {
    selectedNoteId.value = noteId;
    emit('select-note', noteId);
  };

  const getNotesInFolder = (folder: string): Note[] => {
    if (folder === DEFAULT_FOLDERS.ALL_NOTES) {
      return filteredNotes.value;
    } else if (folder === DEFAULT_FOLDERS.UNCATEGORIZED) {
      return filteredNotes.value.filter(
        (note) => !note.folder || note.folder === DEFAULT_FOLDERS.UNCATEGORIZED
      );
    } else {
      return filteredNotes.value.filter((note) => note.folder === folder);
    }
  };

  watch(
    filteredFolders,
    (newFolders) => {
      expandedFolders.value = [...newFolders];
    },
    { immediate: true }
  );
</script>
