<template>
  <div class="text-editor">
    <Toolbar v-if="props.showToolbar" :note="note" :isNewNote="isNewNote" />
    <Editor
      :modelValue="note.content"
      :editable="props.editable"
      ref="editorRef"
      @update:modelValue="updateContent"
    />
  </div>
</template>

<script setup lang="ts">
  import { provide, ref, watch } from 'vue';
  import Toolbar from './toolbar/toolbar.vue';
  import Editor from './editor/editor.vue';
  import type { Note } from '@/store/notesStore/types';

  const props = defineProps<{
    modelValue: Note;
    showToolbar: boolean;
    editable: boolean;
    isNewNote: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:modelValue', note: Note): void;
  }>();

  const note = ref<Note>({ ...props.modelValue });

  watch(
    () => props.modelValue,
    (newValue) => {
      note.value = { ...newValue };
    }
  );

  const updateContent = (newContent: string) => {
    note.value.content = newContent;
    emit('update:modelValue', note.value);
  };

  const content = ref(props.modelValue);
  const editorRef = ref<InstanceType<typeof Editor> | null>(null);

  const insertImage = (imgSrc: string) => {
    if (editorRef.value) {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.style.maxWidth = '100%';
      img.style.cursor = 'pointer';

      const currentContent = content.value;
      const newContent = currentContent + img.outerHTML;
      updateContent(newContent);
    }
  };

  provide('insertImage', insertImage);
</script>
