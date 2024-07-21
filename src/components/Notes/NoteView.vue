<!-- NoteView.vue -->

<template>
  <div
    v-if="store.showNoteModal && editedNote"
    class="fixed inset-0 flex items-center justify-center z-50 font-serif bg-black bg-opacity-30 backdrop-blur-[2px]"
    @click="handleOutsideClick"
  >
    <div
      @click.stop
      :class="[
        'custom-card-no-transition p-5 relative flex flex-col',
        {
          'w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3': !store.isFullScreen,
          'w-full h-full rounded-none border-none': store.isFullScreen,
        },
      ]"
    >
      <div class="absolute top-0 right-1 flex text-sm p-4 select-none">
        <button
          class="hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none mr-6"
          @click="store.toggleFullScreen"
        >
          {{ store.isFullScreen ? 'Collapse' : 'Expand' }}
        </button>
        <button
          class="hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none"
          @click="store.closeNote"
        >
          Close
        </button>
      </div>
      <h1 class="text-xl font-bold mb-4 mt-8">
        <input
          v-model="editedNote.title"
          class="w-full bg-transparent p-1 border-0 border-b-[1px] md:border-b-2 border-black dark:border-white outline-none"
        />
      </h1>
      <textarea
        v-model="editedNote.content"
        class="w-full bg-transparent p-2 border-[1px] md:border-2 border-black dark:border-white rounded focus:outline-none flex-grow resize-none"
        rows="5"
      ></textarea>
      <div class="flex justify-end mt-2 select-none" v-if="store.selectedNote">
        <div>
          <p class="text-gray-500 text-sm">
            {{ store.selectedNote.timeCreated }}
          </p>
        </div>
      </div>
      <div class="flex justify-between mt-6 text-sm select-none">
        <div>
          <button
            class="hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none mr-6"
            @click="store.downloadNote(editedNote)"
          >
            Download
          </button>
          <button
            class="text-red-500 hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none"
            @click="openDeleteAlert"
          >
            Delete
          </button>
        </div>
        <div>
          <button
            :disabled="!isModified"
            @click.prevent="saveNote"
            :class="[
              'dark:hover:bg-transparent outline-none text-sm select-none',
              {
                'hover:underline cursor-pointer': isModified,
                'text-gray-500': !isModified,
              },
            ]"
          >
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  <AlertModal
    :is-open="isAlertOpen"
    :message="alertMessage"
    @confirm="handleAlertConfirm"
    @cancel="handleAlertCancel"
  />
</template>

<script setup lang="ts">
  import { ref, watch, computed, nextTick } from 'vue';
  import { useNotesStore } from '@/store/store';
  import { Note } from '@/store/types';
  import AlertModal from '../Modal/AlertModal.vue';

  const store = useNotesStore();

  const editedNote = ref<Note | null>(null);
  const isAlertOpen = ref(false);
  const alertMessage = ref('');

  const isModified = computed(() => {
    if (!editedNote.value || !store.selectedNote) return false;

    return (
      editedNote.value.title !== store.selectedNote.title ||
      editedNote.value.content !== store.selectedNote.content
    );
  });

  const saveNote = () => {
    if (editedNote.value && isModified.value) {
      store.saveNote(editedNote.value);
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget && !isModified.value) {
      store.closeNote();
    }
  };

  const openDeleteAlert = async () => {
    if (store.selectedNote) {
      store.showNoteModal = false;
      await nextTick();
      alertMessage.value = `Are you sure you want to delete the note "${store.selectedNote.title}"?`;
      isAlertOpen.value = true;
    }
  };

  const handleAlertConfirm = () => {
    store.removeNoteInModal();
    isAlertOpen.value = false;
  };

  const handleAlertCancel = () => {
    isAlertOpen.value = false;
  };

  watch(
    () => store.selectedNote,
    (newValue) => {
      editedNote.value = newValue ? { ...newValue } : null;
      if (newValue) {
        store.showNoteModal = true;
      }
    },
    { immediate: true, deep: true }
  );
</script>
