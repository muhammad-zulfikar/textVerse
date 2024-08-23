<!-- tableView.vue -->

<template>
  <div class="max-w-5xl mx-auto px-2 md:px-0 text-sm md:text-base mt-4 md:mt-0">
    <div
      class="flex justify-between items-center relative font-serif md:px-4 xl:px-0 mb-4 md:mb-0"
    >
      <div class="flex items-center">
        <div class="mr-2 md:mr-4">
          <Folder />
        </div>
      </div>
      <div class="flex items-center">
        <Dropdown
          dropdownId="showDropdown"
          contentWidth="w-fit"
          direction="down"
        >
          <template #label>
            <div
              class="flex items-center text-sm mr-2 md:mr-4 px-2 py-1.5 custom-card hover:bg-[#d9c698] dark:hover:bg-gray-700"
            >
              <PhEye :size="20" class="size-5 mr-2" />
              Show
            </div>
          </template>
          <div class="px-[3px]">
            <a
              v-for="column in filteredColumns"
              :key="column"
              @click.stop="toggleColumn(column)"
              class="text-sm px-3 py-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
              role="menuitem"
            >
              <input
                type="checkbox"
                :checked="visibleColumns.includes(column)"
                class="mr-2 cursor-pointer"
                @click.stop="toggleColumn(column)"
              />
              {{ column }}
            </a>
          </div>
        </Dropdown>
        <button
          @click="toggleSelectMode"
          class="flex items-center text-sm px-2 py-1.5 custom-card hover:bg-[#d9c698] dark:hover:bg-gray-700"
        >
          <PhCheckCircle :size="20" class="size-5 mr-2" />
          Select
        </button>
      </div>
    </div>
    <div class="overflow-x-auto md:px-4 xl:px-0">
      <table
        class="min-w-[800px] w-full border-separate border-spacing-0 font-serif rounded-lg overflow-hidden"
      >
        <thead>
          <tr class="bg-[#ebdfc0] dark:bg-gray-800">
            <th
              v-if="isSelectMode"
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
            class="bg-cream dark:bg-gray-750"
          >
            <td
              v-if="isSelectMode"
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
              class="w-[250px] p-3 border-b-[1px] border-r-[1px] border-black dark:border-white relative group"
            >
              <div class="flex items-center">
                <input
                  :value="note.title"
                  @input="updateNoteTitle(note, $event)"
                  @blur="saveNoteIfChanged(note)"
                  class="w-full bg-transparent outline-none"
                  :class="{ underline: note.pinned }"
                />
                <div @click="uiStore.openNote(note.id)">
                  <span
                    class="bg-[#ebdfc0] dark:bg-gray-800 hover:bg-[#d9c698] dark:hover:bg-gray-700 active:bg-cream dark:active:bg-gray-700 rounded-lg border-[1px] border-black dark:border-white shadow-md hover:shadow-xl transition-all duration-300 text-sm ml-2 px-2 py-1 absolute right-2 top-1/2 transform -translate-y-1/2 group-hover:inline-block md:group-hover:inline-block md:hidden cursor-pointer"
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
              class="p-3 border-b-[1px] border-r-[1px] border-black dark:border-white cursor-pointer hover:underline"
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
              {{ notesStore.localeDate(note.last_edited || note.time_created) }}
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
    PhEye,
    PhCheckCircle,
    PhArrowSquareOut,
    PhFolder,
    PhFolderMinus,
    PhTextT,
    PhArticle,
    PhCalendar,
  } from '@phosphor-icons/vue';
  import { Note } from '@/store/types';
  import { uiStore, notesStore, folderStore } from '@/store/stores';
  import Folder from '@/components/ui/dropdown/folderDropdown.vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DOMPurify from 'dompurify';

  const props = defineProps<{
    notes: Note[];
  }>();

  const updatedNotes = ref<{
    [key: string]: Partial<Note>;
  }>({});

  const updateNoteTitle = (note: Note, event: Event) => {
    const newTitle = (event.target as HTMLInputElement).value;
    if (!updatedNotes.value[note.id]) {
      updatedNotes.value[note.id] = { ...note };
    }
    updatedNotes.value[note.id].title = newTitle;
  };

  const sanitizeHtml = (content: string) => {
    return DOMPurify.sanitize(content);
  };

  const truncatedContent = (content: string) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    return div.innerHTML;
  };

  const saveNoteIfChanged = (note: Note) => {
    if (updatedNotes.value[note.id]) {
      const updatedNote = { ...note, ...updatedNotes.value[note.id] };
      if (notesStore.hasChanged(note, updatedNote)) {
        notesStore.updateNote(updatedNote);
      }
      delete updatedNotes.value[note.id];
    }
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
  const isSelectMode = ref(false);
  const selectedNotes = ref<string[]>([]);
  const isMobile = ref(window.innerWidth < 768);

  const filteredColumns = computed(() => {
    return isMobile.value
      ? availableColumns.filter((col) => col !== 'Content')
      : availableColumns;
  });

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
      notesStore.addSelectedNote(noteId);
    } else {
      notesStore.removeSelectedNote(noteId);
    }

    if (notesStore.selectedNotes.length > 0 && !isSelectMode.value) {
      isSelectMode.value = true;
    } else if (notesStore.selectedNotes.length === 0 && isSelectMode.value) {
      isSelectMode.value = false;
    }
  };

  const toggleColumn = (column: string) => {
    if (visibleColumns.value.includes(column)) {
      visibleColumns.value = visibleColumns.value.filter((c) => c !== column);
    } else {
      visibleColumns.value.push(column);
    }
    visibleColumns.value.sort(
      (a, b) => availableColumns.indexOf(a) - availableColumns.indexOf(b)
    );
  };

  const toggleSelectMode = () => {
    isSelectMode.value = !isSelectMode.value;
    if (!isSelectMode.value) {
      notesStore.clearSelectedNotes();
    }
  };

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
        isSelectMode.value = false;
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
