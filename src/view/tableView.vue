<template>
  <div
    class="max-w-5xl mx-auto px-2 md:px-0 text-sm md:text-base mt-4 md:mt-0 select-none"
  >
    <div class="overflow-x-auto md:px-4 xl:px-0">
      <table
        class="min-w-[800px] w-full border-separate border-spacing-0 font-serif rounded-lg overflow-hidden"
      >
        <TableHeader
          :visible-columns="visibleColumns"
          :is-select-mode="uiStore.isSelectMode"
          :all-selected="allSelected"
          @toggle-select-all="toggleSelectAll"
        />
        <TableBody
          :notes="paginatedNotes"
          :visible-columns="visibleColumns"
          :is-select-mode="uiStore.isSelectMode"
          @toggle-note-selection="toggleNoteSelection"
          @open-note="notesStore.openNote"
          @set-current-folder="folderStore.setCurrentFolder"
        />
      </table>
    </div>
    <div class="mt-4">
      <Pagination
        v-model:currentPage="currentPage"
        v-model:rowsPerPage="rowsPerPage"
        :totalPages="totalPages"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { Note } from '@/store/notesStore/types';
  import { uiStore, notesStore, folderStore } from '@/store';
  import TableHeader from './table/tableHeader.vue';
  import TableBody from './table/tableBody.vue';
  import Pagination from './table/pagination.vue';

  const props = defineProps<{
    notes: Note[];
  }>();

  const availableColumns = ['Title', 'Content', 'Folder', 'Date'];
  const visibleColumns = ref(availableColumns);
  const rowsPerPage = ref(10);
  const currentPage = ref(1);

  const sortedNotes = computed(() => {
    return [...props.notes].sort((a: Note, b: Note) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (uiStore.sortType === 'date') {
        const dateA = new Date(a.last_edited).getTime();
        const dateB = new Date(b.last_edited).getTime();
        return dateB - dateA;
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  });

  const totalPages = computed(() =>
    Math.ceil(sortedNotes.value.length / rowsPerPage.value)
  );

  const paginatedNotes = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value;
    const end = start + rowsPerPage.value;
    return sortedNotes.value.slice(start, end);
  });

  const allSelected = computed(() => {
    return (
      paginatedNotes.value.length > 0 &&
      notesStore.selectedNotes.length === paginatedNotes.value.length
    );
  });

  const toggleSelectAll = () => {
    if (allSelected.value) {
      notesStore.clearSelectedNotes();
    } else {
      paginatedNotes.value.forEach((note) => {
        notesStore.toggleNoteSelection(note.id);
      });
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    notesStore.toggleNoteSelection(noteId);
    updateSelectMode();
  };

  const updateSelectMode = () => {
    uiStore.isSelectMode = notesStore.selectedNotes.length > 0;
  };

  watch(
    () => uiStore.isSelectMode,
    (newValue) => {
      if (!newValue) {
        notesStore.clearSelectedNotes();
      }
    }
  );

  watch(
    () => props.notes,
    () => {
      notesStore.clearSelectedNotes();
      currentPage.value = 1;
    },
    { deep: true }
  );

  watch(() => notesStore.selectedNotes, updateSelectMode);
</script>

<style scoped>
  .overflow-x-auto {
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table {
    border: 1px solid black;
    min-width: 100%;
  }

  .dark table {
    border-color: white;
  }

  @media (max-width: 767px) {
    .hidden-mobile {
      display: none;
    }
  }
</style>
