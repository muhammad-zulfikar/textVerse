import { DEFAULT_FOLDERS } from './constants';

export interface FolderState {
  folders: string[];
  currentFolder: string;
  targetFolder: string;
  folderToDelete: string;
  folderListener: (() => void) | null;
}

export default (): FolderState => ({
  folders: [DEFAULT_FOLDERS.ALL_NOTES, DEFAULT_FOLDERS.UNCATEGORIZED],
  currentFolder: DEFAULT_FOLDERS.ALL_NOTES,
  targetFolder: '',
  folderToDelete: '',
  folderListener: null,
});
