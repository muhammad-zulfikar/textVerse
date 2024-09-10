// src/store/stores.ts

import { useAuthStore } from '@/store/authStore';
import { useNotesStore } from '@/store/notesStore';
import { useFolderStore } from '@/store/folderStore';
import { useUIStore } from '@/store/uiStore';
import { useFirebaseStore } from '@/store/firebaseStore';
import { useLocalStore } from '@/store/localStore';

export let authStore: ReturnType<typeof useAuthStore>;
export let notesStore: ReturnType<typeof useNotesStore>;
export let folderStore: ReturnType<typeof useFolderStore>;
export let uiStore: ReturnType<typeof useUIStore>;
export let firebaseStore: ReturnType<typeof useFirebaseStore>;
export let localStore: ReturnType<typeof useLocalStore>;

export const initializeStores = () => {
  authStore = useAuthStore();
  notesStore = useNotesStore();
  folderStore = useFolderStore();
  uiStore = useUIStore();
  firebaseStore = useFirebaseStore();
  localStore = useLocalStore();
};
