<template>
    <div class="flex justify-center items-center w-full mt-10 p-4">
      <!-- Search Bar -->
      <div class="flex items-center mr-4">
        <input v-model="searchQuery" @input="updateSearchQuery" placeholder="Search..."
          class="bg-white p-2 md:p-4 rounded-lg border-2 shadow-md outline-none w-full md:w-auto md:flex-grow-0" />
      </div>
  
      <!-- Plus Button -->
      <button v-if="!editing" @click="startEditing"
        class="bg-yellow-500 text-white p-2 pb-3 md:p-4 border-2 rounded-lg shadow-md focus:outline-none">
        <span class="text-sm">Add New</span>
      </button>
  
      <!-- Dark Background Overlay -->
      <div v-if="editing" class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
  
      <!-- Modal Form -->
      <form v-if="editing" class="fixed inset-0 z-50 flex flex-col items-center justify-center">
        <div class="bg-white p-6 rounded-lg border-2 shadow-xl w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12 relative">
          <input v-model="title" class="text-gray-700 w-full p-2 border rounded focus:outline-none"
            placeholder="Title" required />
          <textarea v-model="content" class="w-full h-48 mt-2 p-2 border rounded focus:outline-none"
            placeholder="Take a note"></textarea>
  
          <div class="flex align-center justify-center mt-4">
            <div v-for="(colorOption, index) in colorOptions" :key="index" class="mr-2 mb-2">
              <input type="radio" :id="colorOption" v-model="selectedColor" :value="colorOption"
                class="hidden" />
              <label :for="colorOption" :style="{
                              backgroundColor: colorOption,
                              borderColor: selectedColor === colorOption ? '#2196f3' : '#d1d5db',
                          }"
                class="inline-block w-6 lg:w-7 xl:w-8 h-6 lg:h-7 xl:h-8 rounded-full cursor-pointer border-2"></label>
            </div>
          </div>
  
          <div class="flex justify-end mt-4">
            <button @click.prevent="cancelEditing"
              class="mr-2 border-2 p-2 rounded-lg hover:shadow-md bg-slate-300 hover:bg-gray-400">Cancel</button>
            <button @click.prevent="saveNote"
              class="border-2 p-2 rounded-lg hover:shadow-md bg-blue-500 text-white hover:bg-blue-600">Save</button>
          </div>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, nextTick, defineEmits } from 'vue';
  import { useNotesStore } from '@/stores/ProductStore';
  
  const notesStore = useNotesStore();
  
  const editing = ref(false);
  const title = ref('');
  const content = ref('');
  const selectedColor = ref('#FFFFFF');
  
  const colorOptions = ['#FFFFFF', '#FFC0CB', '#FFD700', '#90EE90', '#ADD8E6', '#FFA07A', '#20B2AA', '#87CEFA'];
  
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
    const titleInput = document.querySelector('input[autofocus]');
    if (titleInput) titleInput.focus();
  };
  
  const saveNote = () => {
    const newNote = {
      title: title.value,
      content: content.value,
      color: selectedColor.value,
      timeCreated: new Date().toLocaleString()
    };
    notesStore.addNote(newNote);
    cancelEditing();
  };
  
  const cancelEditing = () => {
    editing.value = false;
    title.value = '';
    content.value = '';
    selectedColor.value = '#FFFFFF';
  };
  
  // Search Bar
  const searchQuery = ref('');
  const emit = defineEmits(['update:modelValue']);
  
  const updateSearchQuery = () => {
    emit('update:modelValue', searchQuery.value);
  };
  </script>
  
  <style scoped>
  /* Center the modal form */
  form {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  /* Reduce the gap between components */
  input,
  button {
    margin-bottom: 0;
  }
  </style>  