<template>
  <ModalBackdrop v-model="props.isOpen" />
  <transition name="zoom">
    <div
      v-show="props.isOpen"
      class="fixed inset-0 z-40 flex items-center justify-center font-serif"
    >
      <div @click="handleOutsideClick" class="absolute inset-0"></div>
      <div ref="modalContainer" :class="modalClasses">
        <div class="flex w-full pt-2 md:pt-4 select-none">
          <NoteToolbar v-bind="toolbarProps" />
        </div>
        <div
          class="w-full bg-transparent pt-2 md:pt-4 md:pb-2 flex-grow overflow-y-auto flex flex-col"
        >
          <TextEditor
            v-model="editedNote.content"
            @update:modelValue="updateNoteContent"
            :showToolbar="true"
            :editable="true"
            class="h-full flex-grow overflow-y-auto"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
  import { onValue, ref as dbRef } from 'firebase/database';
  import { db } from '@/firebase';
  import { Note } from '@/store/notesStore/types';
  import { notesStore, folderStore, uiStore, authStore } from '@/store';
  import {
    createNoteObject,
    hasChanged,
    isContentEmpty,
  } from '@/store/notesStore/helpers';
  import ModalBackdrop from '@/components/ui/modal/backdropModal.vue';
  import NoteToolbar from './noteToolbar.vue';
  import TextEditor from '@/components/textEditor/textEditor.vue';

  const props = defineProps<{
    noteId: string | null;
    isOpen: boolean;
  }>();

  const isMobile = ref(window.innerWidth <= 768);
  const isEditing = ref(false);
  const isSaving = ref(false);
  const editedNote = ref<Note>(createEmptyNote());
  const initialNote = ref<Note | null>(null);
  const modalContainer = ref<HTMLElement | null>(null);

  let saveNoteTimeout: ReturnType<typeof setTimeout> | null = null;

  const modalClasses = computed(() => [
    'flex flex-col relative px-2 md:px-4',
    {
      'card-fullscreen w-full h-full': uiStore.isExpanded,
      'card w-11/12 md:w-3/4 lg:w-1/2 xl:w-3/5': !uiStore.isExpanded,
    },
  ]);

  const toolbarProps = computed(() => ({
    note: editedNote,
    isEditing: isEditing.value,
    hasChanges: hasChanges.value,
    isSaving: isSaving.value,
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

  async function handleOutsideClick() {
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
    [() => props.isOpen, () => props.noteId],
    async ([isOpen, newNoteId]) => {
      if (isOpen) {
        if (isMobile.value) {
          uiStore.isExpanded = true;
        }
        await nextTick();
        if (newNoteId !== null) {
          const note = notesStore.notes.find((n) => n.id === newNoteId);
          if (note) {
            editedNote.value = { ...note };
            initialNote.value = { ...note };
            setupNoteListener(newNoteId);
            isEditing.value = true;
          }
        } else {
          editedNote.value = createEmptyNote();
          initialNote.value = null;
          isEditing.value = false;
        }
      }
    }
  );

  onMounted(() => {
    window.addEventListener('resize', () => {
      isMobile.value = window.innerWidth <= 768;
    });
  });

  onUnmounted(() => {
    window.removeEventListener('resize', () => {
      isMobile.value = window.innerWidth <= 768;
    });
    if (saveNoteTimeout) {
      clearTimeout(saveNoteTimeout);
    }
  });
</script>
