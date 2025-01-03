<template>
  <button
    :disabled="!isSaveEnabled"
    @click="saveNote"
    :class="{ 'btn-disabled': !isSaveEnabled }"
  >
    <PhFloppyDisk :size="20" />
  </button>
</template>

<script setup lang="ts">
  import { defineProps, defineEmits, computed } from 'vue';
  import { Note, NoteHistory } from '@/store/notesStore/types';
  import { notesStore, uiStore } from '@/store';
  import { PhFloppyDisk } from '@phosphor-icons/vue';

  const props = defineProps<{
    note: Note;
    isNewNote: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'save', note: Note): void;
    (e: 'noteCreated'): void;
  }>();

  const isSaveEnabled = computed(() => {
    if (props.isNewNote) {
      return props.note.content.trim() !== '';
    }

    const lastHistory = props.note.history?.[props.note.history.length - 1];
    if (!lastHistory) return true;

    return (
      lastHistory.title !== props.note.title ||
      lastHistory.content !== props.note.content
    );
  });

  const saveNote = async () => {
    const defaultTitle = props.note.title.trim() || 'Untitled';
    const currentTime = new Date().toISOString();

    const newHistoryEntry: NoteHistory = {
      timestamp: currentTime,
      title: defaultTitle,
      content: props.note.content,
    };

    try {
      if (props.isNewNote) {
        // Create new note structure
        const newNoteData = {
          title: defaultTitle,
          content: props.note.content,
          folder: props.note.folder || '',
          last_edited: currentTime,
          pinned: false,
          history: [newHistoryEntry],
        };

        // Immediately create and add the note
        const createdNote = await notesStore.createNote(newNoteData);
        emit('save', createdNote);
        emit('noteCreated');
        uiStore.showToastMessage('Note created successfully');
      } else {
        // Handle existing note update
        const updatedNote = {
          ...props.note,
          title: defaultTitle,
          last_edited: currentTime,
          history: [...(props.note.history || []), newHistoryEntry],
        };

        await notesStore.updateNote(props.note.id, updatedNote);
        emit('save', updatedNote);
        uiStore.showToastMessage('Note updated successfully');
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      uiStore.showToastMessage('Failed to save note. Please try again.');
    }
  };
</script>
