import { Theme, ViewType, NoteViewType, SortType } from './types';

export interface UIState {
  theme: Theme;
  viewType: ViewType;
  noteViewType: NoteViewType;
  columns: number;
  sortType: SortType;
  activeDropdown: string | null;
  activeModal: string | null;
  showToast: boolean;
  toastMessage: string;
  toastTimeout: number | null;
  isNoteModalOpen: boolean;
  isNoteSidebarOpen: boolean;
  isExpanded: boolean;
  isSyncing: boolean;
  isSelectMode: boolean;
  settingsListener: (() => void) | null;
}

export default (): UIState => ({
  theme: 'system',
  viewType: 'card',
  noteViewType: 'modal',
  columns: 4,
  sortType: 'date',
  activeDropdown: null,
  activeModal: null,
  showToast: false,
  toastMessage: '',
  toastTimeout: null,
  isNoteModalOpen: false,
  isNoteSidebarOpen: false,
  isExpanded: false,
  isSyncing: false,
  isSelectMode: false,
  settingsListener: null,
});
