<template>
  <div class="md:mx-auto md:max-w-5xl mx-2">
    <div
      class="flex card min-h-[800px] h-full rounded-lg border border-black dark:border-white overflow-hidden font-serif"
    >
      <!-- Sidebar -->
      <div
        v-if="!isMobileView || !actualSelectedNoteId"
        class="w-full md:w-1/4 overflow-y-auto rounded-l-lg select-none"
      >
        <div
          v-for="(note, index) in notes"
          :key="note.id"
          @click="selectNote(note.id)"
          :class="[
            'list px-4 py-3 cursor-pointer hover:bg-[#ebdfc0] dark:hover:bg-gray-700',
            {
              'bg-[#ebdfc0] dark:bg-gray-700': actualSelectedNoteId === note.id,
              'border-b border-black dark:border-white':
                index !== notes.length - 1,
            },
          ]"
        >
          <div class="flex justify-between">
            <h3 class="font-bold mb-1 truncate">
              {{ note.title || 'Untitled' }}
            </h3>
            <span
              v-if="note.pinned"
              @click.stop="notesStore.unpinNote(note.id)"
              class="justify-start px-2 py-1 hover:bg-[#d9c698] dark:hover:bg-gray-700 rounded-md card"
            >
              <PhPushPin
                v-if="hoveredNoteId !== note.id"
                :size="16"
                class="text-[10px] md:text-xs"
              />
              <PhPushPinSlash
                v-else
                :size="16"
                class="text-[10px] md:text-xs"
              />
            </span>
          </div>
          <p
            class="text-sm text-gray-600 dark:text-gray-300 truncate-text"
            v-html="sanitizeContent(note.content)"
          ></p>
          <div
            class="flex justify-between text-xs text-gray-700 dark:text-gray-400 mt-3 mb-1"
          >
            <div
              v-if="note.folder !== DEFAULT_FOLDERS.UNCATEGORIZED"
              class="flex-grow"
            >
              <div
                class="flex items-center w-fit px-2 py-1 cursor-pointer truncate card hover:text-black dark:hover:text-white hover:bg-[#d9c698] dark:hover:bg-gray-700"
                @click.stop="folderStore.setCurrentFolder(note.folder)"
              >
                <PhFolder :size="16" class="mr-2" />
                {{ note.folder }}
              </div>
            </div>
            <div
              class="flex items-center px-2 py-1 cursor-pointer truncate card hover:text-black dark:hover:text-white hover:bg-[#d9c698] dark:hover:bg-gray-700 ml-auto"
            >
              <PhCalendarBlank :size="16" class="mr-2" />
              {{ notesStore.localeDate(note.last_edited || note.time_created) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Note Content Area -->
      <div
        v-if="actualSelectedNoteId"
        :key="actualSelectedNoteId"
        class="w-full md:w-3/4 p-4 md:p-6 overflow-y-auto md:border-l border-black dark:border-white rounded-r-lg relative"
      >
        <div v-if="editedNote" class="h-full flex flex-col">
          <div class="flex justify-between items-center mb-4 md:mb-6 text-sm">
            <button
              v-if="isMobileView"
              @click="cancelNote"
              class="flex items-center px-2 py-1 card hover:bg-[#d9c698] dark:hover:bg-gray-700"
            >
              <PhCaretLeft :size="20" class="mr-2" />
              Back
            </button>
          </div>
          <input
            v-model="editedNote.title"
            placeholder="Title"
            class="text-2xl md:text-3xl font-bold w-full bg-transparent mb-1 outline-none placeholder-black dark:placeholder-white placeholder-opacity-50 dark:placeholder-opacity-30"
          />
          <div class="hidden md:flex justify-end items-center text-sm mb-4">
            <span class="ml-4 text-gray-600 dark:text-gray-300">
              Last edited:
              {{
                notesStore.localeDate(
                  editedNote.last_edited || editedNote.time_created
                )
              }}
            </span>
          </div>
          <div
            class="border-b border-gray-600 dark:border-gray-200 my-1 mb-3"
          ></div>
          <NoteForm
            v-model="editedNote.content"
            @update:modelValue="saveNote"
            class="h-full flex-grow overflow-y-auto"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
  import {
    PhCaretLeft,
    PhPushPin,
    PhPushPinSlash,
    PhFolder,
    PhCalendarBlank,
  } from '@phosphor-icons/vue';
  import { notesStore, uiStore, folderStore } from '@/utils/stores';
  import { Note } from '@/utils/types';
  import NoteForm from '@/components/notes/noteForm.vue';
  import { DEFAULT_FOLDERS } from '@/utils/constants';
  import DOMPurify from 'dompurify';

  const props = defineProps<{ notes: Note[] }>();

  const selectedNoteId = ref<string | null>(null);
  const hoveredNoteId = ref<string | null>(null);
  const isMobileView = ref(false);
  const editedNote = ref<Note | null>(null);
  const originalNote = ref<Note | null>(null);

  const actualSelectedNoteId = computed(() => selectedNoteId.value);

  const selectedNote = computed(() =>
    props.notes.find((note) => note.id === actualSelectedNoteId.value)
  );

  const hasChanges = computed(() => {
    if (!selectedNote.value || !editedNote.value) return false;
    return notesStore.hasChanged(originalNote.value!, { ...editedNote.value });
  });

  watch(selectedNote, (newNote) => {
    if (newNote) {
      editedNote.value = { ...newNote };
      originalNote.value = { ...newNote };
    } else {
      editedNote.value = null;
      originalNote.value = null;
    }
  });

  function selectNote(id: string) {
    selectedNoteId.value = id;
    const note = props.notes.find((note) => note.id === id);
    if (note) {
      editedNote.value = { ...note };
      originalNote.value = { ...note };
    }
  }

  async function saveNote() {
    if (editedNote.value && hasChanges.value) {
      try {
        await notesStore.updateNote(editedNote.value);
        originalNote.value = { ...editedNote.value };
      } catch (error) {
        uiStore.showToastMessage('Failed to update note. Please try again.');
      }
    }
  }

  const sanitizeContent = (content: string) => DOMPurify.sanitize(content);

  function handleResize() {
    isMobileView.value = window.innerWidth < 768;
    if (!isMobileView.value && !selectedNoteId.value) {
      selectNewestNote();
    }
  }

  function cancelNote() {
    selectedNoteId.value = null;
    editedNote.value = null;
    originalNote.value = null;
  }

  function selectNewestNote() {
    if (props.notes.length === 0) return;

    const newestNote = props.notes.reduce((newest, current) => {
      const newestDate = new Date(newest.last_edited || newest.time_created);
      const currentDate = new Date(current.last_edited || current.time_created);
      return currentDate > newestDate ? current : newest;
    });

    selectNote(newestNote.id);
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
</script>

<style scoped>
  .truncate-text {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre-wrap;
  }
</style>
