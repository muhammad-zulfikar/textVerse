<!-- Home.vue -->

<template>
  <Navbar />
  <SearchBar @update:modelValue="store.setSearchQuery" />
  <Toolbar />
  <NoteList :notes="store.filteredNotes" />
  <NoteView v-if="store.selectedNote" />
  <Toast v-if="store.showToast" :message="store.toastMessage" />
</template>

<script lang="ts" setup>
  import { useNotesStore } from '@/store/store';
  import Navbar from './Navbar/Navbar.vue';
  import SearchBar from './SearchBar/SearchBar.vue';
  import Toolbar from './Toolbar/Toolbar.vue';
  import NoteList from './Notes/NoteList.vue';
  import NoteView from './Notes/NoteView.vue';
  import Toast from './Toast/Toast.vue';

  const store = useNotesStore();
</script>
