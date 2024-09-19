import { UIState } from '@/utils/types';

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
