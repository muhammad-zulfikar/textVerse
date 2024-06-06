<template>
  <Header @update:modelValue="updateSearchQuery" />
  
  <ul class="w-11/12 mx-auto mt-10 mb-20 gap-8 columns-1 md:columns-3 lg:columns-4 2xl:w-7/12">
    <template v-for="(note, index) in filteredNotes" :key="note.id">
      <NoteCard :note="note" :index="index" :removeNote="removeNote" :openNote="openNote" />
    </template>
  </ul>

  <div v-if="selectedNote" class="modal fixed inset-0 flex items-center justify-center z-50" @click.self="saveNote">
    <div :style="{ backgroundColor: selectedNote.color }"
      class="modal-content w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 p-5 rounded-lg border-2 border-black relative">
      <div class="flex justify-end mb-2">
        <button class="flex-shrink-0 w-6 h-6 cursor-pointer">
          <img src="@/assets/close.svg" class="w-full h-full" @click="closeNote" alt="Close" />
        </button>
      </div>
      <h1 class="text-xl font-bold mb-4">
        <input v-model="selectedNote.title"
          class="w-full p-1 bg-transparent border-b-2 border-black focus:outline-none" />
      </h1>
      <textarea v-model="selectedNote.content"
        class="w-full p-2 bg-white border-2 border-black rounded focus:outline-none" rows="5"
        :style="{ backgroundColor: selectedNote.color }"></textarea>
      <p class="flex justify-end text-gray-500 text-sm mt-4">{{ selectedNote.timeCreated }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useNotesStore, Note } from '@/stores/ProductStore';
import NoteCard from './Notes/NoteCard.vue';
import Header from './Notes/Header.vue';

const notesStore = useNotesStore();
const localNotes = ref<Note[]>([...notesStore.notes]);
const selectedNote = ref<Note | null>(null);
const searchQuery = ref('');

const filteredNotes = computed(() =>
  localNotes.value.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
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

const removeNote = (index: number) => {
  notesStore.removeNote(index);
};

const openNote = (index: number) => {
  selectedNote.value = localNotes.value[index];
};

const closeNote = () => {
  selectedNote.value = null;
};

const saveNote = () => {
  if (selectedNote.value) {
    const noteIndex = localNotes.value.findIndex(note => note.id === selectedNote.value?.id);
    if (noteIndex !== -1) {
      localNotes.value[noteIndex] = { ...selectedNote.value };
      notesStore.setNotes(localNotes.value);
      saveNotesToLocalStorage();
    }
    closeNote();
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>