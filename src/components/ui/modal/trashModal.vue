<template>
  <ModalBackdrop v-model="props.isOpen" />
  <transition name="zoom">
    <div
      v-if="props.isOpen"
      class="fixed inset-0 z-40 flex items-center justify-center"
    >
      <div @click="closeModal" class="absolute inset-0"></div>
      <div
        @click.stop
        class="card z-50 font-serif p-5 relative flex flex-col w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-[90vh] overflow-y-auto"
      >
        <div class="flex justify-between mb-2">
          <h1 class="text-xl font-bold">Trash</h1>
          <button
            @click="closeModal"
            class="px-2 py-1 card flex items-center hover:bg-cream-300 dark:hover:bg-gray-700"
          >
            <PhX :size="20" />
          </button>
        </div>

        <p class="text-sm text-gray-800 dark:text-gray-400">
          Notes in trash will be permanently deleted after 30 days.
        </p>

        <div
          class="bg-black dark:bg-gray-400 h-px transition-all duration-300 my-4"
        ></div>

        <div class="mb-4 flex justify-between items-center">
          <div
            class="px-3 md:px-2 py-1 card flex items-center hover:bg-cream-300 dark:hover:bg-gray-700 cursor-pointer"
          >
            <button @click="toggleSelectAll" class="flex text-sm">
              <PhCheckCircle :size="20" class="md:mr-2" />
              <span class="hidden md:flex">
                {{ isAllSelected ? 'Deselect All' : 'Select All' }}
              </span>
            </button>
          </div>
          <div class="flex">
            <div
              class="px-3 md:px-2 py-1 card flex items-center hover:bg-cream-300 dark:hover:bg-gray-700 cursor-pointer mr-4"
            >
              <button
                @click="restoreSelectedNotes"
                class="flex text-sm cursor-pointer"
                :disabled="!hasSelectedNotes"
              >
                <PhArrowCounterClockwise :size="20" class="md:mr-2" />
                <span class="hidden md:flex">Restore Selected</span>
              </button>
            </div>
            <div
              class="px-3 md:px-2 py-1 card flex items-center hover:bg-red-800 cursor-pointer group"
            >
              <button
                @click="confirmDeleteSelectedNotes"
                class="flex text-sm text-red-500 cursor-pointer group-hover:text-red-200 transition-all duration-300"
                :disabled="!hasSelectedNotes"
              >
                <PhTrash :size="20" class="md:mr-2" />
                <span class="hidden md:flex">Delete Selected</span>
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="deletedNotes.length === 0"
          class="text-center min-h-[200px] pt-[64px]"
        >
          Trash is empty.
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="note in deletedNotes"
            :key="note.id"
            class="flex items-start"
          >
            <input
              v-if="showCheckboxes"
              type="checkbox"
              :checked="selectedNotes.includes(note.id)"
              @change="toggleNoteSelection(note.id)"
              class="mr-4 mt-9 cursor-pointer"
            />
            <div class="flex-grow min-w-0 card cursor-pointer px-3">
              <div class="note-wrapper">
                <div @click="toggleNoteOptions(note.id)">
                  <h3 class="font-bold truncate mt-3">{{ note.title }}</h3>
                  <p class="text-sm truncate">{{ note.content }}</p>
                  <div class="text-[12px] md:text-xs text-gray-500 mb-4">
                    <span>Folder: {{ note.folder }}</span>
                    |
                    <span>Deleted: {{ formatDate(note.time_deleted) }}</span>
                  </div>
                </div>
                <transition name="expand">
                  <div
                    v-if="expandedNoteId === note.id"
                    class="expanded-content flex justify-center space-x-2"
                  >
                    <button
                      @click="restoreNote(note.id)"
                      class="flex justify-center text-center w-full p-2 card text-sm mb-4 hover:bg-cream-300 dark:hover:bg-gray-700"
                    >
                      <PhArrowCounterClockwise :size="20" class="md:mr-2" />
                      Restore
                    </button>
                    <button
                      @click="confirmDeleteNote(note.id)"
                      class="flex justify-center text-center w-full p-2 card text-sm mb-4 text-red-500 hover:text-red-200 hover:bg-red-800"
                    >
                      <PhTrash :size="20" class="md:mr-2" />
                      Delete
                    </button>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>

  <AlertModal
    :is-open="showDeleteConfirmation"
    :message="`Are you sure you want to delete this note?`"
    @cancel="showDeleteConfirmation = false"
    @confirm="deleteNote"
  />

  <AlertModal
    :is-open="showDeleteSelectedConfirmation"
    :message="`Are you sure you want to delete ${selectedNotes.length} note(s)?`"
    @cancel="showDeleteSelectedConfirmation = false"
    @confirm="deleteSelectedNotes"
  />
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import {
    PhTrash,
    PhArrowCounterClockwise,
    PhCheckCircle,
    PhX,
  } from '@phosphor-icons/vue';
  import { notesStore, uiStore } from '@/store';
  import ModalBackdrop from '@/components/ui/modal/backdropModal.vue';
  import AlertModal from '@/components/ui/modal/alertModal.vue';

  const props = defineProps<{
    isOpen: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'update:isOpen', value: boolean): void;
  }>();

  const localIsOpen = ref(props.isOpen);

  watch(
    () => props.isOpen,
    (newValue) => {
      localIsOpen.value = newValue;
    }
  );

  const closeModal = () => {
    localIsOpen.value = false;
    emit('update:isOpen', false);
  };

  const selectedNotes = ref<string[]>([]);
  const showCheckboxes = ref(false);
  const expandedNoteId = ref<string | null>(null);
  const showDeleteConfirmation = ref(false);
  const showDeleteSelectedConfirmation = ref(false);
  const noteToDelete = ref<string | null>(null);

  const confirmDeleteNote = (noteId: string) => {
    noteToDelete.value = noteId;
    showDeleteConfirmation.value = true;
  };

  const confirmDeleteSelectedNotes = () => {
    showDeleteSelectedConfirmation.value = true;
  };

  const deletedNotes = computed(() => notesStore.deletedNotes);

  const isAllSelected = computed(
    () => selectedNotes.value.length === deletedNotes.value.length
  );

  const hasSelectedNotes = computed(() => selectedNotes.value.length > 0);

  const toggleSelectAll = () => {
    if (isAllSelected.value) {
      selectedNotes.value = [];
    } else {
      selectedNotes.value = deletedNotes.value.map((note) => note.id);
    }
    showCheckboxes.value = !showCheckboxes.value;
  };

  const toggleNoteSelection = (noteId: string) => {
    const index = selectedNotes.value.indexOf(noteId);
    if (index === -1) {
      selectedNotes.value.push(noteId);
    } else {
      selectedNotes.value.splice(index, 1);
    }
  };

  const toggleNoteOptions = (noteId: string) => {
    expandedNoteId.value = expandedNoteId.value === noteId ? null : noteId;
  };

  const restoreNote = async (noteId: string) => {
    await notesStore.restoreNote(noteId);
    uiStore.showToastMessage('Note restored successfully');
  };

  const deleteNote = async () => {
    if (noteToDelete.value !== null) {
      await notesStore.permanentlyDeleteNote(noteToDelete.value);
      uiStore.showToastMessage('Note permanently deleted');
      showDeleteConfirmation.value = false;
      noteToDelete.value = null;
    }
  };

  const restoreSelectedNotes = async () => {
    for (const noteId of selectedNotes.value) {
      await notesStore.restoreNote(noteId);
    }
    selectedNotes.value = [];
    uiStore.showToastMessage('Selected notes restored successfully');
  };

  const deleteSelectedNotes = async () => {
    for (const noteId of selectedNotes.value) {
      await notesStore.permanentlyDeleteNote(noteId);
    }
    selectedNotes.value = [];
    uiStore.showToastMessage('Selected notes permanently deleted');
    showDeleteConfirmation.value = false;
  };

  function formatDate(date?: string | Date): string {
    if (!date) return 'No date available';
    return new Date(date).toLocaleDateString();
  }
</script>

<style scoped>
  .truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
