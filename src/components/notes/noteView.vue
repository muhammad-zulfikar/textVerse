<!--noteView-->
<template>
  <div>
    <NoteModal
      v-if="uiStore.noteOpenPreference === 'modal'"
      :note-id="notesStore.selectedNoteId"
      :is-open="uiStore.isNoteModalOpen"
    />
    <NoteSidebar
      v-if="uiStore.noteOpenPreference === 'sidebar'"
      :note-id="notesStore.selectedNoteId"
      :is-open="uiStore.isNoteSidebarOpen"
    />
  </div>
</template>

<script lang="ts" setup>
  import { notesStore, uiStore } from '@/utils/stores';
  import NoteModal from '@/components/notes/noteModal.vue';
  import NoteSidebar from '@/components/notes/noteSidebar.vue';
</script>
