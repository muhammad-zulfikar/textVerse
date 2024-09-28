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
    const selectedRange = window.getSelection()?.getRangeAt(0);
    if (selectedRange && !selectedRange.collapsed) {
      uiStore.openInputModal({
        mode: 'link',
        cancel: () => {
          uiStore.setActiveModal('null');
        },
        confirm: async (url: string) => {
          const linkElement = document.createElement('a');
          linkElement.href = url;
          linkElement.target = '_blank';
          linkElement.rel = 'noopener noreferrer';
          linkElement.appendChild(selectedRange.extractContents());
          selectedRange.insertNode(linkElement);

          const event = new Event('input', {
            bubbles: true,
            cancelable: true,
          });
          selectedRange.commonAncestorContainer.parentElement?.dispatchEvent(
            event
          );

          const selection = window.getSelection();
          if (selection) {
            selection.removeAllRanges();
            const range = document.createRange();
            range.selectNodeContents(linkElement);
            selection.addRange(range);
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
