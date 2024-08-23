<!--home.vue-->

<template>
  <div>
    <NoteList :notes="notesStore.filteredNotes" />
    <NoteView />
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onUnmounted } from 'vue';
  import { notesStore, folderStore, uiStore } from '@/store/stores';
  import NoteList from '@/components/notes/noteList.vue';
  import NoteView from '@/components/notes/noteView.vue';
  import { DEFAULT_FOLDERS } from '@/store/constants';
  import { nanoid } from 'nanoid';

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
    if (!uiStore.isNoteCardOpen && !uiStore.isNoteSidebarOpen) {
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        navigator.clipboard.readText().then(handlePaste);
      }
    }
  };

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });
</script>
