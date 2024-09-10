<template>
  <div class="mx-2 md:mx-4">
    <transition-group name="list" tag="ul" :class="[
      'relative min-w-[300px] md:mx-auto',
      {
        'columns-1 md:max-w-xl': uiStore.columns === 1,
        'columns-2 gap-2 md:gap-7 md:max-w-4xl': uiStore.columns === 2,
        'columns-3 sm:columns-2 md:columns-3 gap-8 md:max-w-6xl': uiStore.columns === 3,
        'columns-4 sm:columns-2 md:columns-3 lg:columns-4 gap-4': uiStore.columns === 4,
        'columns-5 sm:columns-2 md:columns-3 lg:columns-5 gap-2': uiStore.columns === 5,
      },
    ]">
      <li v-for="note in props.notes" :key="note.id"
        class="notes bg-cream dark:bg-gray-750 border-[1px] border-black dark:border-gray-400 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 break-inside-avoid h-min mb-[9px] p-2 cursor-pointer relative group select-none"
        :class="{
          'z-50': showMenu && notesStore.selectedNote?.id === note.id,
          shadow: note.pinned || notesStore.selectedNotes.includes(note.id),
          'border-[2px] dark:border-white': notesStore.selectedNotes.includes(note.id),
          [computedMb]: true,
        }" @contextmenu.prevent="(event) => showContextMenu(event, note)" @click.stop="handleNoteClick(note)">
        <div
          class="absolute top-0 -left-3 custom-card-rounded hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-opacity duration-200"
          :class="{
            'opacity-100': notesStore.selectedNotes.includes(note.id) || uiStore.isSelectMode,
            'opacity-0 group-hover:opacity-100': !notesStore.selectedNotes.includes(note.id) && !uiStore.isSelectMode,
          }" @click.stop="toggleNoteSelection(note.id)" style="transform: translateY(-50%)">
          <div class="p-1 rounded-full flex items-center justify-center" :class="{ 'bg-[#ebdfc0] dark:bg-gray-600': notesStore.selectedNotes.includes(note.id) }">
            <PhCheck :size="16" />
          </div>
        </div>
        <div class="flex justify-between items-start">
          <h1 class="font-bold text-sl font-serif cursor-pointer dark:text-white">
            {{ note.title }}
          </h1>
        </div>
        <div>
          <div class="font-serif text-sm mt-2 dark:text-white truncate-text content"
            v-html="sanitizeHtml(truncatedContent(note.content))"></div>
          <div
            class="flex justify-between items-center pt-3 mt-auto font-serif text-gray-700 dark:text-gray-400 text-xs">
            <div class="flex items-center">
              <span v-if="note.pinned" @click.stop="notesStore.unpinNote(note.id)"
                class="justify-start px-2 py-1 hover:bg-[#d9c698] dark:hover:bg-gray-700 rounded-md custom-card mr-2">
                <PhPushPin :size="16" class="text-[10px] md:text-xs" />
              </span>
              <span v-if="isNotePublic(note.id)" @click.stop="togglePublic(note.id)"
                class="justify-start px-2 py-1 hover:bg-[#d9c698] dark:hover:bg-gray-700 rounded-md custom-card">
                <PhGlobe :size="16" class="text-[10px] md:text-xs" />
              </span>
            </div>
            <div v-if="note.folder !== DEFAULT_FOLDERS.UNCATEGORIZED" class="ml-auto text-left text-[10px] md:text-xs">
              <p class="flex items-center px-2 py-1 cursor-pointer truncate custom-card hover:text-black dark:hover:text-white hover:bg-[#d9c698] dark:hover:bg-gray-700"
                @click.stop="folderStore.setCurrentFolder(note.folder)">
                <PhFolder :size="16" class="mr-2" />
                {{ note.folder }}
              </p>
            </div>
          </div>
        </div>
      </li>
    </transition-group>
    <Transition name="zoom">
      <ContextMenu v-if="selectedNote" :visible="showMenu" :position="menuPosition" :note="selectedNote"
        :noteId="selectedNote.id" @hideMenu="hideContextMenu" @edit="uiStore.openNote" @delete="confirmDelete"
        @pin="notesStore.pinNote" @unpin="notesStore.unpinNote" @share="togglePublic" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { PhPushPin, PhFolder, PhGlobe, PhCheck } from '@phosphor-icons/vue';
import { notesStore, folderStore, uiStore } from '@/utils/stores';
import { Note } from '@/utils/types';
import { DEFAULT_FOLDERS } from '@/utils/constants';
import ContextMenu from '@/components/ui/contextMenu.vue';
import DOMPurify from 'dompurify';

const computedMb = computed(() => {
  if (uiStore.columns === 4) {
    return 'md:mb-4';
  } else if (uiStore.columns === 5) {
    return 'md:mb-2';
  } else {
    return 'md:mb-8';
  }
});

const props = defineProps<{
  notes: Note[];
}>();

const showMenu = ref(false);
const menuPosition = ref({ x: 0, y: 0 });
const selectedNote = ref<Note | null>(null);

const isNotePublic = (noteId: string) => {
  return notesStore.publicNotes.has(noteId);
};

const togglePublic = (noteId: string) => {
  notesStore.togglePublic(noteId);
};

const sanitizeHtml = (content: string) => {
  return DOMPurify.sanitize(content);
};

const truncatedContent = (content: string) => {
  const div = document.createElement('div');
  div.innerHTML = content;
  return div.innerHTML;
};

const showContextMenu = (event: MouseEvent, note: Note) => {
  event.stopPropagation();
  uiStore.setActiveDropdown(showMenu.value ? 'create' : null);
  menuPosition.value = { x: event.clientX, y: event.clientY };
  showMenu.value = true;
  selectedNote.value = note;
};

const hideContextMenu = () => {
  showMenu.value = false;
};

const confirmDelete = async () => {
  try {
    if (selectedNote.value) {
      await notesStore.deleteNote(selectedNote.value.id);
    } else {
      console.error('No selected note to delete.');
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    uiStore.showToastMessage('Failed to delete note. Please try again.');
  } finally {
    hideContextMenu();
  }
};

const handleNoteClick = (note: Note) => {
  if (uiStore.isSelectMode) {
    toggleNoteSelection(note.id);
  } else {
    uiStore.openNote(note.id);
  }
};

const toggleNoteSelection = (noteId: string) => {
  if (notesStore.selectedNotes.includes(noteId)) {
    uiStore.isSelectMode = false;
    notesStore.removeSelectedNote(noteId);
  } else {
    uiStore.isSelectMode = true;
    notesStore.addSelectedNote(noteId);
  }
};

watch(
  () => uiStore.isSelectMode,
  (newValue) => {
    if (!newValue) {
      notesStore.clearSelectedNotes();
    }
  }
);

const handleOutsideClick = (event: MouseEvent) => {
  const clickedElement = event.target as HTMLElement;
  
  if (!clickedElement.closest('li') && !clickedElement.closest('.select-button')) {
    if (uiStore.isSelectMode) {
      uiStore.toggleSelectMode();
    }
    notesStore.clearSelectedNotes();
  }
};


onMounted(() => {
  window.addEventListener('click', handleOutsideClick);
  window.addEventListener('resize', uiStore.handleResize);
  uiStore.handleResize();
});

onUnmounted(() => {
  window.removeEventListener('click', handleOutsideClick);
  window.removeEventListener('resize', uiStore.handleResize);
});

</script>

<style scoped>
.truncate-text {
  display: -webkit-box;
  -webkit-line-clamp: 8;
  line-clamp: 8;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre-wrap;
}

@media (min-width: 640px) {
  .truncate-text {
    -webkit-line-clamp: 15;
    line-clamp: 15;
  }
}

.content :deep(p img) {
  margin: 10px auto !important;
  display: block;
}

.shadow {
  box-shadow:
    0 30px 60px -15px rgba(0, 0, 0, 0.3),
    0 12px 16px -8px rgba(0, 0, 0, 0.2);
}

.shadow:hover {
  box-shadow:
    0 30px 60px -15px rgba(0, 0, 0, 0.3),
    0 12px 16px -8px rgba(0, 0, 0, 0.2);
}

.notes:active {
  transform: scale(0.98);
}
</style>
