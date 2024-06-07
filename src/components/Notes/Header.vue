<template>
  <Navbar />
  <div class="search-bar-wrapper">
    <div class="search-bar-container flex justify-center items-center w-full mt-4 p-4 bg-yellow-100 dark:bg-gray-900">
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
  </div>
</template>

<script setup>
import Navbar from '../Navbar/Navbar.vue';
import NoteForm from './NoteForm.vue';
import { ref, nextTick, defineEmits, onMounted, onUnmounted } from 'vue';
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

const updateSearchQuery = (query) => {
  emit('update:modelValue', searchQuery.value);
};

const handleScroll = () => {
  const searchBarContainer = document.querySelector('.search-bar-container');
  const searchBarWrapper = document.querySelector('.search-bar-wrapper');
  if (window.scrollY > 50) {
    searchBarContainer.classList.add('sticky');
    searchBarWrapper.classList.add('with-placeholder');
  } else {
    searchBarContainer.classList.remove('sticky');
    searchBarWrapper.classList.remove('with-placeholder');
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style>
.search-bar-wrapper.with-placeholder {
  height: 88px;
}

.search-bar-container.sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 0;
  padding-top: 16px;
  padding-bottom: 16px;
}
</style>
