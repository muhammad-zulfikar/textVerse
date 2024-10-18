<template>
  <div class="flex items-center w-full text-sm">
    <div class="max-w-[calc(100%-3rem)]">
      <NoteTitle :note="note" @edit-title="editTitle" @save-title="saveTitle" />
    </div>
    <div class="ml-auto">
      <NoteActions
        :note="note"
        :is-editing="isEditing"
        :is-saving="isSaving"
        :is-viewing-history="isViewingHistory"
        @previewVersion="emitPreviewVersion"
        @applyVersion="emitApplyVersion"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Ref } from 'vue';
  import { Note, NoteHistory } from '@/store/notesStore/types';
  import { useNoteTitle } from '@/utils/useNoteTitle';
  import NoteTitle from './toolbar/noteTitle.vue';
  import NoteActions from './toolbar/noteActions.vue';

  const props = defineProps<{
    note: Ref<Note>;
    isEditing: boolean;
    hasChanges: boolean;
    isSaving: boolean;
    isViewingHistory: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'previewVersion', version: NoteHistory): void;
    (e: 'applyVersion'): void;
  }>();

  const { editTitle, saveTitle } = useNoteTitle(props.note);

  const emitPreviewVersion = (version: NoteHistory) => {
    emit('previewVersion', version);
  };

  const emitApplyVersion = () => {
    emit('applyVersion');
  };
</script>
