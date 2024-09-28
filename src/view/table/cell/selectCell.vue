<template>
  <td
    class="p-3 w-10 border-b-[1px] border-r-[1px] border-black dark:border-white"
  >
    <input
      type="checkbox"
      :checked="notesStore.selectedNotes.includes(noteId)"
      @change="$emit('toggle-selection', noteId)"
      class="cursor-pointer"
    />
  </td>
</template>

<script setup lang="ts">
  import { notesStore } from '@/store';

  defineProps<{
    noteId: string;
  }>();

  defineEmits<{
    (e: 'toggle-selection', noteId: string): void;
  }>();
</script>
