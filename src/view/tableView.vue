<!-- tableView.vue -->

<template>
  <div
    class="max-w-5xl mx-auto px-2 md:px-0 text-sm md:text-base mt-4 md:mt-0 select-none"
  >
    <div class="overflow-x-auto md:px-4 xl:px-0">
      <table
        class="min-w-[800px] w-full border-separate border-spacing-0 font-serif rounded-lg overflow-hidden"
      >
        <thead>
          <tr class="bg-cream-200 dark:bg-gray-800">
            <th
              v-if="uiStore.isSelectMode"
              class="p-3 text-left w-10 border-b-[1px] border-r-[1px] border-black dark:border-white"
            >
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="cursor-pointer"
              />
            </th>
            <th
              v-for="column in visibleColumns"
              :key="column"
              :class="{ 'hidden md:table-cell': column === 'Content' }"
              class="p-3 text-left border-b-[1px] border-r-[1px] border-black dark:border-white whitespace-nowrap"
            >
              <div class="flex items-center">
                <component
                  :is="getColumnIcon(column)"
                  :size="20"
                  class="mr-2"
                />
                <span>{{ column }}</span>
              </div>
            </th>
          </tr>
        </thead>
        <transition-group name="list" tag="tbody">
          <tr
            v-for="note in notes"
            :key="note.id"
            class="bg-cream-100 dark:bg-gray-750"
          >
            <td
              v-if="uiStore.isSelectMode"
              class="p-3 w-10 border-b-[1px] border-r-[1px] border-black dark:border-white"
            >
              <input
                type="checkbox"
                :checked="notesStore.selectedNotes.includes(note.id)"
                @change="toggleNoteSelection(note.id)"
                class="cursor-pointer"
              />
            </td>
            <td
              v-if="visibleColumns.includes('Title')"
              class="w-[250px] max-w-[190px] md:max-w-[250px] p-3 border-b-[1px] border-r-[1px] border-black dark:border-white relative group"
            >
              <div class="flex items-center">
                <div
                  class="w-full bg-transparent outline-none truncate"
                  :class="{ underline: note.pinned }"
                >
                  {{ note.title }}
                </div>
                <div @click="notesStore.openNote(note.id)">
                  <span
                    class="bg-cream-100 dark:bg-gray-800 hover:bg-cream-200 dark:hover:bg-gray-700 active:bg-cream-300 dark:active:bg-gray-700 rounded-lg border-[1px] border-black dark:border-white shadow-md hover:shadow-xl transition-all duration-300 text-sm ml-2 px-2 py-1 absolute right-2 top-1/2 transform -translate-y-1/2 group-hover:inline-block md:group-hover:inline-block md:hidden cursor-pointer"
                  >
                    <PhArrowSquareOut :size="20" />
                  </span>
                </div>
              </div>
            </td>
            <td
              v-if="visibleColumns.includes('Content') && !isMobile"
              class="p-3 border-b-[1px] border-r-[1px] border-black dark:border-white"
            >
              <div
                v-html="sanitizeHtml(truncatedContent(note.content))"
                class="w-full bg-transparent outline-none truncate-text content"
              ></div>
            </td>
            <td
              v-if="visibleColumns.includes('Folder')"
              @click="folderStore.setCurrentFolder(note.folder)"
              class="max-w-[200px] p-3 border-b-[1px] border-r-[1px] border-black dark:border-white cursor-pointer hover:underline"
            >
              <div class="flex items-center space-x-2 truncate">
                <component
                  :is="
                    note.folder.toLowerCase() === 'no folder'
                      ? PhFolderMinus
                      : PhFolder
                  "
                  :size="20"
                />
                <span class="truncate">{{ note.folder }}</span>
              </div>
            </td>
            <td
              v-if="visibleColumns.includes('Date')"
              class="p-3 border-b-[1px] border-r-[1px] border-black dark:border-white whitespace-nowrap"
            >
              {{ localeDate(note.last_edited) }}
            </td>
          </tr>
        </transition-group>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import {
    PhArrowSquareOut,
    PhFolder,
    PhFolderMinus,
    PhTextT,
    PhArticle,
    PhCalendar,
  } from '@phosphor-icons/vue';
  import { Note } from '@/store/notesStore/types';
  import { uiStore, notesStore, folderStore } from '@/store';
  import DOMPurify from 'dompurify';
  import { localeDate } from '@/store/notesStore/helpers';

  const props = defineProps<{
    notes: Note[];
  }>();

  const sanitizeHtml = (content: string) => {
    return DOMPurify.sanitize(content);
  };

  const truncatedContent = (content: string) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.innerHTML;
  };

  const getColumnIcon = (column: string) => {
    switch (column) {
      case 'Title':
        return PhTextT;
      case 'Content':
        return PhArticle;
      case 'Folder':
        return PhFolder;
      case 'Date':
        return PhCalendar;
      default:
        return null;
    }
  };

  const availableColumns = ['Title', 'Content', 'Folder', 'Date'];
  const visibleColumns = ref(availableColumns);
  const selectedNotes = ref<string[]>([]);
  const isMobile = ref(window.innerWidth < 768);

  const allSelected = computed(() => {
    return (
      props.notes.length > 0 &&
      notesStore.selectedNotes.length === props.notes.length
    );
  });

  const toggleSelectAll = () => {
    if (allSelected.value) {
      notesStore.clearSelectedNotes();
    } else {
      notesStore.selectAllNotes();
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    const index = notesStore.selectedNotes.indexOf(noteId);
    if (index === -1) {
      notesStore.toggleNoteSelection(noteId);
    } else {
      notesStore.toggleNoteSelection(noteId);
    }

    if (notesStore.selectedNotes.length > 0 && !uiStore.isSelectMode) {
      uiStore.isSelectMode = true;
    } else if (notesStore.selectedNotes.length === 0 && uiStore.isSelectMode) {
      uiStore.isSelectMode = false;
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

  watch(
    () => props.notes,
    () => {
      selectedNotes.value = [];
    },
    { deep: true }
  );

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  const handleResize = () => {
    isMobile.value = window.innerWidth < 768;
  };

  watch(
    () => notesStore.selectedNotes,
    () => {
      if (notesStore.selectedNotes.length === 0) {
        uiStore.isSelectMode = false;
      }
    }
  );
</script>

<style scoped>
  .overflow-x-auto {
    max-width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table {
    border: 1px solid black;
    min-width: 100%;
  }

  .dark table {
    border-color: white;
  }

  table th:first-child,
  table td:first-child {
    border-left: 0;
  }

  table th:last-child,
  table td:last-child {
    border-right: 0;
  }

  table tr:first-child th {
    border-top: 0;
  }

  table tr:last-child td {
    border-bottom: 0;
  }

  .line-clamp-1 {
    display: -webkit-box;
    line-clamp: 1;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .content p strong {
    font-size: 12px !important;
  }

  @media (max-width: 767px) {
    .hidden-mobile {
      display: none;
    }

    .group:hover button {
      display: inline-block;
    }
  }

  .truncate-text {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre-wrap;
  }
</style>
