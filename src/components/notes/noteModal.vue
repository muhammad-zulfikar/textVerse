<!--noteModal.vue-->

<template>
  <Modal :modelValue="props.isOpen" id="noteModal" @close="handleClose">
    <div :class="modalClasses">
      <div class="flex w-full pt-2 md:pt-4 select-none">
        <NoteToolbar
          v-bind="toolbarProps"
          @previewVersion="previewVersion"
          @applyVersion="applyVersion"
          @save="saveVersion"
          @exitHistory="exitHistory"
        />
      </div>
      <div
        class="w-full bg-transparent pt-2 md:pt-4 md:pb-2 flex-grow overflow-y-auto flex flex-col"
      >
        <TextEditor
          v-model="editedNote"
          :showToolbar="!isTrashRoute && !isHistory"
          :editable="!isTrashRoute && !isHistory"
          :isNewNote="isNewNote"
          class="h-full flex-grow overflow-y-auto"
        />
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
  import { Note, NoteHistory } from '@/store/notesStore/types';
  import { notesStore, uiStore } from '@/store';
  import Modal from '@/components/ui/modal.vue';
  import NoteToolbar from './noteToolbar.vue';
  import TextEditor from '@/components/textEditor/textEditor.vue';
  import { hasChanges, createEmptyNote } from '@/store/notesStore/helpers';
  import { useCurrentRoute } from '@/utils/useCurrentRoute';

  const props = defineProps<{
    noteId: string | null;
    isOpen: boolean;
  }>();

  const isMobile = ref(window.innerWidth <= 768);
  const isEditing = ref(false);
  const editedNote = ref<Note>(createEmptyNote());
  const initialNote = ref<Note | null>(null);
  const isNewNote = ref(false);
  const isHistory = ref(false);
  const { isTrashRoute } = useCurrentRoute();

  const modalClasses = computed(() => [
    'flex flex-col relative px-2 md:px-4',
    {
      'card-fullscreen w-full h-full': uiStore.isExpanded,
      'card w-11/12 md:w-3/5 h-[calc(100%-3rem)]': !uiStore.isExpanded,
    },
  ]);

  const noteArray = computed(() =>
    isTrashRoute.value ? notesStore.deletedNotes : notesStore.notes
  );

  const toolbarProps = computed(() => {
    return {
      note: editedNote,
      isEditing: isEditing.value,
      isHistory: isHistory.value,
      isNewNote: isNewNote.value,
    };
  });

  function previewVersion(version: NoteHistory) {
    if (version && editedNote.value) {
      const previewNote = { ...editedNote.value };
      previewNote.title = version.title;
      previewNote.content = version.content;

      editedNote.value = previewNote;
      isHistory.value = true;
    }
  }

  function applyVersion() {
    if (isHistory.value && props.noteId) {
      const noteHistory: NoteHistory = {
        timestamp: new Date().toISOString(),
        title: editedNote.value.title,
        content: editedNote.value.content,
      };
      notesStore.applyNoteVersion(props.noteId, noteHistory);
      initialNote.value = { ...editedNote.value };
      isHistory.value = false;
    }
  }

  function exitHistory() {
    if (initialNote.value) {
      editedNote.value = { ...initialNote.value };
    }
    isHistory.value = false;
    if (!isTrashRoute) {
      isEditing.value = true;
    }
  }

  async function saveVersion(savedNote: Note) {
    editedNote.value = { ...savedNote };
    initialNote.value = { ...savedNote };

    if (isNewNote.value) {
      isNewNote.value = false;
    }
  }

  async function handleClose() {
    if (isHistory.value) {
      notesStore.closeNote();
      return;
    }

    // For new notes that haven't been saved yet
    if (editedNote.value && isNewNote.value) {
      const isContentEmpty = !editedNote.value.content.trim();
      if (isContentEmpty) {
        uiStore.showToastMessage('Empty note discarded');
        notesStore.closeNote();
        return;
      }
    }

    // Check for unsaved changes
    if (initialNote.value && hasChanges(initialNote.value, editedNote.value)) {
      uiStore.openSaveAlertModal({
        message: 'You have unsaved changes. Do you want to save them?',
        // Return to editing
        cancel: () => {
          uiStore.setActiveModal(null);
        },
        // Don't save changes and close
        dontSave: () => {
          uiStore.setActiveModal(null);
          notesStore.closeNote();
        },
        // Save changes and close
        save: async () => {
          try {
            const currentTime = new Date().toISOString();
            const defaultTitle = editedNote.value.title.trim() || 'Untitled';

            if (isNewNote.value) {
              const newNote = {
                title: defaultTitle,
                content: editedNote.value.content,
                folder: editedNote.value.folder || '',
                last_edited: currentTime,
                pinned: false,
                history: [
                  {
                    timestamp: currentTime,
                    title: defaultTitle,
                    content: editedNote.value.content,
                  },
                ],
              };

              const createdNote = await notesStore.createNote(newNote);
              await saveVersion(createdNote);
            } else {
              const updatedNote = {
                ...editedNote.value,
                title: defaultTitle,
                last_edited: currentTime,
                history: [
                  ...(editedNote.value.history || []),
                  {
                    timestamp: currentTime,
                    title: defaultTitle,
                    content: editedNote.value.content,
                  },
                ],
              };

              await notesStore.updateNote(editedNote.value.id, updatedNote);
              await saveVersion(updatedNote);
            }

            uiStore.setActiveModal(null);
            notesStore.closeNote();
          } catch (error) {
            uiStore.showToastMessage('Failed to save note. Please try again.');
          }
        },
      });
    } else {
      notesStore.closeNote();
    }
  }

  watch(
    [() => props.isOpen, () => props.noteId],
    async ([isOpen, newNoteId]) => {
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
            isEditing.value = !isTrashRoute;
            isNewNote.value = false;
          }
        } else {
          editedNote.value = createEmptyNote();
          initialNote.value = null;
          isEditing.value = false;
          isNewNote.value = true;
        }
        isHistory.value = false;
      }
    },
    { immediate: true }
  );

  watch(isHistory, (newValue) => {
    if (newValue) {
      isEditing.value = false;
    } else {
      isEditing.value = !isTrashRoute;
    }
  });

  onMounted(() => {
    window.addEventListener('resize', () => {
      isMobile.value = window.innerWidth <= 768;
      if (isMobile.value && props.isOpen) {
        uiStore.isExpanded = true;
      }
    });
  });

  onUnmounted(() => {
    window.removeEventListener('resize', () => {});
  });

  defineExpose({
    previewVersion,
    applyVersion,
  });
</script>
