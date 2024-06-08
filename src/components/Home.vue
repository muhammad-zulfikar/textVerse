<template>
  <Header @update:modelValue="updateSearchQuery" />

  <div class="flex justify-end w-11/12 mx-auto mt-4">
    <div class="font-serif flex">
      <button 
        @click="undoDelete" 
        class="bg-blue-400 dark:bg-blue-700 text-black dark:text-white hover:text-white dark:hover:text-black 
        p-2 border-2 border-black dark:border-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 
        hover:shadow-xl outline-none mr-2"
      >
        Undo
      </button>
      <button 
        @click="deleteAllNotes"
        class="bg-red-400 dark:bg-red-700 text-black dark:text-white hover:text-white dark:hover:text-black 
        p-2 border-2 border-black dark:border-white rounded-lg hover:bg-red-700 dark:hover:bg-red-400 
        hover:shadow-xl outline-none"
      >
        Delete All
      </button>
    </div>
  </div>

  <ul class="w-11/12 mx-auto mt-8 mb-18 gap-8 columns-1 md:columns-3 lg:columns-4 2xl:w-7/12">
    <template v-for="(note, index) in filteredNotes" :key="note.id">
      <NoteCard :note="note" :index="index" :openNote="openNote" :removeNote="removeNote" />
    </template>
  </ul>

  <NoteView v-if="selectedNote" :note="selectedNote" @close="closeNote" @save="saveNote" />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useNotesStore, Note } from '@/stores/ProductStore';
import NoteCard from './Notes/NoteCard.vue';
import Header from './Header/Header.vue';
import NoteView from './Notes/NoteView.vue';
import { useToast } from "vue-toastification";

const toast = useToast();
const showToast = (message: string) => {
  toast(message, {
    toastClassName: 'toast-custom'
  });
};


const notesStore = useNotesStore();
const localNotes = ref<Note[]>([...notesStore.notes]);
const deletedNotes = ref<Note[]>([]);
const selectedNote = ref<Note | null>(null);
const searchQuery = ref('');
const defaultNotesDeleted = ref(false);
const undoStack = ref<Note[][]>([]);
const redoStack = ref<Note[][]>([]);

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
  const deletedNote = localNotes.value.splice(index, 1)[0];
  deletedNotes.value.push(deletedNote);
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
  showToast('Note saved!')
};

const deleteAllNotes = () => {
  undoStack.value.push([...localNotes.value]); // Store the current state in undoStack
  redoStack.value = []; // Clear redoStack
  deletedNotes.value.push(...localNotes.value); // Store all notes in deletedNotes
  localNotes.value = []; // Clear localNotes
  notesStore.setNotes([]); // Clear notes in store
  defaultNotesDeleted.value = true;
  showToast('Note deleted!')
};

const undoDelete = () => {
  if (deletedNotes.value.length > 0) {
    const lastDeletedNote = deletedNotes.value.pop();
    if (lastDeletedNote) {
      localNotes.value.push(lastDeletedNote);
      undoStack.value.push([...localNotes.value]);
      defaultNotesDeleted.value = false;
    }
  }
};
</script>