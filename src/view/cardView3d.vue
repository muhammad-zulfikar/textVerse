<template>
  <div class="mx-2 md:mx-4">
    <TransitionGroup
      name="list"
      tag="ul"
      :class="['relative min-w-[300px] md:mx-auto', columnClass]"
    >
      <li
        v-for="(note, index) in notes"
        :key="note.id"
        class="notes card break-inside-avoid h-min mb-[9px] p-2 cursor-pointer relative group select-none transform-gpu"
        :class="[
          { 'z-50': showMenu && notesStore.selectedNote?.id === note.id },
          { shadow: note.pinned },
          { selected: notesStore.selectedNotes.includes(note.id) },
          computedMb,
        ]"
        @contextmenu.prevent="(event) => showContextMenu(event, note)"
        @click.stop="handleNoteClick(note)"
        @mousemove="(event) => handleMouseMove(event, index)"
        @mouseleave="() => handleMouseLeave(index)"
        :ref="(el) => setCardRef(el, index)"
      >
        <NoteSelectButton :note="note" />
        <NoteHeader :note="note" />
        <Separator />
        <NoteContent :note="note" />
        <NoteFooter :note="note" />
      </li>
    </TransitionGroup>
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
  import { notesStore, uiStore } from '@/store';
  import { Note } from '@/store/notesStore/types';
  import ContextMenu from '@/components/contextMenu/contextMenu.vue';
  import Separator from '@/components/ui/separator.vue';
  import NoteSelectButton from './card/noteSelectButton.vue';
  import NoteHeader from './card/noteHeader.vue';
  import NoteContent from './card/noteContent.vue';
  import NoteFooter from './card/noteFooter.vue';

  const props = defineProps<{ notes: Note[] }>();

  const showMenu = ref(false);
  const menuPosition = ref({ x: 0, y: 0 });
  const selectedNote = ref<Note | null>(null);
  const cardRefs = ref<(HTMLElement | null)[]>([]);

  const columnClass = computed(() => {
    const classes = {
      1: 'columns-1 md:max-w-xl',
      2: 'columns-2 gap-2 md:gap-7 md:max-w-4xl',
      3: 'columns-3 sm:columns-2 md:columns-3 gap-8 md:max-w-6xl',
      4: 'columns-4 sm:columns-2 md:columns-3 lg:columns-4 gap-4',
      5: 'columns-5 sm:columns-2 md:columns-3 lg:columns-5 gap-2',
    };
    return classes[uiStore.columns as keyof typeof classes];
  });

  const computedMb = computed(() =>
    uiStore.columns === 4
      ? 'md:mb-4'
      : uiStore.columns === 5
        ? 'md:mb-2'
        : 'md:mb-8'
  );

  const computedColumns = computed(() => {
    const noteCount = props.notes.length;
    const isMobile = window.innerWidth <= 768;
    return Math.min(noteCount, isMobile ? 2 : 5);
  });

  const showContextMenu = (event: MouseEvent, note: Note) => {
    event.stopPropagation();
    uiStore.setActiveDropdown(null);
    menuPosition.value = { x: event.clientX, y: event.clientY };
    showMenu.value = true;
    selectedNote.value = note;
  };

  const hideContextMenu = () => {
    showMenu.value = false;
  };

  const selectNote = (noteId: string) => {
    notesStore.toggleNoteSelection(noteId);
    uiStore.isSelectMode = true;
  };

  const togglePin = (noteId: string) => {
    notesStore.togglePin(noteId);
  };

  const togglePublic = (noteId: string) => {
    notesStore.togglePublic(noteId);
  };

  const confirmDelete = async () => {
    try {
      if (selectedNote.value) {
        await notesStore.deleteNote(selectedNote.value.id);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      uiStore.showToastMessage('Failed to delete note. Please try again.');
    } finally {
      hideContextMenu();
    }
  };

  const handleNoteClick = (note: Note) => {
    uiStore.isSelectMode
      ? notesStore.toggleNoteSelection(note.id)
      : notesStore.openNote(note.id);
  };

  const setCardRef = (
    el: Element | ComponentPublicInstance | null,
    index: number
  ) => {
    if (el instanceof HTMLElement) {
      cardRefs.value[index] = el;
    } else if (el) {
      const vnode = (el as any).$?.__vnode;
      if (vnode && vnode.el instanceof HTMLElement) {
        cardRefs.value[index] = vnode.el;
      } else {
        cardRefs.value[index] = null;
      }
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

    const deltaX = (x - rect.width / 2) / (rect.width / 2);
    const deltaY = (y - rect.height / 2) / (rect.height / 2);

    card.style.transform = `
    perspective(1000px)
    rotateX(${deltaY * 10}deg)
    rotateY(${-deltaX * 10}deg)
  `;
  };

  const handleMouseLeave = (index: number) => {
    const card = cardRefs.value[index];
    if (card instanceof HTMLElement) {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    }
  };

  const handleOutsideClick = (event: MouseEvent) => {
    const clickedElement = event.target as HTMLElement;
    if (
      !clickedElement.closest('li') &&
      !clickedElement.closest('.select-button')
    ) {
      uiStore.isSelectMode = false;
      notesStore.clearSelectedNotes();
    }
  };

  const handleResize = () => uiStore.setColumns(computedColumns.value);

  watch(
    () => uiStore.isSelectMode,
    (newValue) => {
      if (!newValue) notesStore.clearSelectedNotes();
    }
  );

  watch(computedColumns, (newColumns) => uiStore.setColumns(newColumns));

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
