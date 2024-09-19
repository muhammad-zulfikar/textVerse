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
  import { notesStore, folderStore, uiStore } from '@/utils/stores';
  import Toolbar from '@/components/ui/toolbar.vue';
  import NoteList from '@/components/notes/noteList.vue';
  import NoteView from '@/components/notes/noteView.vue';
  import LoadingSpinner from '@/components/ui/loading.vue';
  import { useRoute } from 'vue-router';
  import { createNoteObject } from '@/utils/helpers';

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
      notesStore.openNote(noteId);
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

  const loadNotesAndSetLoading = async () => {
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

  onMounted(async () => {
    await loadNotesAndSetLoading();

    if (route.name === 'Note') {
      const noteId = route.params.id as string;
      openNoteWithDelay(noteId);
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
