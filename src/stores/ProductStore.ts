import { defineStore } from 'pinia';
import initialNotes from '@/assets/initialNotes.json';

export interface Note {
  id: number;
  title: string;
  content: string;
  timeCreated: string;
}

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: JSON.parse(localStorage.getItem('notes') || JSON.stringify(initialNotes)).map((note: Omit<Note, 'id'>, index: number) => ({ ...note, id: index + 1 })),
    deletedNotes: [] as Note[],
    selectedNote: null as Note | null,
    searchQuery: '',
    editing: false,
    showToast: false,
    showNoteModal: false,
    toastMessage: '',
    isFullScreen: false,
  }),
  actions: {

    addNote(newNote: Omit<Note, 'id' | 'timeCreated'>) {
      const now = new Date();
      const note: Note = {
        id: Date.now(),
        ...newNote,
        timeCreated: now.toLocaleString("sk-SK", {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: false,
        })
      };
      this.notes.unshift(note);
      this.saveNotes();
      this.showToastMessage('Note added successfully!');
    },
    setNotes(newNotes: Note[]) {
      this.notes = newNotes;
      this.saveNotes();
    },
    saveNotes() {
      localStorage.setItem('notes', JSON.stringify(this.notes));
    },
    removeNote(index: number) {
      const deletedNote = this.notes.splice(index, 1)[0];
      this.deletedNotes.push(deletedNote);
      this.closeNote();
      this.showToastMessage('Note deleted successfully!');
    },
    removeNoteInModal() {
      if (this.selectedNote) {
        const index = this.notes.findIndex((note: { id: number | undefined; }) => note.id === this.selectedNote?.id);
        if (index !== -1) {
          const deletedNote = this.notes.splice(index, 1)[0];
          this.deletedNotes.push(deletedNote);
          this.showToastMessage('Note deleted successfully!');
          this.closeNoteModal();
          this.saveNotes();
        }
      }
    },
    undoDelete() {
      if (this.deletedNotes.length > 0) {
        const lastDeletedNote = this.deletedNotes.pop();
        if (lastDeletedNote) {
          this.notes.push(lastDeletedNote);
          this.saveNotes();
          this.showToastMessage('Note restored successfully!');
        }
      }
    },
    deleteAllNotes() {
      this.deletedNotes.push(...this.notes);
      this.notes = [];
      this.saveNotes();
      this.showToastMessage('All notes deleted successfully!');
    },
    openNote(index: number) {
      this.selectedNote = { ...this.notes[index] };
      document.body.classList.add('modal-open');
    },
    closeNote() {
      this.selectedNote = null;
      document.body.classList.remove('modal-open');
    },
    closeNoteModal() {
      this.selectedNote = null;
      this.showNoteModal = false;
    },
    saveNote(updatedNote: Note) {
      const index = this.notes.findIndex((n: { id: number; }) => n.id === updatedNote.id);
      if (index !== -1) {
        const newNote = {
          ...updatedNote,
          timeCreated: new Date().toLocaleString("sk-SK", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: false,
          })
        };
        this.notes.splice(index, 1);
        this.notes.unshift(newNote);
        this.saveNotes();
        this.showToastMessage('Note updated successfully!');
        this.closeNote();
      }
    },
    setEditing(value: boolean) {
      this.editing = value;
    },
    setSearchQuery(query: string) {
      this.searchQuery = query;
    },
    showToastMessage(message: string) {
      this.showToast = true;
      this.toastMessage = message;
      setTimeout(() => {
        this.showToast = false;
        this.toastMessage = '';
      }, 3000);
    },
    toggleFullScreen() {
      this.isFullScreen = !this.isFullScreen;
    },
    downloadNote(note: Note) {
      const { title, content, timeCreated } = note;
      const filename = `${title} - ${timeCreated}.txt`;
      const blob = new Blob([`Title: ${title}\nTime Created: ${timeCreated}\n\n${content}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      this.showToastMessage('Note downloaded successfully!');
    },
    linkify(text: string) {
      const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
      return text.replace(urlRegex, function (url) {
        return `<a href="${url}" target="_blank" class="hover:underline">${url}</a>`;
      });
    },
  },
  getters: {
    filteredNotes(): Note[] {
      const query = this.searchQuery.toLowerCase();
      return this.notes.filter((note: { title: string; content: string; }) =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
      );
    },
  },
});