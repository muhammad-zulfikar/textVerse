import { UIState } from '../state';
import { ViewType, NoteViewType, SortType } from '../types';
import { saveSettings } from '.';

export const setViewType = (state: UIState, newViewType: ViewType) => {
  state.viewType = newViewType;
  saveSettings(state);
};

export const setSortType = (state: UIState, newSortType: SortType) => {
  state.sortType = newSortType;
  saveSettings(state);
};

export const setNoteViewType = (state: UIState, preference: NoteViewType) => {
  state.noteViewType = preference;
  saveSettings(state);
};

export const setColumns = (state: UIState, newColumns: number) => {
  state.columns = getValidColumns(state, newColumns);
  localStorage.setItem('columns', JSON.stringify(state.columns));
};

export const getValidColumns = (
  _state: UIState,
  columnsInput: number
): number => {
  const isMobile = window.innerWidth < 640;
  if (isMobile) {
    return Math.min(columnsInput, 2);
  }
  return columnsInput || 4;
};

export const openNoteView = (state: UIState) => {
  if (state.noteViewType === 'modal') {
    state.isNoteModalOpen = true;
  } else {
    state.isNoteSidebarOpen = true;
  }
  document.body.classList.add('modal');
};

export const closeNoteView = (state: UIState) => {
  if (state.noteViewType === 'modal') {
    state.isNoteModalOpen = false;
  } else {
    state.isNoteSidebarOpen = false;
  }
  document.body.classList.remove('modal');
};

export const handleResize = (state: UIState) => {
  const newColumns = getValidColumns(state, state.columns);
  if (newColumns !== state.columns) {
    setColumns(state, newColumns);
  }
};
