<template>
  <TransitionGroup name="list" tag="tbody">
    <tr
      v-for="note in notes"
      :key="note.id"
      class="bg-cream-100 dark:bg-gray-750"
    >
      <SelectCell
        v-if="isSelectMode"
        :note-id="note.id"
        @toggle-selection="$emit('toggle-note-selection', $event)"
      />
      <TitleCell
        v-if="visibleColumns.includes('Title')"
        :note="note"
        :is-selected="isNoteSelected(note)"
        @open-note="$emit('open-note', $event)"
        @contextmenu.prevent="
          (event: MouseEvent) => showContextMenu(event, note)
        "
      />
      <ContentCell
        v-if="visibleColumns.includes('Content') && !isMobile"
        :content="note.content"
      />
      <FolderCell
        v-if="visibleColumns.includes('Folder')"
        :folder="note.folder"
        @set-current-folder="$emit('set-current-folder', $event)"
      />
      <DateCell
        v-if="visibleColumns.includes('Date')"
        :last-edited="note.last_edited"
      />
    </tr>
  </TransitionGroup>
  <ContextMenu
    v-if="selectedNote"
    :visible="showMenu"
    :position="menuPosition"
    :note="selectedNote"
    @hideMenu="hideContextMenu"
  />
</template>

<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import { Note } from '@/store/notesStore/types';
  import { notesStore } from '@/store';
  import SelectCell from './cell/selectCell.vue';
  import TitleCell from './cell/titleCell.vue';
  import ContentCell from './cell/contentCell.vue';
  import FolderCell from './cell/folderCell.vue';
  import DateCell from './cell/dateCell.vue';
  import ContextMenu from '@/components/contextMenu/contextMenu.vue';
  import { useContextMenu } from '@/utils/useContextMenu';

  defineProps<{
    notes: Note[];
    visibleColumns: string[];
    isSelectMode: boolean;
  }>();

  defineEmits<{
    (e: 'toggle-note-selection', noteId: string): void;
    (e: 'open-note', noteId: string): void;
    (e: 'set-current-folder', folder: string): void;
  }>();

  const {
    showMenu,
    menuPosition,
    selectedNote,
    showContextMenu,
    hideContextMenu,
  } = useContextMenu();

  const isNoteSelected = (note: Note): boolean => {
    return (
      notesStore.selectedNotes.includes(note.id) ||
      (showMenu.value &&
        selectedNote.value !== null &&
        selectedNote.value.id === note.id)
    );
  };

  const isMobile = ref(window.innerWidth < 768);

  const handleResize = () => {
    isMobile.value = window.innerWidth < 768;
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
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

  table tr:first-child th {
    border-top: 0;
  }

  table tr:last-child td {
    border-bottom: 0;
  }

  table tr:first-child th {
    border-top: 0;
  }

  table tr:last-child td {
    border-bottom: 0;
  }
</style>
