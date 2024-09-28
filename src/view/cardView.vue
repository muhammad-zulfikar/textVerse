<template>
  <div class="px-1 md:px-3">
    <div
      ref="masonryGrid"
      class="masonry-grid"
      :style="{
        '--columns': uiStore.columns,
      }"
    >
      <div
        @before-leave="handleBeforeLeave"
        @after-leave="updateMasonryLayout"
        @enter="setItemPosition"
        @after-enter="unsetItemPosition"
      >
        <NoteCard
          v-for="note in sortedNotes"
          :key="note.id"
          :note="note"
          :is-selected="isNoteSelected(note)"
          :data-index="sortedNotes.indexOf(note)"
          @click="handleNoteClick"
          @contextmenu="(event) => showContextMenu(event, note)"
        />
      </div>
    </div>
    <ContextMenu
      v-if="selectedNote"
      :visible="showMenu"
      :position="menuPosition"
      :note="selectedNote"
      @hideMenu="hideContextMenu"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
  import { useRoute } from 'vue-router';
  import { notesStore, uiStore } from '@/store';
  import { Note } from '@/store/notesStore/types';
  import ContextMenu from '@/components/contextMenu/contextMenu.vue';
  import NoteCard from './card/noteCard.vue';
  import { useContextMenu } from '@/utils/useContextMenu';
  import { useMasonryLayout } from '@/utils/useMasonryLayout';

  const props = defineProps<{
    notes: Note[];
  }>();

  const route = useRoute();
  const isTrashView = computed(() => route.path.startsWith('/trash'));

  const {
    masonryGrid,
    setItemPosition,
    unsetItemPosition,
    handleBeforeLeave,
    updateMasonryLayout,
    debouncedUpdateLayout,
  } = useMasonryLayout(computed(() => uiStore.columns));

  const {
    showMenu,
    menuPosition,
    selectedNote,
    showContextMenu,
    hideContextMenu,
  } = useContextMenu();

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

  const isNoteSelected = (note: Note): boolean => {
    return (
      notesStore.selectedNotes.includes(note.id) ||
      (showMenu.value &&
        selectedNote.value !== null &&
        selectedNote.value.id === note.id)
    );
  };

  const handleNoteClick = (note: Note) => {
    if (uiStore.isSelectMode) {
      notesStore.toggleNoteSelection(note.id);
    } else {
      notesStore.openNote(note.id, isTrashView.value);
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    const clickedElement = event.target as HTMLElement;
    if (
      !clickedElement.closest('.notes') &&
      !clickedElement.closest('.select-button')
    ) {
      uiStore.isSelectMode = false;
      notesStore.clearSelectedNotes();
    }
  };

  const handleResize = () => {
    uiStore.handleResize();
    debouncedUpdateLayout();
  };

  watch(
    () => uiStore.isSelectMode,
    (newValue) => {
      if (!newValue) notesStore.clearSelectedNotes();
    }
  );

  watch(
    [sortedNotes, () => props.notes.length, () => uiStore.columns],
    () => {
      nextTick(() => {
        debouncedUpdateLayout();
      });
    },
    { deep: true }
  );

  onMounted(() => {
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('resize', handleResize);
    handleResize();
    nextTick(() => {
      updateMasonryLayout();
    });
  });

  onUnmounted(() => {
    window.removeEventListener('click', handleOutsideClick);
    window.removeEventListener('resize', handleResize);
  });
</script>

<style scoped>
  .masonry-grid {
    position: relative;
    width: 100%;
  }

  .masonry-wrapper {
    position: relative;
    width: 100%;
  }
</style>
