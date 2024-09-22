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

  alertOptions: {
    message: string;
    cancel: () => void;
    confirm: () => void;
  } | null;

  inputModalOptions: {
    mode: 'username' | 'email' | 'folder' | 'link';
    currentValue?: string;
    maxLength?: number;
    cancel: () => void;
    confirm: (value: string) => void;
  } | null;

  imagePickerOptions: {
    initialImageUrl?: string;
    cancel: () => void;
    update: (imageUrl: string) => void;
    remove: () => void;
  } | null;

  imageViewerOptions: {
    imageUrl: string;
  } | null;

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

  alertOptions: null,

  inputModalOptions: null,

  imagePickerOptions: null,

  imageViewerOptions: null,

  isNoteModalOpen: false,
  isNoteSidebarOpen: false,
  isExpanded: false,
  isSyncing: false,
  isSelectMode: false,
  settingsListener: null,
});
