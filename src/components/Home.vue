<template>
  <Header @update:modelValue="updateSearchQuery" />

  <draggable 
    v-model="draggableNotes" 
    :animation="300" 
    :item-key="index" 
    tag="ul" 
    @end="onEndDrag"
    class="w-11/12 mx-auto mt-4 mb-20 gap-8 columns-1 md:columns-3 lg:columns-4 2xl:w-7/12"
    :handle="'.drag-handle'">
    <template #item="{ element: note, index }">
      <NoteCard :key="note.id" :note="note" :index="index" :removeNote="removeNote" :openNote="openNote" />
    </template>
  </draggable>

  <div v-if="selectedNote" class="modal fixed inset-0 flex items-center justify-center z-50" @click.self="saveNote">
    <div :style="{ backgroundColor: selectedNote.color }"
      class="modal-content w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 p-5 rounded-lg border-2 border-black relative">
      <div class="flex justify-end">
        <button class="flex-shrink-0 w-6 h-6 cursor-pointer" @click="closeNote">
          <img src="@/assets/close.svg" class="w-full h-full" alt="Close" />
        </button>
      </div>
      <h1 class="text-xl font-bold mb-4">
        <input v-model="selectedNote.title"
          class="w-full p-1 bg-transparent border-0 border-b-2 border-black focus:outline-none" />
        <span class="flex justify-end font-normal text-sm text-gray-500 mt-1">{{ selectedNote.title.length }} /
          50</span>
      </h1>
      <textarea v-model="selectedNote.content"
        class="w-full p-2 bg-white border-2 border-black rounded focus:outline-none" rows="5"
        :style="{ backgroundColor: selectedNote.color }"></textarea>
      <span class="flex justify-end text-sm text-gray-500">{{ selectedNote.content.length }} / 5000</span>
      <div class="flex justify-between mt-2">
        <div class="flex gap-2">
          <button class="flex-shrink-0 w-6 h-6 cursor-pointer" @click="downloadNote">
            <img src="@/assets/download.svg" class="w-full h-full" alt="Download" />
          </button>
          <button class="flex-shrink-0 w-6 h-6 cursor-pointer" @click="removeNote(selectedNote.id)">
            <img src="@/assets/delete.svg" class="w-full h-full" alt="Delete" />
          </button>
        </div>
        <div>
          <p class="text-gray-500 text-sm">Last updated at {{ selectedNote.timeCreated }}</p>
        </div>
      </div>
    </div>
  </div>

</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useNotesStore, Note } from '@/stores/ProductStore';
import draggable from 'vuedraggable';
import NoteCard from './Notes/NoteCard.vue';
import Header from './Notes/Header.vue';

const notesStore = useNotesStore();
const localNotes = ref<Note[]>([...notesStore.notes]);
const selectedNote = ref<Note | null>(null);
const searchQuery = ref('');
const draggableNotes = ref<Note[]>([]);

const updateSearchQuery = (query: string) => {
  searchQuery.value = query;
};

const filteredNotes = computed(() => {
  if (searchQuery.value.trim() === '') {
    return draggableNotes.value;
  } else {
    return draggableNotes.value.filter((note) => {
      const title = note.title ? note.title.toLowerCase() : '';
      const content = note.content ? note.content.toLowerCase() : '';
      return title.includes(searchQuery.value.toLowerCase()) || content.includes(searchQuery.value.toLowerCase());
    });
  }
});

watch(localNotes, () => {
  if (searchQuery.value.trim() === '') {
    draggableNotes.value = [...localNotes.value];
  } else {
    draggableNotes.value = [...filteredNotes.value];
  }
}, { deep: true });

onMounted(() => {
  // Set draggableNotes initially based on whether searchQuery is empty or not
  draggableNotes.value = searchQuery.value.trim() === '' ? [...localNotes.value] : [...filteredNotes.value];
});

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
  closeNote();
};

const downloadNote = () => {
  if (selectedNote.value) {
    const { title, content, timeCreated } = selectedNote.value;
    const filename = `${title} - ${timeCreated}.txt`;
    const blob = new Blob([`Title: ${title}\nTime Created: ${timeCreated}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

const openNote = (index: number) => {
  selectedNote.value = localNotes.value[index];
};

const closeNote = () => {
  selectedNote.value = null;
};

const saveNote = () => {
  if (selectedNote.value) {
    const currentTime = new Date().toLocaleString("sk-SK", {
      day: '2-digit',
      month: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    });
    selectedNote.value.timeCreated = currentTime;
    closeNote();
  }
};

</script>



<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>