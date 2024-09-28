<template>
  <td
    class="w-[250px] max-w-[190px] md:max-w-[250px] p-3 border-b-[1px] border-r-[1px] border-black dark:border-white relative group"
  >
    <div class="flex items-center">
      <div
        @click="$emit('open-note', note.id)"
        class="w-full bg-transparent outline-none truncate hover:underline cursor-pointer"
        :class="[{ selected: isSelected || note.pinned }]"
      >
        {{ note.title }}
      </div>
    </div>
  </td>
</template>

<script setup lang="ts">
  import { Note } from '@/store/notesStore/types';

  defineProps<{
    note: Note;
    isSelected: boolean;
  }>();

  defineEmits<{
    (e: 'open-note', noteId: string): void;
  }>();
</script>

<style scoped>
  .selected {
    text-decoration: underline;
  }
</style>
