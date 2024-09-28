<template>
  <button
    @click="toggleBlockquote"
    :class="{ active: isActive }"
    title="Insert Blockquote"
  >
    <PhQuotes :size="20" />
  </button>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { PhQuotes } from '@phosphor-icons/vue';

  const isActive = ref(false);

  const toggleBlockquote = () => {
    document.execCommand(
      'formatBlock',
      false,
      isActive.value ? 'p' : 'blockquote'
    );
    isActive.value = !isActive.value;
  };

  const updateActiveState = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const ancestor = range.commonAncestorContainer;
      const element =
        ancestor.nodeType === Node.ELEMENT_NODE
          ? (ancestor as Element)
          : ancestor.parentElement;
      isActive.value = !!element?.closest('blockquote');
    }
  };

  onMounted(() => {
    document.addEventListener('selectionchange', updateActiveState);
  });

  onUnmounted(() => {
    document.removeEventListener('selectionchange', updateActiveState);
  });
</script>
