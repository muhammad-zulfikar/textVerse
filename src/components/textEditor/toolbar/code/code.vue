<template>
  <button @click="toggleCode" :class="{ active: isActive }" title="Insert Code">
    <PhCode :size="20" />
  </button>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { PhCode } from '@phosphor-icons/vue';

  const isActive = ref(false);

  const toggleCode = () => {
    document.execCommand('formatBlock', false, isActive.value ? 'p' : 'pre');
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
      isActive.value = !!element?.closest('pre');
    }
  };

  onMounted(() => {
    document.addEventListener('selectionchange', updateActiveState);
  });

  onUnmounted(() => {
    document.removeEventListener('selectionchange', updateActiveState);
  });
</script>
