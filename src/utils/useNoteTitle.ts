import { ref, computed, watch, nextTick, Ref } from 'vue';
import { Note } from '@/store/notesStore/types';
import { notesStore, uiStore } from '@/store';
import { useNoteManagement } from './useNoteManagement';

export function useNoteTitle(note: Ref<Note>) {
  const { isNotePublic, isNotePinned } = useNoteManagement(note);

  const title = computed({
    get: () => note.value.title,
    set: (newTitle) => {
      if (note.value.id) {
        notesStore.updateNote(note.value.id, {
          ...note.value,
          title: newTitle,
        });
      }
    },
  });

  const isEditingTitle = ref(false);
  const editedTitle = ref(title.value);
  const titleWidth = ref(0);
  const titleRef = ref<HTMLElement | null>(null);
  const titleInputRef = ref<HTMLInputElement | null>(null);
  const titleMeasure = ref<HTMLElement | null>(null);

  const currentTitle = ref(title.value);

  const truncatedTitle = computed(() => {
    const mobileMaxLength = 18;
    const midMaxLength = 25;
    const defaultMaxLength = 35;

    const truncate = (length: number) => {
      if (currentTitle.value.length <= length) return currentTitle.value;
      return currentTitle.value.slice(0, length - 3) + '...';
    };

    const isMobile = window.innerWidth <= 768;

    switch (true) {
      case isMobile && isNotePublic.value && isNotePinned.value:
        return truncate(mobileMaxLength);
      case isNotePublic.value || isNotePinned.value:
        return truncate(midMaxLength);
      default:
        return truncate(defaultMaxLength);
    }
  });

  const updateTitleWidth = () => {
    if (isEditingTitle.value && titleMeasure.value) {
      titleWidth.value = titleMeasure.value.offsetWidth;
    } else if (titleRef.value) {
      titleWidth.value = titleRef.value.offsetWidth;
    }
  };

  const editTitle = () => {
    if (!isEditingTitle.value) {
      isEditingTitle.value = true;
      editedTitle.value = currentTitle.value;

      nextTick(() => {
        titleInputRef.value?.focus();
        titleInputRef.value?.select();
      });
    }
  };

  const saveTitle = () => {
    isEditingTitle.value = false;
    if (editedTitle.value !== currentTitle.value) {
      title.value = editedTitle.value;
      currentTitle.value = editedTitle.value;
      uiStore.showToastMessage('Note title updated');
    }
  };

  watch(
    () => note.value.title,
    (newTitle) => {
      editedTitle.value = newTitle;
      currentTitle.value = newTitle;
      nextTick(() => updateTitleWidth());
    }
  );

  watch(isEditingTitle, (newValue) => {
    if (newValue) {
      nextTick(() => {
        updateTitleWidth();
      });
    }
  });

  return {
    title: currentTitle,
    isEditingTitle,
    editedTitle,
    titleWidth,
    titleRef,
    titleInputRef,
    titleMeasure,
    truncatedTitle,
    updateTitleWidth,
    editTitle,
    saveTitle,
  };
}
