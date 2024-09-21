<template>
  <div class="relative">
    <Transition name="fade" mode="out-in">
      <div
        v-if="!notesStore.notesLoaded || uiStore.isSyncing"
        class="absolute inset-0 z-10 flex items-center justify-center"
      >
        <LoadingSpinner />
      </div>
    </Transition>
    <Transition name="fade" mode="out-in">
      <div :class="{ 'opacity-0': uiStore.isSyncing }">
        <Toolbar />
        <NoteList :notes="filteredNotes" />
      </div>
    </Transition>
    <NoteView />
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onUnmounted, watch, computed } from 'vue';
  import { notesStore, folderStore, uiStore } from '@/store';
  import Toolbar from '@/components/ui/toolbar.vue';
  import NoteList from '@/components/notes/noteList.vue';
  import NoteView from '@/components/notes/noteView.vue';
  import LoadingSpinner from '@/components/ui/loading.vue';
  import { useRoute } from 'vue-router';
  import { createNoteObject } from '@/store/notesStore/helpers';

  const route = useRoute();

  const filteredNotes = computed(() =>
    notesStore.filteredNotes(folderStore.currentFolder)
  );

  const handlePopState = () => {
    if (location.pathname === '/') {
      notesStore.closeNote();
    }
  };

  const openNoteWithDelay = (noteId: string, delay: number = 600) => {
    setTimeout(() => {
      const noteExists = notesStore.notes.some((note) => note.id === noteId);
      if (noteExists) {
        notesStore.openNote(noteId);
      } else {
        uiStore.showToastMessage('Note not found');
        notesStore.closeNote();
      }
    }, delay);
  };

  watch(
    () => route.params.id,
    (newId) => {
      if (newId) {
        openNoteWithDelay(newId as string);
      } else {
        notesStore.closeNote();
      }
    }
  );

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        const newNote = createNoteObject({
          title: 'Untitled',
          content: clipboardText,
          folder: folderStore.currentFolder,
        });

        await notesStore.createNote(newNote);
        uiStore.showToastMessage('New note created from clipboard');
      } else {
        uiStore.showToastMessage('Clipboard is empty');
      }
    } catch (error) {
      console.error('Error creating note from clipboard:', error);
      uiStore.showToastMessage('Failed to create note from clipboard');
    }
  };

  const handleKeyDown = async (event: KeyboardEvent) => {
    if (!uiStore.isNoteModalOpen && !uiStore.isNoteSidebarOpen) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        event.preventDefault();
        await handlePaste();
      }
    }
  };

  const loadNotes = async () => {
    try {
      await notesStore.loadNotes();
    } catch (error) {
      console.error('Error loading notes:', error);
      uiStore.showToastMessage('Failed to load notes');
    }
  };

  const setupEventListeners = () => {
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
  };

  const removeEventListeners = () => {
    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('popstate', handlePopState);
  };

  const loadNoteById = async (noteId: string) => {
    if (!notesStore.notesLoaded) {
      await loadNotes();
    }

    const note = notesStore.notes.find((n) => n.id === noteId);
    if (note) {
      notesStore.openNote(noteId);
    } else {
      console.log('Note not found:', noteId);
      uiStore.showToastMessage('Note not found');
      notesStore.closeNote();
    }
  };

  onMounted(async () => {
    if (!notesStore.notesLoaded) {
      await loadNotes();
    }

    if (route.name === 'Note' && route.params.id) {
      await loadNoteById(route.params.id as string);
    }

    setupEventListeners();
  });

  onUnmounted(removeEventListeners);
</script>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
