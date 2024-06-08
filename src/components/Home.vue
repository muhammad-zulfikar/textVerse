<template>
  <Header @update:modelValue="updateSearchQuery" />

  <ul class="w-11/12 mx-auto mt-8 mb-18 gap-8 columns-1 md:columns-3 lg:columns-4 2xl:w-7/12">
    <template v-for="(note, index) in filteredNotes" :key="note.id">
      <NoteCard :note="note" :index="index" :openNote="openNote" :removeNote="removeNote"/>
    </template>
  </ul>

  <NoteView v-if="selectedNote" :note="selectedNote" @close="closeNote" @save="saveNote" />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useNotesStore, Note } from '@/stores/ProductStore';
import NoteCard from './Notes/NoteCard.vue';
import Header from './Notes/Header.vue';
import NoteView from './Notes/NoteView.vue';

const notesStore = useNotesStore();
const localNotes = ref<Note[]>([...notesStore.notes]);
const selectedNote = ref<Note | null>(null);
const searchQuery = ref('');

const filteredNotes = computed(() =>
  localNotes.value.filter((note) => {
    const title = note.title ? note.title.toLowerCase() : '';
    const content = note.content ? note.content.toLowerCase() : '';
    return title.includes(searchQuery.value.toLowerCase()) || content.includes(searchQuery.value.toLowerCase());
  })
);

const updateSearchQuery = (query: string) => {
  searchQuery.value = query;
};

watch(() => notesStore.notes, (newNotes) => {
  localNotes.value = [...newNotes];
}, { deep: true });

const saveNotesToLocalStorage = () => {
  localStorage.setItem('notes', JSON.stringify(localNotes.value));
};

onMounted(() => {
  const savedNotes = localStorage.getItem('notes');
  if (savedNotes) {
    localNotes.value = JSON.parse(savedNotes);
  } else {
    saveNotesToLocalStorage();
  }
});

watch(localNotes, () => {
  saveNotesToLocalStorage();
}, { deep: true });

const openNote = (index: number) => {
  selectedNote.value = localNotes.value[index];
};

const removeNote = (index: number) => {
  notesStore.removeNote(index);
  closeNote();
};

const closeNote = () => {
  selectedNote.value = null;
};

const saveNote = (note: Note) => {
  const currentTime = new Date().toLocaleString("sk-SK", {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false,
  });
  note.timeCreated = currentTime;

  selectedNote.value = null;
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
