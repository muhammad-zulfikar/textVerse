<template>
  <Navbar />
  <SearchBar @update:modelValue="store.setSearchQuery" />

  <Toast v-if="store.showToast" :message="store.toastMessage" />

  <div class="flex justify-between w-11/12 mx-auto mt-2 font-serif">
    <div>
      <button @click="store.setEditing(true)"
        class="text-black dark:text-white hover:underline dark:hover:bg-transparent outline-none mr-4">Add New</button>
    </div>
    <div>
      <button @click="store.undoDelete"
        class="text-black dark:text-white hover:underline dark:hover:bg-transparent outline-none mr-4">Undo</button>
      <button @click="store.deleteAllNotes"
        class="text-black dark:text-white hover:underline dark:hover:bg-transparent outline-none">Delete All</button>
    </div>
  </div>

  <NoteForm v-if="store.editing" />

  <NoteList :notes="store.notes" />

  <NoteView v-if="store.selectedNote" />
</template>

<script lang="ts" setup>
import { useNotesStore } from '@/stores/ProductStore';
import Navbar from './Navbar/Navbar.vue';
import SearchBar from './SearchBar/SearchBar.vue';
import NoteForm from './Notes/NoteForm.vue';
import NoteView from './Notes/NoteView.vue';
import Toast from './Toast/Toast.vue';
import NoteList from './Notes/NoteList.vue';

const store = useNotesStore();
</script>