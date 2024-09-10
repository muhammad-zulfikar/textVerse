<template>
  <ModalBackdrop v-model="props.isOpen" />
  <transition name="slide">
    <div
      v-if="props.isOpen"
      class="fixed inset-0 z-40 flex items-center justify-center font-serif"
    >
      <div @click="handleOutsideClick" class="absolute inset-0"></div>
      <div
        ref="sidebarContainer"
        :class="[
          'fixed inset-y-0 right-0 overflow-y-auto flex flex-col px-4',
          {
            'custom-card-no-rounded-border w-full':
              uiStore.isExpanded && !uiStore.blurEnabled,
            'custom-card-blur-no-rounded-border w-full':
              uiStore.isExpanded && uiStore.blurEnabled,
            'custom-card w-3/4 md:w-2/5':
              !uiStore.isExpanded && !uiStore.blurEnabled,
            'custom-card-blur w-3/4 md:w-2/5':
              !uiStore.isExpanded && uiStore.blurEnabled,
          },
        ]"
      >
        <div class="flex w-full py-4 select-none">
          <NoteToolbar
            v-bind="toolbarProps"
            @delete-note="deleteNote"
            @update-folder="updateNoteFolder"
            @update-title="updateNoteTitle"
            @start-title-edit="isTitleEditing = true"
            @finish-title-edit="finishTitleEdit"
          />
        </div>
        <Separator />
        <div
          class="w-full bg-transparent py-4 flex-grow overflow-y-auto flex flex-col"
        >
          <div ref="quillEditorRef" class="w-full flex-grow"></div>
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
  import NoteToolbar from '@/components/notes/noteToolbar.vue';
  import Quill from 'quill';
  import Separator from '@/components/ui/separator.vue';

  const props = defineProps<{
    noteId: string | null;
    isOpen: boolean;
  }>();

  const isMobile = ref(window.innerWidth <= 768);
  const isEditMode = ref(false);
  const isSaving = ref(false);
  const editedNote = ref<Note>(createEmptyNote());
  const originalNote = ref<Note | null>(null);
  const sidebarContainer = ref<HTMLElement | null>(null);
  const quillEditor = ref<Quill | null>(null);
  const quillEditorRef = ref<HTMLElement | null>(null);
  const isTitleEditing = ref(false);

  const toolbarProps = computed(() => ({
    noteId: props.noteId,
    title: editedNote.value.title,
    content: editedNote.value.content,
    folder: editedNote.value.folder,
    note: editedNote.value,
    isTitleEditing: isTitleEditing.value,
    isEditMode: isEditMode.value,
    isValid: true,
    hasChanges: hasChanges.value,
    lastEditedDate:
      editedNote.value.last_edited || editedNote.value.time_created,
    isPinned: editedNote.value.pinned,
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

  async function deleteNote() {
    try {
      if (editedNote.value.id) {
        await notesStore.deleteNote(editedNote.value.id);
        uiStore.closeNote();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      uiStore.showToastMessage('Failed to delete note. Please try again.');
    }
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
        setTimeout(resolve, Math.max(0, 1000 - (Date.now() - saveStartTime)))
      );
    } catch (error) {
      console.error('Error saving note:', error);
      uiStore.showToastMessage('Failed to save note. Please try again.');
    } finally {
      isSaving.value = false;
    }
  }

  function updateNoteTitle(newTitle: string) {
    editedNote.value.title = newTitle;
    saveNote();
  }

  function updateNoteContent() {
    if (!notesStore.isContentEmpty(editedNote.value.content)) {
      saveNote();
    }
  }

  function updateNoteFolder(newFolder: string) {
    editedNote.value.folder = newFolder;
    saveNote();
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

  function finishTitleEdit(newTitle: string) {
    isTitleEditing.value = false;
    updateNoteTitle(newTitle);
  }

  function setupNoteListener(noteId: string) {
    if (authStore.isLoggedIn && noteId && authStore.user) {
      const noteRef = dbRef(db, `users/${authStore.user.uid}/notes/${noteId}`);
      return onValue(noteRef, (snapshot) => {
        const updatedNote = snapshot.val();
        if (updatedNote && updatedNote.id === editedNote.value.id) {
          editedNote.value = { ...updatedNote };
          originalNote.value = { ...updatedNote };

          if (
            quillEditor.value &&
            quillEditor.value.root.innerHTML !== updatedNote.content
          ) {
            const currentSelection = quillEditor.value.getSelection();
            quillEditor.value.root.innerHTML = updatedNote.content;
            if (currentSelection) {
              quillEditor.value.setSelection(currentSelection);
            }
          }
        }
      });
    }
  }

  function initializeQuillEditor() {
    if (quillEditorRef.value) {
      quillEditor.value = new Quill(quillEditorRef.value, {
        theme: 'snow',
        modules: {
          toolbar:
            !isMobile.value || uiStore.isExpanded
              ? [
                  ['bold', 'italic', 'underline', 'strike'],
                  ['blockquote', 'code-block'],
                  [{ align: [] }, { indent: '-1' }, { indent: '+1' }],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'image'],
                  [{ header: [1, 2, 3, 4, 5, 6, false] }],
                  [{ color: [] }, { background: [] }],
                  ['clean'],
                ]
              : false,
        },
      });

      quillEditor.value.on('text-change', (_delta, _oldDelta, source) => {
        if (source === 'user' && quillEditor.value) {
          editedNote.value.content = quillEditor.value.root.innerHTML;
          updateNoteContent();
        }
      });

      if (editedNote.value.content) {
        quillEditor.value.root.innerHTML = editedNote.value.content;
      }
    }
  }

  function updateQuillEditorHeight() {
    if (quillEditorRef.value && sidebarContainer.value) {
      const containerRect = sidebarContainer.value.getBoundingClientRect();
      const editorTop = quillEditorRef.value.offsetTop;
      const newHeight = window.innerHeight - containerRect.top - editorTop - 20;
      quillEditorRef.value.style.height = `${newHeight}px`;
    }
  }

  const resizeObserver = new ResizeObserver(updateQuillEditorHeight);

  watch(
    () => props.isOpen,
    (isOpen) => {
      if (isOpen) {
        if (isMobile.value) {
          uiStore.isExpanded = true;
        }
        nextTick(() => {
          updateQuillEditorHeight();
          if (sidebarContainer.value) {
            resizeObserver.observe(sidebarContainer.value);
          }
        });
      } else {
        if (sidebarContainer.value) {
          resizeObserver.unobserve(sidebarContainer.value);
        }
      }
    }
  );

  watch(
    [() => props.isOpen, () => props.noteId],
    async ([isOpen, newNoteId]) => {
      if (isOpen) {
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
        initializeQuillEditor();
      } else {
        if (quillEditor.value) {
          quillEditor.value.off('text-change');
          quillEditor.value = null;
        }
      }
    }
  );

  onMounted(() => {
    window.addEventListener('resize', () => {
      isMobile.value = window.innerWidth <= 768;
      updateQuillEditorHeight();
    });

    if (props.isOpen) {
      nextTick(() => {
        initializeQuillEditor();
        updateQuillEditorHeight();
        if (sidebarContainer.value) {
          resizeObserver.observe(sidebarContainer.value);
        }
      });
    }
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateQuillEditorHeight);
    resizeObserver.disconnect();
  });
</script>
