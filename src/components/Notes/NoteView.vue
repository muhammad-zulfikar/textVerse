<template>
  <div v-if="store.showNoteModal && editedNote"
    class="fixed inset-0 flex items-center justify-center z-50 font-serif bg-black bg-opacity-30"
    :style="{ backdropFilter: 'blur(2px)' }">
    <div
      :class="['bg-cream dark:bg-gray-900 modal-content p-5 rounded-lg border-2 border-black dark:border-white relative flex flex-col', { 'w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3': !store.isFullScreen, 'w-full h-full': store.isFullScreen }]">
      <div class="absolute top-0 right-0 flex text-sm p-4">
        <button
          class="text-black dark:text-white hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none mr-6"
          @click="store.toggleFullScreen"> {{ store.isFullScreen ? 'Collapse' : 'Expand' }}
        </button>
        <button
          class="text-black dark:text-white hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none"
          @click="store.closeNote">Close
        </button>
      </div>
      <h1 class="text-xl text-black dark:text-white font-bold mb-4 mt-2">
        <input v-model="editedNote.title" class="w-full p-1 bg-transparent focus:outline-none" />
      </h1>
      <textarea v-model="editedNote.content"
        class="bg-cream dark:bg-gray-900 text-black dark:text-white w-full p-2 border-2 border-black dark:border-white rounded focus:outline-none flex-grow resize-none"
        rows="5"></textarea>
      <div class="flex justify-end mt-2" v-if="store.selectedNote">
        <div>
          <p class="text-gray-500 text-sm">{{ store.selectedNote.timeCreated }}</p>
        </div>
      </div>
      <div class="flex justify-between mt-6 text-sm">
        <div>
          <button
            class="text-black dark:text-white hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none mr-6"
            @click="store.downloadNote(editedNote)">Download
          </button>
          <button
            class="text-black dark:text-white hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none"
            @click="store.removeNoteInModal">Delete
          </button>
        </div>
        <div>
          <button
            class="text-black dark:text-white hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none"
            @click="saveNote">Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotesStore, Note } from '@/stores/ProductStore';
import { ref, watch } from 'vue';

const store = useNotesStore();

const editedNote = ref<Note | null>(null);

watch(() => store.selectedNote, (newValue) => {
  editedNote.value = newValue ? { ...newValue } : null;
  if (newValue) {
    store.showNoteModal = true;
  }
}, { immediate: true, deep: true });

const saveNote = () => {
  if (editedNote.value) {
    store.saveNote(editedNote.value);
  }
};
</script>
