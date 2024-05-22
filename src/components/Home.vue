<template>
  <div>
    <Header @update:modelValue="updateSearchQuery" />
    <draggable v-model="filteredNotes" :animation="300" tag="ul" @end="onEndDrag"
      class="w-11/12 mx-auto mt-10 mb-20 gap-8 columns-1 md:columns-3 lg:columns-4 2xl:w-7/12" :delay="dragDelay"
      :delay-on-touch-only="true">
      <template #item="{ element: note, index }">
        <li :key="note.id" @touchstart="onTouchStart" @touchend="onTouchEnd" @mousedown="onMouseDown"
          @mouseup="onMouseUp">
          <NoteCard :note="note" :index="index" :removeNote="removeNote" />
        </li>
      </template>
    </draggable>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useNotesStore } from '@/stores/ProductStore';
import NoteCard from './Notes/NoteCard.vue';
import draggable from 'vuedraggable';
import Header from './Notes/Header.vue';

const notesStore = useNotesStore();
const localNotes = ref([...notesStore.notes]);
const dragDelay = ref(0);
const isMobile = ref(false);
const dragTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const searchQuery = ref('');

const filteredNotes = computed(() =>
  localNotes.value.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
);

watch(
  () => notesStore.notes,
  (newNotes) => {
    localNotes.value = [...newNotes];
  },
  { deep: true }
);

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
  isMobile.value = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile.value) {
    dragDelay.value = 300;
  }
});

watch(
  localNotes,
  () => {
    saveNotesToLocalStorage();
  },
  { deep: true }
);

const onEndDrag = () => {
  notesStore.setNotes(localNotes.value);
  saveNotesToLocalStorage();
};

const removeNote = (index: number) => {
  notesStore.removeNote(index);
};

const onTouchStart = () => {
  if (isMobile.value) {
    dragTimer.value = setTimeout(() => {
      dragDelay.value = 0;
    }, 300);
  }
};

const onTouchEnd = () => {
  if (isMobile.value && dragTimer.value) {
    clearTimeout(dragTimer.value);
    dragDelay.value = 300;
  }
};

const onMouseDown = () => { };

const onMouseUp = () => { };

const updateSearchQuery = (query: string) => {
  searchQuery.value = query;
};
</script>
