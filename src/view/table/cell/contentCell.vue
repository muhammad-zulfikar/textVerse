<template>
  <td
    class="p-3 border-b-[1px] border-r-[1px] border-black dark:border-white md:max-w-[500px]"
  >
    <div
      v-html="sanitizeHtml(truncatedContent(content))"
      class="w-full bg-transparent outline-none truncate-text content syntax"
    ></div>
  </td>
</template>

<script setup lang="ts">
  import DOMPurify from 'dompurify';

  defineProps<{
    content: string;
  }>();

  const sanitizeHtml = (content: string) => {
    return DOMPurify.sanitize(content);
  };

  const truncatedContent = (content: string) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.innerHTML;
  };
</script>

<style scoped>
  .truncate-text {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre-wrap;
  }

  .content :deep(h1),
  .content :deep(h2),
  .content :deep(h3) {
    font-size: 16px;
  }
</style>
