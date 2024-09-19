export type Theme = 'light' | 'dark' | 'system';
export type ViewType = 'card' | 'table' | 'mail' | 'folder';
export type NoteViewType = 'modal' | 'sidebar';
export type SortType = 'date' | 'title';

export interface UIState {
  theme: Theme;
  viewType: ViewType;
  noteViewType: NoteViewType;
  columns: number;
  sortType: SortType;
  activeDropdown: string | null;
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
