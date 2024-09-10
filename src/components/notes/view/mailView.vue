<template>
  <div class="md:mx-auto md:max-w-5xl mx-2">
    <div
      class="flex custom-card min-h-[800px] h-full rounded-lg border border-black dark:border-white overflow-hidden font-serif">
      <!-- Sidebar -->
      <div v-if="!isMobileView || !actualSelectedNoteId"
        class="w-full md:w-1/4 overflow-y-auto rounded-l-lg select-none">
        <TransitionGroup name="list" tag="div">
          <div v-for="(note, index) in notesToDisplay" :key="note.id" @click="selectNote(note.id)"
            class="list px-4 py-3 cursor-pointer hover:bg-[#ebdfc0] dark:hover:bg-gray-700" :class="{
              'bg-[#ebdfc0] dark:bg-gray-700': actualSelectedNoteId === note.id,
              'border-b border-black dark:border-white':
                index !== notesToDisplay.length - 1,
            }">
            <div class="flex justify-between">
              <h3 class="font-bold mb-1 truncate">{{ note.title || 'Untitled' }}</h3>
              <span v-if="note.pinned" @click.stop="notesStore.unpinNote(note.id)" @mouseenter="hoverPin = true"
                @mouseleave="hoverPin = false"
                class="justify-start px-2 py-1 hover:bg-[#d9c698] dark:hover:bg-gray-700 rounded-md custom-card">
                <PhPushPin v-if="!hoverPin" :size="16" class="text-[10px] md:text-xs" />
                <PhPushPinSlash v-else :size="16" class="text-[10px] md:text-xs" />
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-300 truncate-text">
              <span v-html="sanitizeContent(note.content)"></span>
            </p>
            <div class="flex justify-between text-xs text-gray-700 dark:text-gray-400 mt-3 mb-1">
              <div v-if="note.folder !== DEFAULT_FOLDERS.UNCATEGORIZED" class="flex-grow">
                <div
                  class="flex items-center w-fit px-2 py-1 cursor-pointer truncate custom-card hover:text-black dark:hover:text-white hover:bg-[#d9c698] dark:hover:bg-gray-700"
                  @click.stop="folderStore.setCurrentFolder(note.folder)">
                  <PhFolder :size="16" class="mr-2" />
                  {{ note.folder }}
                </div>
              </div>
              <div
                class="flex items-center px-2 py-1 cursor-pointer truncate custom-card hover:text-black dark:hover:text-white hover:bg-[#d9c698] dark:hover:bg-gray-700 ml-auto">
                <PhCalendarBlank :size="16" class="mr-2" />
                {{
                  notesStore.localeDate(note.last_edited || note.time_created)
                }}
              </div>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <!-- Note Content Area -->
      <div v-if="
        (!isMobileView && actualSelectedNoteId) ||
        (isMobileView && actualSelectedNoteId)
      " :key="actualSelectedNoteId"
        class="w-full md:w-3/4 p-4 md:p-6 overflow-y-auto md:border-l border-black dark:border-white rounded-r-lg relative">
        <div v-if="editedNote" class="h-full flex flex-col">
          <div class="flex justify-between items-center mb-4 md:mb-6 text-sm">
            <div class="flex">
              <button v-if="isMobileView" @click="cancelNote"
                class="flex items-center px-2 py-1 custom-card hover:bg-[#d9c698] dark:hover:bg-gray-700">
                <PhCaretLeft :size="20" class="mr-2" />
                Back
              </button>
            </div>
            <div class="flex justify-end text-sm">
              <button @click="moveToTrash"
                class="flex items-center px-2 py-1 mr-2 custom-card text-red-500 hover:text-red-300 hover:bg-red-700">
                <PhTrash :size="20" class="mr-2" />
                Delete
              </button>
              <button @click="saveNote" :class="[
                'flex items-center px-2 py-1 custom-card',
                {
                  'text-blue-500 hover:text-blue-300 hover:bg-blue-700':
                    hasChanges,
                  'text-gray-400 cursor-default': !hasChanges,
                },
              ]" :disabled="!hasChanges">
                <PhFloppyDisk :size="20" class="mr-2" />
                Save
              </button>
            </div>
          </div>
          <div class="mb-2 text-sm">
            <input v-model="editedNote.title" placeholder="Title"
              class="text-2xl md:text-3xl font-bold w-full bg-transparent mb-1 outline-none placeholder-black dark:placeholder-white placeholder-opacity-50 dark:placeholder-opacity-30" />
          </div>
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
          <div class="border-b border-gray-600 dark:border-gray-200 my-1 mb-3"></div>
          <div ref="quillEditorRef" class="w-full flex-grow"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { PhFloppyDisk, PhTrash, PhCaretLeft, PhPushPin, PhPushPinSlash, PhFolder, PhCalendarBlank } from '@phosphor-icons/vue';
import { notesStore, uiStore, folderStore } from '@/utils/stores';
import { Note } from '@/utils/types';
import { DEFAULT_FOLDERS } from '@/utils/constants';
import DOMPurify from 'dompurify';

const props = defineProps<{
  notes: Note[];
}>();

const actualSelectedNoteId = computed(() =>
  isMobileView.value ? selectedNoteId.value : desktopSelectedNoteId.value
);

const selectedNoteId = ref<string | null>(null);
const isMobileView = ref(false);
const selectedFolder = ref('');
const editedNote = ref<Note | null>(null);
const desktopSelectedNoteId = ref<string | null>(null);
const originalNote = ref<Note | null>(null);
const quillEditorRef = ref<HTMLElement | null>(null);
const quillEditor = ref<any | null>(null);

const hoverPin = ref(false);

let Quill: any;

const selectedNote = computed(() =>
  props.notes.find((note) => note.id === actualSelectedNoteId.value)
);

const hasChanges = computed(() => {
  if (!selectedNote.value) return false;
  return notesStore.hasChanged(originalNote.value!, {
    ...editedNote.value!,
    content: quillEditor.value ? quillEditor.value.root.innerHTML : '',
  });
});

const notesToDisplay = computed(() => {
  return props.notes;
});

watch(selectedNote, (newNote) => {
  if (newNote) {
    editedNote.value = { ...newNote };
    originalNote.value = { ...newNote };
    selectedFolder.value = newNote.folder;
    nextTick(() => {
      if (quillEditor.value) {
        quillEditor.value.root.innerHTML = newNote.content;
      }
    });
  } else {
    editedNote.value = null;
    originalNote.value = null;
  }
});

async function loadQuill() {
  if (!Quill) {
    const quillModule = await import('quill');
    Quill = quillModule.default;
  }
}

function destroyQuillEditor() {
  if (quillEditor.value) {
    quillEditor.value.off('text-change');
    quillEditor.value = null;
  }
  if (quillEditorRef.value) {
    quillEditorRef.value.innerHTML = '';
  }
}

async function initializeQuillEditor() {
  if (quillEditorRef.value && Quill) {
    if (quillEditor.value) {
      destroyQuillEditor();
    }

    quillEditor.value = new Quill(quillEditorRef.value, {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ align: [] }, { indent: '-1' }, { indent: '+1' }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ color: [] }, { background: [] }],
          ['clean'],
        ],
      },
    });

    quillEditor.value.on(
      'text-change',
      (_delta: any, _oldDelta: any, source: string) => {
        if (source === 'user' && quillEditor.value && editedNote.value) {
          editedNote.value.content = quillEditor.value.root.innerHTML;
        }
      }
    );

    if (editedNote.value) {
      quillEditor.value.root.innerHTML = editedNote.value.content;
    }
  }
}

async function selectNote(id: string) {
  const isNewSelection =
    (isMobileView.value && selectedNoteId.value !== id) ||
    (!isMobileView.value && desktopSelectedNoteId.value !== id);

  if (isMobileView.value) {
    selectedNoteId.value = id;
  } else {
    desktopSelectedNoteId.value = id;
  }

  const note = props.notes.find((note) => note.id === id);
  if (note) {
    editedNote.value = { ...note };
    originalNote.value = { ...note };

    if (isNewSelection) {
      await nextTick();
      await initializeQuillEditor();
    }
  }
}

watch(
  () => props.notes,
  (newNotes) => {
    if (!isMobileView.value && newNotes.length && !selectedNoteId.value) {
      selectNewestNote();
    }
  },
  { immediate: true }
);

async function saveNote() {
  if (editedNote.value && hasChanges.value) {
    const noteToSave = {
      ...editedNote.value,
      content: quillEditor.value ? quillEditor.value.root.innerHTML : '',
    };
    try {
      await notesStore.updateNote(noteToSave);
      originalNote.value = { ...noteToSave };
    } catch (error) {
      uiStore.showToastMessage('Failed to update note. Please try again.');
    }
  }
}

const moveToTrash = async () => {
  try {
    if (selectedNote.value) {
      await notesStore.deleteNote(selectedNote.value.id);
      deselectNote();
      selectNewestNote();
    }
  } catch (error) {
    uiStore.showToastMessage('Failed to delete note. Please try again.');
  }
};

const sanitizeContent = (content: string) => {
  const sanitized = DOMPurify.sanitize(content);
  return sanitized;
};

function handleResize() {
  const newIsMobileView = window.innerWidth < 768;
  if (isMobileView.value !== newIsMobileView) {
    isMobileView.value = newIsMobileView;
    if (newIsMobileView) {
      selectedNoteId.value = null;
      editedNote.value = null;
      destroyQuillEditor();
    } else {
      if (desktopSelectedNoteId.value === null) {
        selectNewestNote();
      } else {
        selectNote(desktopSelectedNoteId.value);
      }
    }
  }
}

function deselectNote() {
  if (isMobileView.value) {
    selectedNoteId.value = null;
  } else {
    desktopSelectedNoteId.value = null;
  }
  editedNote.value = null;
  originalNote.value = null;
  destroyQuillEditor();
}

function cancelNote() {
  if (isMobileView.value) {
    deselectNote();
  } else {
    selectNewestNote();
  }
}

function selectNewestNote(): string | null {
  if (props.notes.length === 0) return null;

  const newestNote = props.notes.reduce((newest, current) => {
    const newestDate = new Date(newest.last_edited || newest.time_created);
    const currentDate = new Date(current.last_edited || current.time_created);
    return currentDate > newestDate ? current : newest;
  }, props.notes[0]);

  if (newestNote) {
    if (!isMobileView.value) {
      desktopSelectedNoteId.value = newestNote.id;
      editedNote.value = { ...newestNote };
      originalNote.value = { ...newestNote };
      nextTick(() => {
        initializeQuillEditor();
      });
    }
    return newestNote.id;
  }

  return null;
}

function initializeView() {
  handleResize();
  if (!isMobileView.value && props.notes.length) {
    selectNewestNote();
  }
}

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  initializeView();
  await loadQuill();
  if (editedNote.value) {
    await initializeQuillEditor();
  }
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  destroyQuillEditor();
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
