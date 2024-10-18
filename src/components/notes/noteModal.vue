<!--noteModal.vue-->

<template>
  <Modal :modelValue="props.isOpen" id="noteModal" @close="handleClose">
    <div :class="modalClasses">
      <div class="flex w-full pt-2 md:pt-4 select-none">
        <NoteToolbar
          v-bind="toolbarProps"
          @previewVersion="previewVersion"
          @applyVersion="applyVersion"
        />
      </div>
      <div
        class="w-full bg-transparent pt-2 md:pt-4 md:pb-2 flex-grow overflow-y-auto flex flex-col"
      >
        <TextEditor
          v-model="editedNote.content"
          @update:modelValue="updateNoteContent"
          :showToolbar="!props.isTrash && !isViewingHistory"
          :editable="!props.isTrash && !isViewingHistory"
          class="h-full flex-grow overflow-y-auto"
        />
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onUnmounted, nextTick, onMounted } from 'vue';
  import { Note, NoteHistory } from '@/store/notesStore/types';
  import { notesStore, uiStore, authStore } from '@/store';
  import {
    hasChanged,
    setupNoteListener,
    debouncedSaveNote,
    createEmptyNote,
    handleNoteClose,
  } from '@/store/notesStore/helpers';
  import Modal from '@/components/ui/modal.vue';
  import NoteToolbar from './noteToolbar.vue';
  import TextEditor from '@/components/textEditor/textEditor.vue';

  const props = defineProps<{
    noteId: string | null;
    isOpen: boolean;
    isTrash?: boolean;
  }>();

  const isMobile = ref(window.innerWidth <= 768);
  const isEditing = ref(false);
  const isSaving = ref(false);
  const editedNote = ref<Note>(createEmptyNote());
  const initialNote = ref<Note | null>(null);
  const isNewNote = ref(false);
  const isViewingHistory = ref(false);

  const modalClasses = computed(() => [
    'flex flex-col relative px-2 md:px-4',
    {
      'card-fullscreen w-full h-full': uiStore.isExpanded,
      'card w-11/12 md:w-3/5 h-[calc(100%-3rem)]': !uiStore.isExpanded,
    },
  ]);

  const noteArray = computed(() =>
    props.isTrash ? notesStore.deletedNotes : notesStore.notes
  );

  const toolbarProps = computed(() => ({
    note: editedNote,
    isEditing: isEditing.value,
    hasChanges: hasChanges.value,
    isSaving: isSaving.value,
    isViewingHistory: isViewingHistory.value,
  }));

  const hasChanges = computed(() =>
    initialNote.value ? hasChanged(initialNote.value, editedNote.value) : false
  );

  function updateNoteContent(newContent: string) {
    editedNote.value.content = newContent;
    debouncedSaveNote(editedNote, isNewNote, isSaving, props.isTrash);
  }

  const currentNoteVersion = ref<Note | null>(null);

  function previewVersion(version: NoteHistory) {
    if (!isViewingHistory.value) {
      currentNoteVersion.value = { ...editedNote.value };
    }
    editedNote.value.title = version.title;
    editedNote.value.content = version.content;
    isViewingHistory.value = true;
  }

  function applyVersion() {
    if (isViewingHistory.value && props.noteId) {
      const noteHistory: NoteHistory = {
        timestamp: new Date().toISOString(),
        title: editedNote.value.title,
        content: editedNote.value.content,
      };
      notesStore.applyNoteVersion(props.noteId, noteHistory);
      initialNote.value = { ...editedNote.value };
      isViewingHistory.value = false;
      currentNoteVersion.value = null;
      debouncedSaveNote(editedNote, isNewNote, isSaving, props.isTrash);
    }
  }

  async function handleClose() {
    if (isViewingHistory.value && currentNoteVersion.value) {
      editedNote.value = { ...currentNoteVersion.value };
      isViewingHistory.value = false;
      currentNoteVersion.value = null;
    } else {
      await handleNoteClose(editedNote, isNewNote, props.isTrash, initialNote);
    }
    notesStore.closeNote();
  }

  watch(
    [() => props.isOpen, () => props.noteId, () => props.isTrash],
    async ([isOpen, newNoteId, isTrash]) => {
      if (isOpen) {
        if (isMobile.value) {
          uiStore.isExpanded = true;
        }
        await nextTick();
        if (newNoteId !== null) {
          const note = noteArray.value.find((n) => n.id === newNoteId);
          if (note) {
            editedNote.value = { ...note };
            initialNote.value = { ...note };
            // setupNoteListener(
            //   newNoteId,
            //   editedNote,
            //   initialNote,
            //   authStore.user?.uid
            // );
            isEditing.value = !isTrash;
            isNewNote.value = false;
          }
        } else {
          editedNote.value = createEmptyNote();
          initialNote.value = null;
          isEditing.value = false;
          isNewNote.value = true;
        }
        isViewingHistory.value = false;
      }
    },
    { immediate: true }
  );

  watch(
    () => editedNote.value.title,
    (newTitle) => {
      if (initialNote.value) {
        initialNote.value.title = newTitle;
      }
    }
  );

  watch(isViewingHistory, (newValue) => {
    if (newValue) {
      isEditing.value = false;
    } else {
      isEditing.value = !props.isTrash;
    }
  });

  const handleResize = () => {
    isMobile.value = window.innerWidth <= 768;
    if (isMobile.value && props.isOpen) {
      uiStore.isExpanded = true;
    }
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  defineExpose({
    previewVersion,
    applyVersion,
  });
</script>
