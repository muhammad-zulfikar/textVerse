<template>
  <div
    class="relative inline-block text-left font-serif"
    ref="headingDropdownRef"
  >
    <button @click.stop="toggleHeadingDropdown" class="flex items-center py-1">
      <component :is="currentHeadingIcon" :size="20" class="mr-1" />
      <div
        class="p-1 mr-0 rounded-full hover:bg-cream-300 dark:hover:bg-gray-600 transition-transform duration-200"
        :class="{
          'rotate-180 bg-cream-300 dark:bg-gray-600': isHeadingDropdownOpen,
        }"
      >
        <PhCaretDown :size="16" class="transition-transform duration-300" />
      </div>
    </button>
    <div class="fixed-dropdowns">
      <Transition name="zoom">
        <div
          v-if="isHeadingDropdownOpen"
          class="z-50 fixed card dropdown-content text-sm mt-1"
          :style="headingDropdownStyle"
        >
          <div class="p-1 space-y-1" role="menu">
            <li
              v-for="(style, index) in textStyles"
              :key="style"
              class="w-full text-left cursor-pointer p-2 rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
              :class="{
                'bg-cream-200 dark:bg-gray-700':
                  currentHeadingIcon === headingIcons[index],
              }"
              @mousedown.prevent="applyTextStyle(style)"
            >
              <component :is="headingIcons[index]" :size="20" class="mr-2" />
              {{ style }}
            </li>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, markRaw } from 'vue';
  import {
    PhCaretDown,
    PhTextT,
    PhTextHOne,
    PhTextHTwo,
    PhTextHThree,
  } from '@phosphor-icons/vue';

  const headingDropdownRef = ref<HTMLElement | null>(null);
  const isHeadingDropdownOpen = ref(false);

  const textStyles = ['Normal', 'Heading 1', 'Heading 2', 'Heading 3'];
  const headingIcons = [PhTextT, PhTextHOne, PhTextHTwo, PhTextHThree].map(
    markRaw
  );
  const currentHeadingIcon = ref(headingIcons[0]);

  const toggleHeadingDropdown = () => {
    isHeadingDropdownOpen.value = !isHeadingDropdownOpen.value;
  };

  const updateCurrentHeading = () => {
    const currentBlock = document.queryCommandValue('formatBlock');
    const index =
      currentBlock === 'h1'
        ? 1
        : currentBlock === 'h2'
          ? 2
          : currentBlock === 'h3'
            ? 3
            : 0;
    currentHeadingIcon.value = headingIcons[index];
  };

  const applyTextStyle = (style: string) => {
    const currentBlock = document.queryCommandValue('formatBlock');
    const tag = style === 'Normal' ? 'p' : `h${textStyles.indexOf(style)}`;

    if (
      (style === 'Heading 1' && currentBlock === 'h1') ||
      (style === 'Heading 2' && currentBlock === 'h2') ||
      (style === 'Heading 3' && currentBlock === 'h3')
    ) {
      document.execCommand('formatBlock', false, '<p>');
    } else {
      document.execCommand('formatBlock', false, `<${tag}>`);
    }

    updateCurrentHeading();
    isHeadingDropdownOpen.value = false;
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      headingDropdownRef.value &&
      !headingDropdownRef.value.contains(event.target as Node)
    ) {
      isHeadingDropdownOpen.value = false;
    }
  };

  const handleSelectionChange = () => {
    updateCurrentHeading();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const startContainer = range.startContainer;

        if (
          startContainer.nodeType === Node.TEXT_NODE &&
          startContainer.textContent
        ) {
          const text = startContainer.textContent.slice(0, range.startOffset);
          const match = text.match(/^(#{1,3})\s*$/);

          if (match) {
            event.preventDefault();
            const headingLevel = match[1].length;
            document.execCommand('delete', false);
            document.execCommand('delete', false);
            applyTextStyle(`Heading ${headingLevel}`);
          }
        }
      }
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);
    document.removeEventListener('selectionchange', handleSelectionChange);
    document.removeEventListener('keydown', handleKeyDown);
  });

  const headingDropdownStyle = computed(() => {
    if (!headingDropdownRef.value) return {};
    const rect = headingDropdownRef.value.getBoundingClientRect();
    return {
      top: `${rect.bottom + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: '120px',
    };
  });
</script>

<style scoped>
  .fixed-dropdowns {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 0;
    pointer-events: none;
    z-index: 1000;
  }

  .dropdown-content {
    pointer-events: auto;
  }
</style>
