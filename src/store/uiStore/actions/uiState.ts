import { NoteHistory } from '@/store/notesStore/types';
import { UIState } from '../state';

export const toggleExpand = (state: UIState) => {
  state.isExpanded = !state.isExpanded;
};

export const setActiveDropdown = (state: UIState, dropdown: string | null) => {
  state.activeDropdown = dropdown;
};

export const setActiveModal = (state: UIState, modal: string | null) => {
  state.activeModal = modal;
};

export const openAlertModal = (
  state: UIState,
  options: {
    message: string;
    cancel: () => void;
    confirm: () => void;
  }
) => {
  state.activeDropdown = null;
  state.activeModal = 'alert';
  state.alertOptions = options;
};

export const openVersionModal = (
  state: UIState,
  options: {
    cancel: () => void;
    preview: (version: NoteHistory) => void;
    apply: () => void;
  }
) => {
  state.activeDropdown = null;
  state.activeModal = 'version';
  state.versionOptions = options;
};

export const openInputModal = (
  state: UIState,
  options: {
    mode: 'username' | 'email' | 'folder' | 'link';
    currentValue?: string;
    maxLength?: number;
    cancel: () => void;
    confirm: (value: string) => void;
  }
) => {
  state.activeDropdown = null;
  state.activeModal = 'input';
  state.inputModalOptions = options;
};

export const openImagePicker = (
  state: UIState,
  options: {
    initialImageUrl?: string;
    cancel: () => void;
    update: (imageUrl: string) => void;
    remove: () => void;
  }
) => {
  state.activeModal = 'imagePicker';
  state.imagePickerOptions = options;
};

export const openImageViewer = (
  state: UIState,
  options: {
    imageUrl: string;
  }
) => {
  state.activeDropdown = null;
  state.activeModal = 'imageViewer';
  state.imageViewerOptions = options;
};

export const showToastMessage = (state: UIState, message: string) => {
  state.showToast = true;
  state.toastMessage = message;
  if (state.toastTimeout !== null) {
    clearTimeout(state.toastTimeout);
  }
  state.toastTimeout = window.setTimeout(() => {
    state.showToast = false;
    state.toastMessage = '';
    state.toastTimeout = null;
  }, 3000);
};

export const setSyncing = (state: UIState, value: boolean) => {
  state.isSyncing = value;
};

export const toggleSelectMode = (state: UIState) => {
  state.isSelectMode = !state.isSelectMode;
};
