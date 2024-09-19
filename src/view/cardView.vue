<template>
  <div class="mx-2 md:mx-4">
    <transition-group
      name="list"
      tag="ul"
      :class="[
        'relative min-w-[300px] md:mx-auto',
        {
          'columns-1 md:max-w-xl': uiStore.columns === 1,
          'columns-2 gap-2 md:gap-7 md:max-w-4xl': uiStore.columns === 2,
          'columns-3 sm:columns-2 md:columns-3 gap-8 md:max-w-6xl':
            uiStore.columns === 3,
          'columns-4 sm:columns-2 md:columns-3 lg:columns-4 gap-4':
            uiStore.columns === 4,
          'columns-5 sm:columns-2 md:columns-3 lg:columns-5 gap-2':
            uiStore.columns === 5,
        },
      ]"
    >
      <li
        v-for="(note, index) in props.notes"
        :key="note.id"
        class="notes card break-inside-avoid h-min mb-[9px] p-2 cursor-pointer relative group select-none transform-gpu"
        :class="{
          'z-50': showMenu && notesStore.selectedNote?.id === note.id,
          shadow: note.pinned,
          selected: notesStore.selectedNotes.includes(note.id),
          [computedMb]: true,
        }"
        @contextmenu.prevent="(event) => showContextMenu(event, note)"
        @click.stop="handleNoteClick(note)"
        @mousemove="(event) => handleMouseMove(event, index)"
        @mouseleave="() => handleMouseLeave(index)"
        :ref="
          (el) => {
            if (el) setCardRef(el, index);
          }
        "
      >
        <div
          class="absolute top-0 -left-3 card-rounded hover:bg-cream-200 dark:hover:bg-gray-700 transition-opacity duration-200"
          :class="{
            'opacity-100':
              notesStore.selectedNotes.includes(note.id) ||
              uiStore.isSelectMode,
            'opacity-0 group-hover:opacity-100':
              !notesStore.selectedNotes.includes(note.id) &&
              !uiStore.isSelectMode,
          }"
          @click.stop="toggleNoteSelection(note.id)"
          style="transform: translateY(-50%)"
        >
          <div
            class="p-1 rounded-full flex items-center justify-center"
            :class="{
              'bg-cream-200 dark:bg-gray-600':
                notesStore.selectedNotes.includes(note.id),
            }"
          >
            <PhCheck :size="16" />
          </div>
        </div>
        <div
          class="relative mb-1"
          :class="{
            'mb-2': note.pinned || isNotePublic(note.id),
          }"
        >
          <h1
            class="font-bold text-sl font-serif cursor-pointer dark:text-white truncate"
          >
            {{ note.title }}
          </h1>
          <div class="absolute top-0 right-0 flex space-x-2">
            <span
              v-if="note.pinned"
              @click.stop="notesStore.togglePin(note.id)"
              class="justify-start px-2 py-1 hover:bg-cream-200 dark:hover:bg-gray-700 rounded-md card"
              @mouseenter="hoveredPinId = note.id"
              @mouseleave="hoveredPinId = null"
            >
              <PhPushPin
                v-if="hoveredPinId !== note.id"
                :size="16"
                class="text-[10px] md:text-xs"
              />
              <PhPushPinSlash
                v-else
                :size="16"
                class="text-[10px] md:text-xs"
              />
            </span>
            <span
              v-if="isNotePublic(note.id)"
              @click.stop="togglePublic(note.id)"
              class="justify-start px-2 py-1 hover:bg-cream-200 dark:hover:bg-gray-700 rounded-md card"
              @mouseenter="hoveredGlobeId = note.id"
              @mouseleave="hoveredGlobeId = null"
            >
              <PhGlobe
                v-if="hoveredGlobeId !== note.id"
                :size="16"
                class="text-[10px] md:text-xs"
              />
              <PhGlobeX v-else :size="16" class="text-[10px] md:text-xs" />
            </span>
          </div>
        </div>
        <Separator />
        <div>
          <div
            class="font-serif text-sm mt-2 dark:text-white truncate-text content"
            v-html="sanitizeHtml(truncatedContent(note.content))"
          ></div>
          <div
            class="flex justify-between items-center pt-3 mt-auto font-serif text-gray-700 dark:text-gray-400 text-xs"
          >
            <div class="flex items-center">
              <div
                v-if="note.folder !== DEFAULT_FOLDERS.UNCATEGORIZED"
                class="ml-auto text-left text-[10px] md:text-xs"
              >
                <p
                  class="flex items-center px-2 py-1 cursor-pointer truncate card hover:text-black dark:hover:text-white hover:bg-cream-200 dark:hover:bg-gray-700"
                  @click.stop="folderStore.setCurrentFolder(note.folder)"
                >
                  <PhFolder class="mr-1 md:mr-[6px] size-[14px] md:size-5" />
                  {{ note.folder }}
                </p>
              </div>
            </div>
            <div class="text-left text-[10px] md:text-xs ml-2">
              <p
                class="flex items-center px-2 py-1 cursor-pointer truncate card"
              >
                <PhCalendarBlank
                  class="mr-1 md:mr-[6px] size-[14px] md:size-5"
                />
                {{ localeDate(note.last_edited) }}
              </p>
            </div>
          </div>
        </div>
      </li>
    </transition-group>
    <Transition name="zoom">
      <ContextMenu
        v-if="selectedNote"
        :visible="showMenu"
        :position="menuPosition"
        :note="selectedNote"
        :noteId="selectedNote.id"
        @hideMenu="hideContextMenu"
        @select="selectNote"
        @delete="confirmDelete"
        @pin="togglePin"
        @public="togglePublic"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
  import {
    ComponentPublicInstance,
    computed,
    onMounted,
    onUnmounted,
    ref,
    watch,
  } from 'vue';
  import {
    PhPushPin,
    PhPushPinSlash,
    PhFolder,
    PhGlobe,
    PhCheck,
    PhGlobeX,
    PhCalendarBlank,
  } from '@phosphor-icons/vue';
  import { notesStore, folderStore, uiStore } from '@/store';
  import { Note } from '@/store/notesStore/types';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
  import ContextMenu from '@/components/contextMenu/contextMenu.vue';
  import DOMPurify from 'dompurify';
  import Separator from '@/components/ui/separator.vue';
  import { localeDate } from '@/store/notesStore/helpers';

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
  const hoveredPinId = ref<string | null>(null);
  const hoveredGlobeId = ref<string | null>(null);
  const selectedNote = ref<Note | null>(null);

  const computedColumns = computed(() => {
    const noteCount = props.notes.length;
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      return Math.min(noteCount, 2);
    } else {
      return Math.min(noteCount, 5);
    }
  });

  const selectNote = (noteId: string) => {
    notesStore.toggleNoteSelection(noteId);
    uiStore.isSelectMode = true;
  };

  const isNotePublic = (noteId: string) => {
    return notesStore.publicNotes.has(noteId);
  };

  const togglePublic = (noteId: string) => {
    notesStore.togglePublic(noteId);
  };

  const togglePin = (noteId: string) => {
    notesStore.togglePin(noteId);
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
      notesStore.openNote(note.id);
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    if (notesStore.selectedNotes.includes(noteId)) {
      notesStore.toggleNoteSelection(noteId);
      if (notesStore.selectedNotes.length === 0) {
        uiStore.isSelectMode = false;
      }
    } else {
      uiStore.isSelectMode = true;
      notesStore.toggleNoteSelection(noteId);
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

    if (
      !clickedElement.closest('li') &&
      !clickedElement.closest('.select-button')
    ) {
      if (uiStore.isSelectMode) {
        uiStore.toggleSelectMode();
      }
      notesStore.clearSelectedNotes();
    }
  };

  const cardRefs = ref<(HTMLElement | null)[]>([]);

  const setCardRef = (
    el: Element | ComponentPublicInstance | null,
    index: number
  ) => {
    if (el instanceof HTMLElement) {
      cardRefs.value[index] = el;
    } else {
      cardRefs.value[index] = null;
    }
  };

  const handleMouseMove = (event: MouseEvent, index: number) => {
    const card = cardRefs.value[index];
    if (!(card instanceof HTMLElement)) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    const rotateX = deltaY * 10;
    const rotateY = -deltaX * 10;

    card.style.transform = `
    perspective(1000px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
  `;
  };

  const handleMouseLeave = (index: number) => {
    const card = cardRefs.value[index];
    if (!(card instanceof HTMLElement)) return;
    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
  };

  watch(computedColumns, (newColumns) => {
    uiStore.setColumns(newColumns);
  });

  const handleResize = () => {
    uiStore.setColumns(computedColumns.value);
  };

  onMounted(() => {
    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onUnmounted(() => {
    window.removeEventListener('click', handleOutsideClick);
    window.removeEventListener('resize', handleResize);
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

  .content :deep(a) {
    color: blue;
    text-decoration: underline;
    cursor: pointer;
  }

  .dark .content :deep(a) {
    color: #3b82f6;
  }

  .content :deep(ul),
  .content :deep(ol) {
    padding-left: 20px;
    margin: 10px 0;
  }

  .content :deep(ul) {
    list-style-type: disc;
  }

  .content :deep(ol) {
    list-style-type: decimal;
  }

  .content :deep(h1) {
    font-size: 2em;
    font-weight: bold;
    line-height: 1.1;
    /* margin-bottom: 10px; */
    padding-bottom: 5px;
    /* border-bottom: 1px solid black; */
  }

  /* .dark .content :deep(h1) {
    border-bottom: 1px solid white;
  } */

  .content :deep(h2) {
    font-size: 1.5em;
    font-weight: bold;
    line-height: 1.05;
    /* margin-bottom: 10px; */
    padding-bottom: 5px;
    /* border-bottom: 1px solid black; */
  }

  /* .dark .content :deep(h2) {
    border-bottom: 1px solid white;
  } */

  .content :deep(h3) {
    font-size: 1.17em;
    font-weight: bold;
    /* margin-bottom: 6px; */
    padding-bottom: 3px;
    /* border-bottom: 1px solid black; */
  }

  /* .dark .content :deep(h3) {
    border-bottom: 1px solid white;
  } */

  .content :deep(blockquote) {
    border-left: 3px solid #d9c698;
    margin: 1em 0;
    padding-left: 1em;
    font-style: italic;
    color: #666;
  }

  .dark .content :deep(blockquote) {
    border-left: 3px solid #ccc;
    color: #b1b1b1;
  }

  .content :deep(code) {
    background-color: #d9c698;
    padding: 2px 4px;
    border-radius: 3px;
  }

  .dark .content :deep(code) {
    background-color: #424242;
    color: #fff;
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

  .notes {
    transition: all 0.3s ease;
    border-width: 1px;
    border-style: solid;
  }

  .notes.selected {
    border-width: 2px;
  }

  /* .notes:hover {
    transform: perspective(1000px) rotateX(0) rotateY(0)
      scale3d(1.05, 1.05, 1.05);
  }

  .notes:not(:hover) {
    transform: perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1);
  }

  .notes:active {
    transform: scale(0.98);
  } */
</style>
