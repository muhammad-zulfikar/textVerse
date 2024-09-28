<template>
  <div
    class="font-serif text-sm mt-2 dark:text-white truncate-text syntax content"
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

<style scoped>
  .truncate-text {
    display: -webkit-box;
    -webkit-line-clamp: 8;
    line-clamp: 8;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre-wrap;
  }

  @media (min-width: 640px) {
    .truncate-text {
      -webkit-line-clamp: 15;
      line-clamp: 15;
    }
  }

  .content :deep(h1) {
    font-size: 2em;
    font-weight: bold;
    line-height: 1.1;
    padding-bottom: 5px;
    border-bottom: none !important;
  }

  .content :deep(h2) {
    font-size: 1.5em;
    font-weight: bold;
    line-height: 1.05;
    padding-bottom: 5px;
    border-bottom: none !important;
  }

  .content :deep(h3) {
    font-size: 1.17em;
    font-weight: bold;
    padding-bottom: 3px;
    border-bottom: none !important;
  }

  .content :deep(ul),
  .content :deep(ol) {
    padding-left: 25px;
    margin: 10px 0;
  }
</style>
