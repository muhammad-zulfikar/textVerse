<template>
  <div>
    <transition name="slide-fade" mode="out-in">
      <NoteList v-if="notesLoaded" :notes="notesStore.filteredNotes" />
      <LoadingSpinner v-else />
    </transition>
    <NoteView />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { notesStore, folderStore, uiStore, authStore } from '@/store/stores';
  import NoteList from '@/components/notes/noteList.vue';
  import NoteView from '@/components/notes/noteView.vue';
  import LoadingSpinner from '@/components/ui/loadingSpinner.vue';
  import { DEFAULT_FOLDERS } from '@/store/constants';
  import { nanoid } from 'nanoid';
  import { useRoute } from 'vue-router';

  const route = useRoute();
  const notesLoaded = ref(false);

  const loadNotes = async () => {
    try {
      if (authStore.isLoggedIn) {
        await notesStore.loadNotesFromFirebase();
      } else {
        await notesStore.loadNotesFromLocalStorage();
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      notesLoaded.value = true;
    }
  };

  const handlePopState = () => {
    if (location.pathname === '/') {
      uiStore.closeNote();
    }
  };

  const openNoteWithDelay = (noteId: string, delay: number = 600) => {
    setTimeout(() => {
      uiStore.openNote(noteId);
    }, delay);
  };

  onMounted(async () => {
    await loadNotes();
    if (route.name === 'Note') {
      const noteId = route.params.id as string;
      openNoteWithDelay(noteId);
    }
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('popstate', handlePopState);
  });

  watch(
    () => route.params.id,
    (newId) => {
      if (newId) {
        openNoteWithDelay(newId as string);
      } else {
        uiStore.closeNote();
      }
    }
  );

  const handlePaste = async (clipboardText: string) => {
    if (clipboardText) {
      const newNote = {
        id: nanoid(),
        title: 'Untitled',
        content: clipboardText,
        time_created: new Date().toISOString(),
        last_edited: new Date().toISOString(),
        pinned: false,
        folder:
          folderStore.currentFolder !== DEFAULT_FOLDERS.ALL_NOTES
            ? folderStore.currentFolder
            : DEFAULT_FOLDERS.UNCATEGORIZED,
      };

      try {
        await notesStore.addNote(newNote);
        uiStore.showToastMessage('New note created from clipboard');
      } catch (error) {
        console.error('Error creating note:', error);
        uiStore.showToastMessage('Failed to create note from clipboard');
      }
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!uiStore.isNoteModalOpen && !uiStore.isNoteSidebarOpen) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        navigator.clipboard.readText().then(handlePaste);
      }
    }
  };
</script>

<style scoped>
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
</style>
