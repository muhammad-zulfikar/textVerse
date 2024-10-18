<template>
  <div class="flex my-2 md:mx-auto font-serif text-sm">
    <Path
      :notes="props.notes"
      :isTrash="props.isTrash"
      @select-note="openNote"
    />
  </div>
</template>

<script setup lang="ts">
  import Path from './tree/path.vue';
  import { Note } from '@/store/notesStore/types';
  import { notesStore } from '@/store';

  const props = defineProps<{
    notes: Note[];
    isTrash?: boolean;
  }>();

  const openNote = (noteId: string) => {
    notesStore.openNote(noteId);
  };
</script>
