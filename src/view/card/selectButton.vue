<template>
  <div
    class="absolute top-0 -left-3 card-rounded hover:bg-cream-200 dark:hover:bg-gray-700 transition-opacity duration-200"
    :class="{
      'opacity-100': isSelected || uiStore.isSelectMode,
      'opacity-0 group-hover:opacity-100': !isSelected && !uiStore.isSelectMode,
    }"
    @click.stop="toggleNoteSelection(note.id)"
    style="transform: translateY(-50%)"
  >
    <div
      class="p-1 rounded-full flex items-center justify-center"
      :class="{
        'bg-cream-200 dark:bg-gray-600': isSelected,
      }"
    >
      <PhCheck :size="16" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { PhCheck } from '@phosphor-icons/vue';
  import { notesStore, uiStore } from '@/store';
  import { Note } from '@/store/notesStore/types';

  const props = defineProps<{
    note: Note;
  }>();

  const isSelected = computed(() =>
    notesStore.selectedNotes.includes(props.note.id)
  );

  const toggleNoteSelection = (noteId: string) => {
    notesStore.toggleNoteSelection(noteId);
    if (notesStore.selectedNotes.length === 0) {
      uiStore.isSelectMode = false;
    } else {
      uiStore.isSelectMode = true;
    }
  };
</script>
