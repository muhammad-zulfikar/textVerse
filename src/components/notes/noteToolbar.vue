<template>
  <div class="flex justify-between items-center w-full text-sm">
    <NoteTitle
      :note="note"
      :is-trash="isTrash"
      @edit-title="editTitle"
      @save-title="saveTitle"
    />
    <NoteActions
      :note="note"
      :is-editing="isEditing"
      :is-trash="isTrash"
      :is-saving="isSaving"
    />
  </div>
</template>

<script setup lang="ts">
  import { Ref, onMounted, onUnmounted } from 'vue';
  import { Note } from '@/store/notesStore/types';
  import { useNoteTitle } from '@/utils/useNoteTitle';
  import NoteTitle from './toolbar/noteTitle.vue';
  import NoteActions from './toolbar/noteActions.vue';

  const props = defineProps<{
    note: Ref<Note>;
    isEditing: boolean;
    hasChanges: boolean;
    isSaving: boolean;
    isTrash: boolean;
  }>();

  const { updateTitleWidth, editTitle, saveTitle } = useNoteTitle(props.note);

  onMounted(() => {
    updateTitleWidth();
    window.addEventListener('resize', updateTitleWidth);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateTitleWidth);
  });
</script>
