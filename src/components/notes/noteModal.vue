<!--noteModal-->

<template>
  <ModalBackdrop v-model="props.isOpen" />
  <transition name="zoom">
    <div
      v-show="props.isOpen"
      class="fixed inset-0 z-40 flex items-center justify-center font-serif"
    >
      <div @click="handleOutsideClick" class="absolute inset-0"></div>
      <div ref="modalContainer" :class="modalClasses">
        <div class="flex w-full py-4 select-none">
          <NoteToolbar v-bind="toolbarProps" />
        </div>
        <Separator />
        <div
          class="w-full bg-transparent pt-4 pb-2 flex-grow overflow-y-auto flex flex-col"
        >
          <NoteForm
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
  import { Note } from '@/utils/types';
  import { notesStore, folderStore, uiStore, authStore } from '@/utils/stores';
  import { DEFAULT_FOLDERS } from '@/utils/constants';
  import { nanoid } from 'nanoid';
  import ModalBackdrop from '@/components/ui/modal/backdropModal.vue';
  import Separator from '@/components/ui/separator.vue';
  import NoteForm from '@/components/notes/noteForm.vue';
  import NoteToolbar from './noteToolbar.vue';

  const props = defineProps<{ noteId: string | null; isOpen: boolean }>();

  const isMobile = ref(window.innerWidth <= 768);
  const isEditMode = ref(false);
  const isSaving = ref(false);
  const editedNote = ref<Note>(createEmptyNote());
  const originalNote = ref<Note | null>(null);
  const modalContainer = ref<HTMLElement | null>(null);

  let saveNoteTimeout: ReturnType<typeof setTimeout> | null = null;

  const modalClasses = computed(() => [
    'px-4 relative flex flex-col',
    {
      'card-no-rounded-border w-full h-full':
        uiStore.isExpanded && !uiStore.blurEnabled,
      'card-blur-no-rounded-border w-full h-full':
        uiStore.isExpanded && uiStore.blurEnabled,
      'card w-11/12 md:w-3/4 lg:w-1/2 xl:w-3/5':
        !uiStore.isExpanded && !uiStore.blurEnabled,
      'card-blur w-11/12 md:w-3/4 lg:w-1/2 xl:w-3/5':
        !uiStore.isExpanded && uiStore.blurEnabled,
    },
  ]);

  const toolbarProps = computed(() => ({
    note: editedNote,
    isEditMode: isEditMode.value,
    isValid: true,
    hasChanges: hasChanges.value,
    isSaving: isSaving.value,
  }));

  const hasChanges = computed(() =>
    originalNote.value
      ? notesStore.hasChanged(originalNote.value, editedNote.value)
      : false
  );

  function createEmptyNote(): Note {
    return {
      id: nanoid(),
      title: 'Untitled',
      content: '',
      time_created: new Date().toISOString(),
      last_edited: new Date().toISOString(),
      pinned: false,
      folder:
        folderStore.currentFolder !== DEFAULT_FOLDERS.ALL_NOTES
          ? folderStore.currentFolder
          : DEFAULT_FOLDERS.UNCATEGORIZED,
    };
  }

  function debouncedSaveNote() {
    if (saveNoteTimeout) {
      clearTimeout(saveNoteTimeout);
    }
    saveNoteTimeout = setTimeout(saveNote, 500);
  }

  async function saveNote() {
    if (notesStore.isContentEmpty(editedNote.value.content)) {
      if (editedNote.value.id) {
        await notesStore.deleteNote(editedNote.value.id);
      }
      uiStore.showToastMessage('Empty note discarded');
      return;
    }
    if (isEditMode.value && !hasChanges.value) return;

    try {
      isSaving.value = true;
      const saveStartTime = Date.now();

      if (isEditMode.value) {
        await notesStore.updateNote(editedNote.value);
      } else {
        const newNote = await notesStore.addNote(editedNote.value);
        editedNote.value.id = newNote.id;
        isEditMode.value = true;
      }

      originalNote.value = { ...editedNote.value };
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
    if (notesStore.isContentEmpty(editedNote.value.content)) {
      if (editedNote.value.id) {
        await notesStore.deleteNote(editedNote.value.id);
      }
      uiStore.closeNote();
      uiStore.showToastMessage('Empty note discarded');
      return;
    }
    if (isEditMode.value && !hasChanges.value) {
      uiStore.closeNote();
      return;
    }
    await saveNote();
    uiStore.closeNote();
  }

  function setupNoteListener(noteId: string) {
    if (authStore.isLoggedIn && noteId && authStore.user) {
      const noteRef = dbRef(db, `users/${authStore.user.uid}/notes/${noteId}`);
      return onValue(noteRef, (snapshot) => {
        const updatedNote = snapshot.val();
        if (updatedNote && updatedNote.id === editedNote.value.id) {
          editedNote.value = { ...updatedNote };
          originalNote.value = { ...updatedNote };
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
            originalNote.value = { ...note };
            setupNoteListener(newNoteId);
            isEditMode.value = true;
          }
        } else {
          editedNote.value = createEmptyNote();
          originalNote.value = null;
          isEditMode.value = false;
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
