import { DEFAULT_FOLDERS } from './constants';

export interface FolderState {
  folders: string[];
  currentFolder: string;
  folderListener: (() => void) | null;
}

export default (): FolderState => ({
  folders: [DEFAULT_FOLDERS.ALL_NOTES, DEFAULT_FOLDERS.UNCATEGORIZED],
  currentFolder: DEFAULT_FOLDERS.ALL_NOTES,
  folderListener: null,
});
