//useNoteTitle

import { ref, watch, nextTick, Ref } from 'vue';
import { Note } from '@/store/notesStore/types';
import { notesStore, uiStore } from '@/store';

export function useNoteTitle(note: Ref<Note>) {
  const title = ref(note.value.title);
  const isEditingTitle = ref(false);
  const editedTitle = ref(title.value);
  const titleWidth = ref(0);

  const updateTitleWidth = () => {
    nextTick(() => {
      const titleInput = document.getElementById(
        'note-title-input'
      ) as HTMLInputElement;
      if (titleInput) {
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.whiteSpace = 'pre';
        tempSpan.style.font = window.getComputedStyle(titleInput).font;
        tempSpan.textContent = editedTitle.value || '\u00A0';
        document.body.appendChild(tempSpan);

        titleWidth.value = tempSpan.offsetWidth;

        document.body.removeChild(tempSpan);
      }
    });
  };

  const editTitle = () => {
    if (!isEditingTitle.value) {
      isEditingTitle.value = true;
      editedTitle.value = title.value;
      nextTick(() => {
        updateTitleWidth();
        const titleInput = document.getElementById(
          'note-title-input'
        ) as HTMLInputElement;
        if (titleInput) {
          titleInput.focus();
          titleInput.select();
        }
      });
    }
  };

  const saveTitle = () => {
    isEditingTitle.value = false;
    if (editedTitle.value !== title.value) {
      title.value = editedTitle.value;
      if (note.value.id) {
        notesStore.updateNote(note.value.id, {
          ...note.value,
          title: editedTitle.value,
        });
      }
      uiStore.showToastMessage('Note title updated');
    }
  };

  watch(
    () => note.value.title,
    (newTitle) => {
      title.value = newTitle;
      editedTitle.value = newTitle;
    }
  );

  watch(editedTitle, () => {
    updateTitleWidth();
  });

  return {
    title,
    isEditingTitle,
    editedTitle,
    titleWidth,
    editTitle,
    saveTitle,
    updateTitleWidth,
  };
}
