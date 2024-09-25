<template>
  <div
    class="font-serif text-sm mt-2 dark:text-white truncate-text content"
    v-html="sanitizedContent"
  ></div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import DOMPurify from 'dompurify';
  import { Note } from '@/store/notesStore/types';

  const props = defineProps<{
    note: Note;
  }>();

  const truncatedContent = (content: string) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.innerHTML;
  };

  const sanitizedContent = computed(() => {
    return DOMPurify.sanitize(truncatedContent(props.note.content));
  });
</script>
