<template>
  <div>
    <NoteModal
      v-if="uiStore.noteViewType === 'modal'"
      :note-id="notesStore.selectedNoteId"
      :is-open="uiStore.isNoteModalOpen"
      :is-trash="props.isTrash"
    />
    <NoteSidebar
      v-if="uiStore.noteViewType === 'sidebar'"
      :note-id="notesStore.selectedNoteId"
      :is-open="uiStore.isNoteSidebarOpen"
      :is-trash="props.isTrash"
    />
  </div>
</template>

<script lang="ts" setup>
  import { defineAsyncComponent } from 'vue';
  import { notesStore, uiStore } from '@/store';

  const props = defineProps<{
    isTrash?: boolean;
  }>();

  const NoteModal = defineAsyncComponent(
    () => import('@/components/notes/noteModal.vue')
  );

  const NoteSidebar = defineAsyncComponent(
    () => import('@/components/notes/noteSidebar.vue')
  );
</script>
