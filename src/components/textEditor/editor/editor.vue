<template>
  <div class="editor-container">
    <div
      ref="editorRef"
      class="editor syntax min-h-[440px] max-h-[440px]"
      :contenteditable="editable"
      @input="handleInput"
      @keydown="handleKeyDown"
    ></div>
  </div>
</template>

<script setup lang="ts">
  import { uiStore } from '@/store';
  import { ref, onMounted, watch, provide } from 'vue';

  const props = defineProps<{
    modelValue: string;
    editable: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
  }>();

  const editorRef = ref<HTMLElement | null>(null);

  const handleInput = () => {
    if (editorRef.value) {
      emit('update:modelValue', editorRef.value.innerHTML);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      document.execCommand('insertParagraph', false);
    }
  };

  const openImageModal = (imageUrl: string) => {
    uiStore.openImageViewer({
      imageUrl: imageUrl,
    });
  };

  onMounted(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = props.modelValue;
      editorRef.value.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName.toLowerCase() === 'a') {
          const anchor = target as HTMLAnchorElement;
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
          window.open(anchor.href, '_blank', 'noopener noreferrer');
        }

        if (target.tagName === 'IMG') {
          openImageModal((target as HTMLImageElement).src);
        }
      });
    }
  });

  watch(
    () => props.modelValue,
    (newValue) => {
      if (editorRef.value && editorRef.value.innerHTML !== newValue) {
        editorRef.value.innerHTML = newValue;
      }
    }
  );

  const focusEditor = () => {
    if (editorRef.value) {
      editorRef.value.focus();
    }
  };

  provide('focusEditor', focusEditor);
  provide('openImageModal', openImageModal);

  defineExpose({ focusEditor });
</script>
