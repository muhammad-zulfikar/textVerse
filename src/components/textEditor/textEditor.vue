<template>
  <div class="text-editor">
    <Toolbar v-if="props.showToolbar" />
    <Editor
      :modelValue="content"
      @update:modelValue="updateContent"
      :editable="props.editable"
      ref="editorRef"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, provide } from 'vue';
import Toolbar from './toolbar/toolbar.vue';
import Editor from './editor/editor.vue';

const props = defineProps<{
  modelValue: string;
  showToolbar: boolean;
  editable: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const content = ref(props.modelValue);
const editorRef = ref<InstanceType<typeof Editor> | null>(null);

const updateContent = (newValue: string) => {
  content.value = newValue;
  emit('update:modelValue', newValue);
};

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

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== content.value) {
      content.value = newValue;
    }
  }
);

provide('focusEditor', () => {
  editorRef.value?.focusEditor();
});
</script>