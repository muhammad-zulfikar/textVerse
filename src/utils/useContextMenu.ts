import { ref } from 'vue';
import { Note } from '@/store/notesStore/types';
import { uiStore } from '@/store';

export function useContextMenu() {
  const showMenu = ref(false);
  const menuPosition = ref({ x: 0, y: 0 });
  const selectedNote = ref<Note | null>(null);

  const showContextMenu = (event: MouseEvent, note: Note) => {
    event.stopPropagation();
    uiStore.setActiveDropdown(null);
    menuPosition.value = { x: event.clientX, y: event.clientY };
    showMenu.value = true;
    selectedNote.value = note;
  };

  const hideContextMenu = () => {
    showMenu.value = false;
  };

  return {
    showMenu,
    menuPosition,
    selectedNote,
    showContextMenu,
    hideContextMenu,
  };
}
