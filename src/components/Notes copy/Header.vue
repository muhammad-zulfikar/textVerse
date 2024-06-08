<template>
  <Navbar />
  <SearchBar @update:modelValue="updateSearchQuery" @startEditing="startEditing" />
  <NoteForm v-if="editing" @closeForm="handleFormClose" />
</template>

<script setup>
import Navbar from '../Navbar/Navbar.vue';
import SearchBar from './SearchBar.vue';
import NoteForm from './NoteForm.vue';
import { ref, nextTick, defineEmits } from 'vue';
import { useNotesStore } from '@/stores/ProductStore';

const notesStore = useNotesStore();
const editing = ref(false);

const startEditing = async (note = null) => {
  editing.value = true;
  if (note) {
    title.value = note.title;
    content.value = note.content;
    selectedColor.value = note.color;
  } else {
    title.value = '';
    content.value = '';
    selectedColor.value = '#FFFFFF';
  }
  await nextTick();
};

const handleFormClose = () => {
  editing.value = false;
};

const emit = defineEmits(['update:modelValue', 'startEditing']);

const updateSearchQuery = (query) => {
  emit('update:modelValue', query);
};

const startEditingNote = () => {
  emit('startEditing');
};
</script>