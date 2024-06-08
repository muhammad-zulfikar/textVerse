import { defineStore } from 'pinia';
import initialNotes from '@/assets/initialNotes.json';

export interface Note {
  id: number;
  title: string;
  content: string;
  color: string;
  timeCreated: string;
}

export const useNotesStore = defineStore('notes', {
  state: () => {
    const notes: Note[] = JSON.parse(localStorage.getItem('notes') || JSON.stringify(initialNotes));
    return { notes };
  },
  actions: {
    addNote(newNote: Note) {
      const now = new Date();
      newNote.timeCreated = now.toLocaleString("sk-SK", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: false,
      });
      this.notes.unshift(newNote);
      this.saveNotes();
    },
    setNotes(newNotes: Note[]) {
      this.notes = newNotes;
      this.saveNotes();
    },
    saveNotes() {
      localStorage.setItem('notes', JSON.stringify(this.notes));
    },
    removeNote(index: number) {
      this.notes.splice(index, 1);
      this.saveNotes();
    },
  },
});