<template>
  <div>
    <transition name="slide-fade" mode="out-in">
      <NoteList v-if="!isLoading" :notes="notesStore.filteredNotes" />
      <LoadingSpinner v-else />
    </transition>
    <NoteView />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { notesStore, folderStore, uiStore } from '@/store/stores';
  import NoteList from '@/components/notes/noteList.vue';
  import NoteView from '@/components/notes/noteView.vue';
  import LoadingSpinner from '@/components/ui/loadingSpinner.vue';
  import { DEFAULT_FOLDERS } from '@/store/constants';
  import { nanoid } from 'nanoid';

  const isLoading = ref(true);

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

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
    setTimeout(() => {
      isLoading.value = false;
    }, 100);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });
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
