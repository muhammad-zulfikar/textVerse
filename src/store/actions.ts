// actions.ts

import { State, Note } from './types';

export const actions = {
  addNote(
    this: State,
    newNote: Omit<
      Note,
      'id' | 'timeCreated' | 'lastEdited' | 'pinned' | 'folder'
    >
  ) {
    const now = new Date();
    const formattedDate = now.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const note: Note = {
      id: Date.now(),
      ...newNote,
      timeCreated: formattedDate,
      lastEdited: formattedDate,
      pinned: false,
      folder:
        this.currentFolder === 'All Notes'
          ? this.uncategorizedFolder
          : this.currentFolder,
    };
    this.notes.unshift(note);
    this.reorderNotes();
    this.saveNotes();
    this.showToastMessage('Note added successfully!');
  },

  saveNote(this: State, updatedNote: Note) {
    const index = this.notes.findIndex((n) => n.id === updatedNote.id);
    if (index !== -1) {
      const now = new Date();
      const formattedDate = now.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const newNote = {
        ...updatedNote,
        lastEdited: formattedDate,
      };
      this.notes.splice(index, 1);
      this.notes.unshift(newNote);
      this.reorderNotes();
      this.saveNotes();
      this.showToastMessage('Note updated successfully!');
      this.closeNote();
    }
  },

  pinNote(this: State, noteId: number) {
    const index = this.notes.findIndex((note) => note.id === noteId);
    if (index !== -1) {
      this.notes[index].pinned = true;
      this.reorderNotes();
      this.saveNotes();
      this.showToastMessage('Note pinned');
    }
  },

  unpinNote(this: State, noteId: number) {
    const index = this.notes.findIndex((note) => note.id === noteId);
    if (index !== -1) {
      const unpinnedNote = this.notes[index];
      unpinnedNote.pinned = false;
      this.notes.splice(index, 1);

      const insertIndex = this.notes.findIndex((note) => {
        const noteDate = new Date(note.lastEdited || note.timeCreated);
        const unpinnedDate = new Date(
          unpinnedNote.lastEdited || unpinnedNote.timeCreated
        );
        return !note.pinned && noteDate <= unpinnedDate;
      });

      if (insertIndex === -1) {
        this.notes.push(unpinnedNote);
      } else {
        this.notes.splice(insertIndex, 0, unpinnedNote);
      }

      this.saveNotes();
      this.showToastMessage('Note unpinned');
    }
  },

  reorderNotes(this: State) {
    this.notes.sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }
      const dateA = new Date(a.lastEdited || a.timeCreated);
      const dateB = new Date(b.lastEdited || b.timeCreated);
      return dateB.getTime() - dateA.getTime();
    });
  },

  saveNotes(this: State) {
    localStorage.setItem('notes', JSON.stringify(this.notes));
  },

  removeNote(this: State, noteId: number) {
    const index = this.notes.findIndex((note) => note.id === noteId);
    if (index !== -1) {
      const deletedNote = this.notes.splice(index, 1)[0];
      this.deletedNotes.push(deletedNote);
      this.closeNote();
      this.saveNotes();
      this.showToastMessage('Note deleted successfully!');
    }
  },

  removeNoteInModal(this: State) {
    if (this.selectedNote) {
      const index = this.notes.findIndex(
        (note) => note.id === this.selectedNote?.id
      );
      if (index !== -1) {
        const deletedNote = this.notes.splice(index, 1)[0];
        this.deletedNotes.push(deletedNote);
        this.showToastMessage('Note deleted successfully!');
        this.closeNoteModal();
        this.saveNotes();
      }
    }
  },

  undoDelete(this: State) {
    if (this.deletedNotes.length > 0) {
      const lastDeletedNote = this.deletedNotes.pop();
      if (lastDeletedNote) {
        this.notes.push(lastDeletedNote);
        this.saveNotes();
        this.showToastMessage('Note restored successfully!');
      }
    }
  },

  deleteAllNotes(this: State) {
    this.deletedNotes.push(...this.notes);
    this.notes = [];
    this.saveNotes();
    this.showToastMessage('All notes deleted successfully!');
  },

  copyNote(this: State, noteId: number) {
    const note = this.notes.find((n) => n.id === noteId);
    if (note) {
      navigator.clipboard
        .writeText(note.content)
        .then(() => {
          this.showToastMessage('Note content copied to clipboard!');
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          this.showToastMessage('Failed to copy note content');
        });
    }
  },

  openNote(this: State, noteId: number) {
    const note = this.notes.find((n) => n.id === noteId);
    if (note) {
      this.selectedNote = { ...note };
      document.body.classList.add('modal-open');
    }
  },

  closeNote(this: State) {
    this.selectedNote = null;
    document.body.classList.remove('modal-open');
  },

  closeNoteModal(this: State) {
    this.selectedNote = null;
    this.showNoteModal = false;
  },

  setEditing(this: State, value: boolean) {
    this.editing = value;
  },

  setSearchQuery(this: State, query: string) {
    this.searchQuery = query;
  },

  showToastMessage(this: State, message: string) {
    this.showToast = true;
    this.toastMessage = message;
    if (this.toastTimeoutId !== null) {
      clearTimeout(this.toastTimeoutId);
    }
    this.toastTimeoutId = window.setTimeout(() => {
      this.showToast = false;
      this.toastMessage = '';
      this.toastTimeoutId = null;
    }, 3000);
  },

  toggleFullScreen(this: State) {
    this.isFullScreen = !this.isFullScreen;
  },

  downloadNote(this: State, note: Note) {
    const { title, content, timeCreated } = note;
    const filename = `${title}.txt`;
    const blob = new Blob(
      [`Title: ${title}\nTime Created: ${timeCreated}\n\n${content}`],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    this.showToastMessage('Note downloaded successfully!');
  },

  linkify(this: State, text: string) {
    const escapeHTML = (str: string) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    const escapedText = escapeHTML(text);
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;

    return escapedText.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" class="hover:underline">${url}</a>`
    );
  },

  setCurrentFolder(this: State, folder: string) {
    this.currentFolder = folder;
  },

  setActiveDropdown(this: State, dropdown: string | null) {
    this.activeDropdown = dropdown;
  },

  createFolder(this: State, folderName: string) {
    if (!this.folders.includes(folderName)) {
      this.folders.push(folderName);
      this.saveFolders();
      this.showToastMessage('Folder created successfully!');
    } else {
      this.showToastMessage('Folder already exists!');
    }
  },

  renameFolder(this: State, oldName: string, newName: string) {
    if (
      oldName !== 'All Notes' &&
      oldName !== this.uncategorizedFolder &&
      !this.folders.includes(newName)
    ) {
      const index = this.folders.indexOf(oldName);
      if (index !== -1) {
        this.folders[index] = newName;
        this.notes = this.notes.map((note) =>
          note.folder === oldName ? { ...note, folder: newName } : note
        );
        this.saveFolders();
        this.saveNotes();
        this.showToastMessage('Folder renamed successfully!');
      }
    } else {
      this.showToastMessage('Cannot rename this folder!');
    }
  },

  saveFolders(this: State) {
    localStorage.setItem('folders', JSON.stringify(this.folders));
  },

  loadFolders(this: State) {
    const savedFolders = localStorage.getItem('folders');
    if (savedFolders) {
      this.folders = JSON.parse(savedFolders);
      if (!this.folders.includes(this.uncategorizedFolder)) {
        this.folders.push(this.uncategorizedFolder);
      }
    }
  },

  notesCountByFolder(this: State): Record<string, number> {
    const counts: Record<string, number> = {};
    this.folders.forEach((folder) => {
      counts[folder] =
        folder === 'All Notes'
          ? this.notes.length
          : this.notes.filter((note) => note.folder === folder).length;
    });
    return counts;
  },

  moveNote(this: State, noteId: number, targetFolder: string) {
    const noteIndex = this.notes.findIndex((note) => note.id === noteId);
    if (noteIndex !== -1) {
      this.notes[noteIndex].folder = targetFolder;
      this.saveNotes();
      this.showToastMessage('Note moved successfully!');
    }
  },

  deleteFolder(this: State, folderName: string) {
    if (folderName !== 'All Notes' && folderName !== this.uncategorizedFolder) {
      const index = this.folders.indexOf(folderName);
      if (index !== -1) {
        this.folders.splice(index, 1);
        this.notes = this.notes.map((note) =>
          note.folder === folderName
            ? { ...note, folder: this.uncategorizedFolder }
            : note
        );
        this.saveFolders();
        this.saveNotes();
        if (this.currentFolder === folderName) {
          this.setCurrentFolder('All Notes');
        }
        this.showToastMessage('Folder deleted successfully!');
      }
    } else {
      this.showToastMessage('Cannot delete this folder!');
    }
  },

  setColumns(this: State, columns: number) {
    this.columns = columns;
    localStorage.setItem('columnCount', columns.toString());
  },

  init(this: State) {
    this.loadFolders();
  },
};
