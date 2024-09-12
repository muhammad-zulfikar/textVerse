// src/composables/usePublicNote.ts
import { ref, provide, inject, Ref } from 'vue';
import type { Note } from '@/utils/types';

const publicNoteKey = Symbol('publicNote');
const updatePublicNoteKey = Symbol('updatePublicNote');

export function providePublicNote() {
  const publicNote = ref<Note | null>(null);

  const updatePublicNote = (note: Note | null) => {
    publicNote.value = note;
  };

  provide(publicNoteKey, publicNote);
  provide(updatePublicNoteKey, updatePublicNote);

  return { publicNote, updatePublicNote };
}

export function usePublicNote() {
  const publicNote = inject<Ref<Note | null>>(publicNoteKey, ref(null));
  const updatePublicNote = inject<(note: Note | null) => void>(
    updatePublicNoteKey,
    () => {}
  );

  return { publicNote, updatePublicNote };
}
