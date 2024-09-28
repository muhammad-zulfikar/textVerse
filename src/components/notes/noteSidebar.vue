<template>
  <Modal
    :modelValue="props.isOpen"
    id="noteSidebar"
    @close="clickOutside"
    transition="sidebar-right"
  >
    <div :class="sidebarClasses">
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
  import { Note } from '@/store/notesStore/types';
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

  let saveNoteTimeout: ReturnType<typeof setTimeout> | null = null;

  const sidebarClasses = computed(() => [
    'flex flex-col fixed inset-y-0 right-0 px-2 md:px-4 overflow-y-auto',
    {
      'card-fullscreen w-full': uiStore.isExpanded,
      'card w-3/4 md:w-3/5': !uiStore.isExpanded,
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
    if (isContentEmpty(editedNote.value.content)) {
      if (editedNote.value.id) {
        await notesStore.deleteNote(editedNote.value.id);
      }
      uiStore.showToastMessage('Empty note discarded');
      return;
    }
    if (isEditing.value && !hasChanges.value) return;

    try {
      isSaving.value = true;
      const saveStartTime = Date.now();

      if (isEditing.value) {
        await notesStore.updateNote(editedNote.value.id, editedNote.value);
      } else {
        const newNote = await notesStore.createNote(editedNote.value);
        editedNote.value.id = newNote.id;
        isEditing.value = true;
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
      notesStore.closeNote(true);
      return;
    }

    if (isContentEmpty(editedNote.value.content)) {
      if (editedNote.value.id) {
        await notesStore.deleteNote(editedNote.value.id);
      }
      notesStore.closeNote();
      uiStore.showToastMessage('Empty note discarded');
      return;
    }
    if (isEditing.value && !hasChanges.value) {
      notesStore.closeNote();
      return;
    }
    await saveNote();
    notesStore.closeNote();
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
          }
        } else {
          editedNote.value = createEmptyNote();
          initialNote.value = null;
          isEditing.value = false;
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

  onUnmounted(() => {
    if (saveNoteTimeout) {
      clearTimeout(saveNoteTimeout);
    }
    window.removeEventListener('resize', handleResize);
  });
</script>
