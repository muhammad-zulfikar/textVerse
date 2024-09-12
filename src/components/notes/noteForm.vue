<!-- noteForm.vue -->

<template>
  <div class="note-form">
    <div v-if="showToolbar" class="toolbar">
      <div
        class="relative inline-block text-left font-serif"
        ref="headingDropdownRef"
      >
        <button
          @click.stop="toggleHeadingDropdown"
          class="flex items-center py-1"
        >
          <component :is="currentHeadingIcon" :size="20" class="mr-1" />
          <div
            class="p-1 mr-0 rounded-full hover:bg-[#ccb478] dark:hover:bg-gray-600 transition-transform duration-200"
            :class="{
              'rotate-180 bg-[#d9c698] dark:bg-gray-600': isHeadingDropdownOpen,
            }"
          >
            <PhCaretDown :size="16" class="transition-transform duration-300" />
          </div>
        </button>
      </div>

      <button
        v-for="button in toolbarButtons"
        :key="button.command"
        @click="applyStyle(button.command)"
        class="mr-2"
        :class="[{ active: activeStyles[button.command] }, button.class]"
        :title="button.title"
      >
        <component :is="button.icon" :size="20" />
      </button>

      <button
        @click="createLink"
        class="ml-4 mr-2"
        :class="{ active: activeStyles.link }"
        title="Insert Link"
      >
        <PhLink :size="20" />
      </button>
      <button @click="triggerImageUpload" class="mr-2" title="Insert Image">
        <PhImage :size="20" />
      </button>
    </div>
    <div class="editor-container">
      <div
        ref="editorRef"
        class="editor min-h-[440px] max-h-[440px]"
        :contenteditable="editable"
        @input="handleInput"
        @keydown="handleKeyDown"
        @mouseup="updateActiveStyles"
        @keyup="updateActiveStyles"
        @click="updateActiveStyles"
        @focus="updateActiveStyles"
        @blur="updateActiveStyles"
      ></div>
    </div>
    <input
      type="file"
      ref="imageInputRef"
      @change="handleImageUpload"
      accept="image/*,video/*"
      style="display: none"
    />
  </div>

  <div class="fixed-dropdowns">
    <Transition name="zoom">
      <div
        v-if="isHeadingDropdownOpen"
        class="z-50 fixed card dropdown-content text-sm mt-1"
        :style="headingDropdownStyle"
      >
        <div class="py-1" role="menu">
          <li
            v-for="(style, index) in textStyles"
            :key="style"
            class="w-full text-left cursor-pointer p-2 rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
            @mousedown.prevent="applyTextStyle(style)"
          >
            <component :is="headingIcons[index]" :size="20" class="mr-2" />
            {{ style }}
          </li>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, markRaw, onUnmounted, computed } from 'vue';
  import {
    PhTextB,
    PhTextItalic,
    PhTextUnderline,
    PhTextAlignLeft,
    PhTextAlignCenter,
    PhTextAlignRight,
    PhListNumbers,
    PhListBullets,
    PhLink,
    PhImage,
    PhCaretDown,
    PhTextHOne,
    PhTextHTwo,
    PhTextHThree,
    PhTextT,
    PhTextStrikethrough,
    PhQuotes,
    PhCode,
  } from '@phosphor-icons/vue';

  interface Props {
    modelValue: string;
    class?: string;
    showToolbar: boolean;
    editable: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    showToolbar: true,
    editable: true,
  });

  const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

  const editorRef = ref<HTMLElement | null>(null);
  const imageInputRef = ref<HTMLInputElement | null>(null);
  const isHeadingDropdownOpen = ref(false);
  const headingDropdownRef = ref<HTMLElement | null>(null);

  const toggleHeadingDropdown = () => {
    isHeadingDropdownOpen.value = !isHeadingDropdownOpen.value;
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      headingDropdownRef.value &&
      !headingDropdownRef.value.contains(event.target as Node)
    ) {
      isHeadingDropdownOpen.value = false;
    }
  };

  onMounted(() => document.addEventListener('click', handleClickOutside));
  onUnmounted(() => document.removeEventListener('click', handleClickOutside));

  const textStyles = ['Normal', 'Heading 1', 'Heading 2', 'Heading 3'];
  const headingIcons = [PhTextT, PhTextHOne, PhTextHTwo, PhTextHThree].map(
    markRaw
  );

  const currentHeadingIcon = ref(headingIcons[0]);

  const toolbarButtons = [
    {
      command: 'bold',
      icon: PhTextB,
      title: 'Bold',
      class: 'ml-2',
    },
    {
      command: 'italic',
      icon: PhTextItalic,
      title: 'Italic',
      class: '',
    },
    {
      command: 'underline',
      icon: PhTextUnderline,
      title: 'Underline',
      class: '',
    },
    {
      command: 'strikethrough',
      icon: PhTextStrikethrough,
      title: 'Strikethrough',
      class: '',
    },
    {
      command: 'justifyLeft',
      icon: PhTextAlignLeft,
      title: 'Align Left',
      class: 'ml-4',
    },
    {
      command: 'justifyCenter',
      icon: PhTextAlignCenter,
      title: 'Align Center',
      class: '',
    },
    {
      command: 'justifyRight',
      icon: PhTextAlignRight,
      title: 'Align Right',
      class: '',
    },
    {
      command: 'insertOrderedList',
      icon: PhListNumbers,
      title: 'Ordered List',
      class: 'ml-4',
    },
    {
      command: 'insertUnorderedList',
      icon: PhListBullets,
      title: 'Unordered List',
      class: '',
    },
    {
      command: 'blockquote',
      icon: PhQuotes,
      title: 'Blockquote',
      class: 'ml-4',
    },
    {
      command: 'code',
      icon: PhCode,
      title: 'Code',
      class: '',
    },
  ];

  const activeStyles = ref(
    Object.fromEntries(toolbarButtons.map((b) => [b.command, false]))
  );

  const updateActiveStyles = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const ancestor = range.commonAncestorContainer;
      const element =
        ancestor.nodeType === Node.ELEMENT_NODE
          ? (ancestor as Element)
          : ancestor.parentElement;

      if (element) {
        const tagName = element.tagName.toLowerCase();
        const isHeading = ['h1', 'h2', 'h3'].includes(tagName);

        toolbarButtons.forEach((button) => {
          if (button.command === 'bold' && isHeading) {
            activeStyles.value[button.command] = false;
          } else {
            activeStyles.value[button.command] = document.queryCommandState(
              button.command
            );
          }
        });

        if (isHeading) {
          const headingIndex = ['h1', 'h2', 'h3'].indexOf(tagName);
          currentHeadingIcon.value = headingIcons[headingIndex + 1];
        } else if (tagName === 'p' || tagName === 'div') {
          currentHeadingIcon.value = headingIcons[0];
        } else {
          let parentElement = element.closest('h1, h2, h3, p, div');
          if (parentElement) {
            const parentTagName = parentElement.tagName.toLowerCase();
            if (['h1', 'h2', 'h3'].includes(parentTagName)) {
              const headingIndex = ['h1', 'h2', 'h3'].indexOf(parentTagName);
              currentHeadingIcon.value = headingIcons[headingIndex + 1];
            } else {
              currentHeadingIcon.value = headingIcons[0];
            }
          } else {
            currentHeadingIcon.value = headingIcons[0];
          }
        }

        activeStyles.value.link = element.closest('a') !== null;
        activeStyles.value.blockquote = !!element.closest('blockquote');
        activeStyles.value.code = !!element.closest('pre > code') || !!element.closest('code');
      }
    }
  };

  const applyStyle = (style: string) => {
    if (style === 'blockquote' || style === 'code') {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const container = document.createElement(style === 'blockquote' ? 'blockquote' : 'pre');
        if (style === 'code') {
          container.innerHTML = `<code>${range.extractContents().textContent}</code>`;
        } else {
          container.appendChild(range.extractContents());
        }
        range.insertNode(container);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } else {
      document.execCommand(style, false);
    }
    editorRef.value?.focus();
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.value) {
      emit('update:modelValue', editorRef.value.innerHTML);
    }
    updateActiveStyles();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEnterKey();
    } else if (e.key === ' ') {
      handleSpaceKey(e);
    }
  };

  const handleEnterKey = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const parentElement = range.startContainer.parentElement;

      if (parentElement && parentElement.tagName === 'LI') {
        handleListItemEnter(parentElement, range, selection);
      } else {
        document.execCommand('insertParagraph', false);
      }
    }
  };

  const handleListItemEnter = (
    listItem: HTMLElement,
    range: Range,
    selection: Selection
  ) => {
    const list = listItem.parentElement;

    if (listItem.textContent?.trim() === '') {
      if (list && list.parentElement) {
        const newParagraph = document.createElement('p');
        list.parentElement.insertBefore(newParagraph, list.nextSibling);
        range.setStartAfter(list);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      if (list) {
        list.removeChild(listItem);
        if (!list.hasChildNodes()) {
          list.parentElement?.removeChild(list);
        }
      }
    } else {
      const newItem = document.createElement('li');
      newItem.innerHTML = '<br>';
      list?.insertBefore(newItem, listItem.nextSibling);
      range.setStart(newItem, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const handleSpaceKey = (e: KeyboardEvent) => {
    e.preventDefault();
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const node = range.startContainer;
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const text = node.textContent.slice(0, range.startOffset);
        if (text === '1.' || text === '-') {
          createList(text === '1.' ? 'ol' : 'ul', range);
        } else {
          document.execCommand('insertText', false, ' ');
        }
      } else {
        document.execCommand('insertText', false, ' ');
      }
    }
  };

  const createList = (type: 'ol' | 'ul', range: Range) => {
    const listElement = document.createElement(type);
    const listItem = document.createElement('li');
    listItem.innerHTML = '<br>';
    listElement.appendChild(listItem);

    const node = range.startContainer;
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text) {
        node.textContent = text.slice(0, -2);
      }
    }

    range.collapse(false);
    range.insertNode(listElement);

    const newRange = document.createRange();
    newRange.setStart(listItem, 0);
    newRange.collapse(true);

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  };

  const applyTextStyle = (style: string) => {
    const tag = style === 'Normal' ? 'p' : `h${textStyles.indexOf(style)}`;
    document.execCommand('formatBlock', false, `<${tag}>`);
    currentHeadingIcon.value = headingIcons[textStyles.indexOf(style)];
    editorRef.value?.focus();
    handleInput();
  };

  const createLink = () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const url = prompt('Enter the URL:');
      if (url) {
        document.execCommand('createLink', false, url);
        const anchor = selection.anchorNode?.parentElement;
        if (anchor && anchor.tagName === 'A') {
          anchor.setAttribute('target', '_blank');
          anchor.setAttribute('rel', 'noopener noreferrer');
        }
        handleInput();
      }
    } else {
      alert('Please select some text to create a link.');
    }
  };

  const triggerImageUpload = () => imageInputRef.value?.click();

  const handleImageUpload = (event: Event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target?.result as string;
        img.style.maxWidth = '100%';
        editorRef.value?.focus();
        document.execCommand('insertHTML', false, img.outerHTML);
        handleInput();
      };
      reader.readAsDataURL(file);
    }
  };

  onMounted(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = props.modelValue;
      editorRef.value.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'A') {
          e.preventDefault();
          const href = target.getAttribute('href');
          if (href) {
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        }
      });
    }
    updateActiveStyles();
  });

  watch(
    () => props.modelValue,
    (newValue) => {
      if (editorRef.value && editorRef.value.innerHTML !== newValue) {
        editorRef.value.innerHTML = newValue;
        updateActiveStyles();
      }
    }
  );

  const headingDropdownStyle = computed(() => {
    if (!headingDropdownRef.value) return {};
    const rect = headingDropdownRef.value.getBoundingClientRect();
    return {
      top: `${rect.bottom + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
      width: '150px',
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

  .editor {
    color: #000;
  }

  .dark .editor {
    color: #fff;
  }

  .editor :deep(a) {
    color: blue;
    text-decoration: underline;
    cursor: pointer;
  }

  .dark .editor :deep(a) {
    color: #3b82f6;
  }

  .editor :deep(img) {
    margin: 10px auto;
    display: block;
  }

  .editor :deep(ul),
  .editor :deep(ol) {
    padding-left: 30px;
    margin: 10px 0;
  }

  .editor :deep(ul) {
    list-style-type: disc;
  }

  .editor :deep(ol) {
    list-style-type: decimal;
  }

  .editor :deep(li) {
    margin-bottom: 5px;
  }

  .editor :deep(h1) {
    font-size: 2em;
    font-weight: bold;
    line-height: 1.1;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid black;
  }

  .dark .editor :deep(h1) {
    border-bottom: 1px solid white;
  }

  .editor :deep(h2) {
    font-size: 1.5em;
    font-weight: bold;
    line-height: 1.05;
    margin-bottom: 10px;
    padding-bottom: 5px;
    border-bottom: 1px solid black;
  }

  .dark .editor :deep(h2) {
    border-bottom: 1px solid white;
  }

  .editor :deep(h3) {
    font-size: 1.17em;
    font-weight: bold;
    margin-bottom: 6px;
    padding-bottom: 3px;
    border-bottom: 1px solid black;
  }

  .dark .editor :deep(h3) {
    border-bottom: 1px solid white;
  }

  .editor :deep(blockquote) {
    border-left: 3px solid #d9c698;
    margin: 1em 0;
    padding-left: 1em;
    font-style: italic;
    color: #666;
  }

  .dark .editor :deep(blockquote) {
    border-left: 3px solid #ccc;
    color: #b1b1b1;
  }

  .editor :deep(code) {
    background-color: #d9c698;
    font-family: monospace;
    padding: 2px 4px;
    border-radius: 3px;
  }

  .dark .editor :deep(code) {
    background-color: #424242;
    color: #fff;
  }
</style>
