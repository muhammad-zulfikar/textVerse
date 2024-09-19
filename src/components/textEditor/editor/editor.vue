<template>
  <div class="editor-container">
    <div
      ref="editorRef"
      class="editor min-h-[440px] max-h-[440px]"
      :contenteditable="editable"
      @input="handleInput"
      @keydown="handleKeyDown"
    ></div>
    <ImageViewModal
      :is-open="isImageModalOpen"
      :avatar-url="currentImageUrl"
      @close="closeImageModal"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch, provide } from 'vue';
  import ImageViewModal from '@/components/ui/modal/imageViewModal.vue';

  const props = defineProps<{
    modelValue: string;
    editable: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
  }>();

  const editorRef = ref<HTMLElement | null>(null);
  const isImageModalOpen = ref(false);
  const currentImageUrl = ref('');

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
    currentImageUrl.value = imageUrl;
    isImageModalOpen.value = true;
  };

  const closeImageModal = () => {
    isImageModalOpen.value = false;
  };

  onMounted(() => {
    if (editorRef.value) {
      editorRef.value.innerHTML = props.modelValue;
      editorRef.value.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
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

<style scoped>
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
    cursor: pointer;
    max-height: 400px;
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
    padding: 2px 4px;
    border-radius: 3px;
  }

  .dark .editor :deep(code) {
    background-color: #424242;
    color: #fff;
  }
</style>
