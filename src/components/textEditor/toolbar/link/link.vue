<template>
  <button
    @click="openLinkModal"
    :class="{ active: isActive }"
    title="Insert Link"
  >
    <PhLink :size="20" />
  </button>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { PhLink } from '@phosphor-icons/vue';
  import { uiStore } from '@/store';

  const isActive = ref(false);

  const openLinkModal = () => {
    const selectedRange = ref<Range | null>(null);
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      selectedRange.value = selection.getRangeAt(0);
      uiStore.openInputModal({
        mode: 'link',
        cancel: () => {
          uiStore.setActiveModal('null');
        },
        confirm: async (url: string) => {
          if (selectedRange.value) {
            const linkElement = document.createElement('a');
            linkElement.href = url;
            linkElement.target = '_blank';
            linkElement.rel = 'noopener noreferrer';
            linkElement.appendChild(selectedRange.value.extractContents());
            selectedRange.value.insertNode(linkElement);

            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(selectedRange.value);
            }
          }
        },
      });
    } else {
      uiStore.showToastMessage('Please select some text to create a link.');
    }
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
      isActive.value = !!element?.closest('a');
    }
  };

  onMounted(() => {
    document.addEventListener('selectionchange', updateActiveState);
  });

  onUnmounted(() => {
    document.removeEventListener('selectionchange', updateActiveState);
  });
</script>
