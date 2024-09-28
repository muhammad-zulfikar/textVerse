<template>
  <Modal :modelValue="props.isOpen" id="noteModal" @close="clickOutside">
    <div :class="modalClasses">
      <div class="flex w-full pt-2 md:pt-4 select-none">
        <NoteToolbar v-bind="toolbarProps" />
      </div>
      <div
        class="w-full bg-transparent pt-2 md:pt-4 md:pb-2 flex-grow overflow-y-auto flex flex-col"
      >
        <TextEditor
          v-model="editedNote.content"
          @update:modelValue="updateNoteContent"
          :showToolbar="!props.isTrash"
          :editable="!props.isTrash"
          class="h-full flex-grow overflow-y-auto"
        />
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onUnmounted, nextTick, onMounted } from 'vue';
  import { onValue, ref as dbRef } from 'firebase/database';
  import { db } from '@/firebase';
  import { Note, NoteHistory } from '@/store/notesStore/types';
  import { notesStore, folderStore, uiStore, authStore } from '@/store';
  import {
    createNoteObject,
    hasChanged,
    isContentEmpty,
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

  let saveNoteTimeout: ReturnType<typeof setTimeout> | null = null;

  const modalClasses = computed(() => [
    'flex flex-col relative px-2 md:px-4',
    {
      'card-fullscreen w-full h-full': uiStore.isExpanded,
      'card w-11/12 md:w-3/5': !uiStore.isExpanded,
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
    isTrash: props.isTrash,
  }));

  const hasChanges = computed(() =>
    initialNote.value ? hasChanged(initialNote.value, editedNote.value) : false
  );

  function createEmptyNote(): Note {
    return createNoteObject({
      title: 'Untitled',
      content: '',
      folder: folderStore.currentFolder,
    });
  }

  function debouncedSaveNote() {
    if (saveNoteTimeout) {
      clearTimeout(saveNoteTimeout);
    }
    saveNoteTimeout = setTimeout(saveNote, 500);
  }

  async function saveNote() {
    if (isNewNote.value && isContentEmpty(editedNote.value.content)) {
      uiStore.showToastMessage('Empty note discarded');
      return;
    }
    if (isEditing.value && !hasChanges.value) return;

    try {
      isSaving.value = true;
      const saveStartTime = Date.now();

      const newHistoryEntry: NoteHistory = {
        timestamp: new Date().toISOString(),
        title: editedNote.value.title,
        content: editedNote.value.content,
      };

      if (isEditing.value) {
        const updatedNote = {
          ...editedNote.value,
          history: [...(editedNote.value.history || []), newHistoryEntry],
        };
        await notesStore.updateNote(updatedNote.id, updatedNote);
      } else {
        const newNote = {
          ...editedNote.value,
          history: [newHistoryEntry],
        };
        const createdNote = await notesStore.createNote(newNote);
        editedNote.value.id = createdNote.id;
        isEditing.value = true;
        isNewNote.value = false;
      }

      initialNote.value = { ...editedNote.value };
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, 500 - (Date.now() - saveStartTime)))
      );
    } catch (error) {
      console.error('Error saving note:', error);
      uiStore.showToastMessage('Failed to save note. Please try again.');
    } finally {
      isSaving.value = false;
    }
  }

  function updateNoteContent(newContent: string) {
    editedNote.value.content = newContent;
    debouncedSaveNote();
  }

  async function clickOutside() {
    if (props.isTrash) {
      await setLatestNoteVersion();
      notesStore.closeNote(true);
      return;
    }

    if (isNewNote.value && isContentEmpty(editedNote.value.content)) {
      notesStore.closeNote();
      uiStore.showToastMessage('Empty note discarded');
      return;
    }

    if (
      notesStore.currentHistoryIndex === null ||
      (editedNote.value.history &&
        notesStore.currentHistoryIndex === editedNote.value.history.length - 1)
    ) {
      await saveNote();
    }
    await setLatestNoteVersion();
    notesStore.closeNote();
  }

  async function setLatestNoteVersion() {
    if (editedNote.value.history && editedNote.value.history.length > 0) {
      const latestHistory =
        editedNote.value.history[editedNote.value.history.length - 1];
      editedNote.value.title = latestHistory.title;
      editedNote.value.content = latestHistory.content;
      editedNote.value.last_edited = latestHistory.timestamp;
    }
    notesStore.currentHistoryIndex = null;
  }

  function setupNoteListener(noteId: string) {
    if (authStore.isLoggedIn && noteId && authStore.user) {
      const noteRef = dbRef(db, `users/${authStore.user.uid}/notes/${noteId}`);
      return onValue(noteRef, (snapshot) => {
        const updatedNote = snapshot.val();
        if (updatedNote && updatedNote.id === editedNote.value.id) {
          editedNote.value = { ...updatedNote };
          initialNote.value = { ...updatedNote };
        }
      });
    }
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
            setupNoteListener(newNoteId);
            isEditing.value = !isTrash;
            isNewNote.value = false;
          }
        } else {
          editedNote.value = createEmptyNote();
          initialNote.value = null;
          isEditing.value = false;
          isNewNote.value = true;
        }
      }
    },
    { immediate: true }
  );

  const handleResize = () => {
    isMobile.value = window.innerWidth <= 768;
    if (isMobile.value && props.isOpen) {
      uiStore.isExpanded = true;
    }
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(async () => {
    if (saveNoteTimeout) {
      clearTimeout(saveNoteTimeout);
    }
    window.removeEventListener('resize', handleResize);
    await setLatestNoteVersion();
  });
</script>
