<template>
  <div class="trashContainer">
    <div v-if="!notesStore.deletedNotesLoaded">
      <LoadingSpinner />
    </div>
    <div v-else>
      <Toolbar @openEmptyTrashAlert="openEmptyTrashAlert" />
      <NoteList :notes="filteredDeletedNotes" :isTrash="true" />
      <NoteView :isTrash="true" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, onUnmounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { notesStore, uiStore } from '@/store';
  import Toolbar from '@/components/ui/toolbar.vue';
  import NoteView from '@/components/notes/noteView.vue';
  import LoadingSpinner from '@/components/ui/loading.vue';
  import NoteList from '@/components/notes/noteList.vue';

  const route = useRoute();
  const router = useRouter();

  const filteredDeletedNotes = computed(() => notesStore.filteredDeletedNotes);

  const openEmptyTrashAlert = () => {
    uiStore.openAlertModal({
      message: `Are you sure you want to empty the trash?`,
      confirm: async () => {
        try {
          await notesStore.emptyTrash();
          uiStore.showToastMessage('Trash emptied successfully');
        } catch (error) {
          console.error('Error emptying trash:', error);
          uiStore.showToastMessage('Failed to empty trash. Please try again.');
        }
      },
      cancel: () => {
        uiStore.setActiveModal(null);
      },
    });
  };

  const handlePopState = () => {
    if (location.pathname === '/trash') {
      notesStore.closeNote();
    }
  };

  const loadDeletedNoteById = async (noteId: string, delay: number = 1200) => {
    const note = notesStore.deletedNotes.find((n) => n.id === noteId);
    if (note) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      notesStore.openNote(noteId, true);
    } else {
      uiStore.showToastMessage('Note not found');
      notesStore.closeNote();
      router.push('/trash');
    }
  };

  watch(
    () => route.params.id,
    async (newId) => {
      if (newId) {
        await loadDeletedNoteById(newId as string);
      } else {
        notesStore.closeNote();
      }
    }
  );

  onMounted(async () => {
    if (!notesStore.deletedNotesLoaded) {
      await notesStore.loadNotes();
    }

    if (route.params.id) {
      await loadDeletedNoteById(route.params.id as string);
    }

    window.addEventListener('popstate', handlePopState);
  });

  onUnmounted(() => {
    window.removeEventListener('popstate', handlePopState);
  });
</script>
