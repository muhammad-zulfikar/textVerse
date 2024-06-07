<template>
  <Navbar />
  <div class="flex justify-center items-center w-full mt-10 p-4">
    <!-- Search Bar -->
    <div class="flex items-center mr-4">
      <input v-model="searchQuery" @input="updateSearchQuery" placeholder="Search..."
        class="bg-white p-2 rounded-lg border-2 border-black dark:border-white shadow-md outline-none w-full md:w-auto md:flex-grow-0" />
    </div>
    <button @click="startEditing"
      class="bg-yellow-500 text-black p-2 border-2 border-black dark:border-white rounded-lg shadow-md hover:bg-yellow-400 outline-none">
      <span class="text-sm">Add New</span>
    </button>
    <NoteForm v-if="editing" @closeForm="handleFormClose" />
  </div>
</template>

<script setup>
import Navbar from '../Navbar/Navbar.vue';
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

const cancelEditing = () => {
  editing.value = false;
  title.value = '';
  content.value = '';
  selectedColor.value = '#FFFFFF';
};

const handleFormClose = () => {
  editing.value = false;
};

const searchQuery = ref('');
const emit = defineEmits(['update:modelValue']);

const updateSearchQuery = () => {
  emit('update:modelValue', searchQuery.value);
};

</script>