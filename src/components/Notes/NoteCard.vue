<!-- NoteCard.vue -->

<template>
  <Toast v-if="store.showToast" :message="store.toastMessage" />
  <li
    class="custom-card break-inside-avoid h-min mb-6 md:mb-8 p-2 flex flex-col overflow-x-auto cursor-pointer relative group select-none"
    @contextmenu.prevent="showContextMenu($event)"
    :class="{ 'z-50': showMenu, shadow: note.pinned }"
    @click="handleCardClick"
  >
    <div class="flex justify-between items-start">
      <h1 class="font-bold text-sl font-serif cursor-pointer dark:text-white">
        {{ note.title }}
      </h1>
    </div>
    <div>
      <div
        v-if="!showOption"
        class="font-serif text-sm mt-2 dark:text-white truncate-text"
        v-html="truncatedContent"
      ></div>
      <div v-if="!showOption" class="flex pt-3 mt-auto">
        <div class="flex items-center">
          <p
            v-if="note.folder !== 'Uncategorized'"
            class="font-serif text-gray-500 dark:text-gray-400 text-xs mt-auto cursor-pointer hover:underline"
            @click.stop="goToFolder(note.folder)"
          >
            {{ note.folder }}
          </p>
        </div>
        <div
          class="hidden md:flex justify-center items-center font-serif text-gray-500 dark:text-gray-400 text-xs mt-auto ml-auto"
        >
          <p v-if="note.pinned" class="mr-2">Pinned</p>
        </div>
        <div
          class="flex items-center font-serif text-gray-500 dark:text-gray-400 text-xs mt-auto ml-auto"
        >
          {{ note.lastEdited || note.timeCreated }}
        </div>
      </div>
    </div>
  </li>
  <ContextMenu
    :visible="showMenu"
    :position="menuPosition"
    :note="note"
    :noteId="note.id"
    @hideMenu="hideContextMenu"
    @edit="store.openNote"
    @delete="openDeleteAlert"
    @download="store.downloadNote(note)"
    @pin="pinNote"
    @unpin="unpinNote"
  />
  <AlertModal
    :is-open="isAlertOpen"
    :message="alertMessage"
    @confirm="confirmDelete"
    @cancel="closeAlert"
  />
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useNotesStore } from '@/store/store';
  import { Note } from '@/store/types';
  import Toast from '../Toast/Toast.vue';
  import ContextMenu from '../ContextMenu/ContextMenu.vue';
  import AlertModal from '../Modal/AlertModal.vue';

  const store = useNotesStore();

  const props = defineProps({
    note: {
      type: Object as () => Note,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
  });

  const showOption = ref(false);
  const showMenu = ref(false);
  const menuPosition = ref({ x: 0, y: 0 });

  const isAlertOpen = ref(false);
  const alertMessage = ref('');

  const linkifiedContent = computed(() => store.linkify(props.note.content));

  const truncatedContent = computed(() => {
    const contentElement = document.createElement('div');
    contentElement.innerHTML = linkifiedContent.value;
    const lines = contentElement.textContent?.split('\n') ?? [];
    if (lines.length > 10) {
      return lines.slice(0, 10).join('\n') + '...';
    }
    return contentElement.innerHTML;
  });

  const showContextMenu = (event: MouseEvent) => {
    event.stopPropagation();
    store.setActiveDropdown(showMenu ? 'create' : null);
    menuPosition.value = { x: event.clientX, y: event.clientY };
    showMenu.value = true;
  };

  const hideContextMenu = () => {
    showMenu.value = false;
  };

  const goToFolder = (folder: string) => {
    store.setCurrentFolder(folder);
  };

  const openDeleteAlert = () => {
    hideContextMenu();
    alertMessage.value = `Are you sure you want to delete the note "${props.note.title}"?`;
    isAlertOpen.value = true;
  };

  const closeAlert = () => {
    isAlertOpen.value = false;
  };

  const pinNote = () => {
    store.pinNote(props.note.id);
  };

  const unpinNote = () => {
    store.unpinNote(props.note.id);
  };

  const confirmDelete = () => {
    store.removeNote(props.note.id);
    closeAlert();
  };

  const handleCardClick = (_event: MouseEvent) => {
    store.openNote(props.note.id);
  };
</script>

<style scoped>
  .dark .icon {
    filter: invert(1) brightness(2);
  }

  .option-icon {
    display: none;
  }

  .group:hover .option-icon {
    display: block;
  }

  .underline {
    text-decoration: underline;
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

  .note-card {
    transition: z-index 0.3s ease;
  }

  .note-card.z-50 {
    z-index: 50;
  }

  .truncate-text {
    display: -webkit-box;
    -webkit-line-clamp: 10;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre-line;
  }
</style>
