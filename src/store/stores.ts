// src/store/stores.ts
import { useAuthStore } from '@/store/authStore';
import { useNotesStore } from '@/store/notesStore';
import { useFolderStore } from '@/store/folderStore';
import { useUIStore } from '@/store/uiStore';
import * as useFirebaseStore from '@/store/firebaseStore';

export let authStore: ReturnType<typeof useAuthStore>;
export let notesStore: ReturnType<typeof useNotesStore>;
export let folderStore: ReturnType<typeof useFolderStore>;
export let uiStore: ReturnType<typeof useUIStore>;
export const firebaseStore = useFirebaseStore;

export const initializeStores = () => {
  authStore = useAuthStore();
  notesStore = useNotesStore();
  folderStore = useFolderStore();
  uiStore = useUIStore();
};
