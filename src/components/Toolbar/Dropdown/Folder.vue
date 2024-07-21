<!-- Folder.vue -->

<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <button
      @click.stop="toggleDropdown"
      :class="{ 'z-50': isOpen }"
      class="hover:underline outline-none mr-4 flex items-center relative cursor-pointer"
    >
      {{ selectedFolder }} ({{ notesCountByFolder[selectedFolder] || 0 }})
      <span class="ml-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            v-if="isOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 15l7-7 7 7"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </span>
    </button>
    <div
      v-if="isOpen"
      class="custom-card z-50 origin-top-right absolute mt-2 w-56"
    >
      <div class="py-1" role="menu" aria-orientation="vertical">
        <template v-for="folder in sortedFolders" :key="folder">
          <div
            @click.stop="selectFolder(folder)"
            class="block px-4 py-2 text-sm flex justify-between items-center"
            role="menuitem"
          >
            <span
              :class="
                folder === selectedFolder ? 'underline dark:text-white' : ''
              "
              class="hover:underline cursor-pointer"
            >
              {{ folder }} ({{ notesCountByFolder[folder] || 0 }})
            </span>
            <div
              v-if="folder !== 'All Notes' && folder !== uncategorizedFolder"
              class="flex items-center space-x-2"
            >
              <button
                @click.stop="openRenameModal(folder)"
                class="text-xs text-blue-500 cursor-pointer hover:underline mr-2"
              >
                Rename
              </button>
              <button
                @click.stop="openDeleteAlert(folder)"
                class="text-xs text-red-500 cursor-pointer hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
  <FolderForm
    :is-open="isModalOpen"
    :mode="modalMode"
    :current-name="currentFolderName"
    @close="closeModal"
    @submit="handleModalSubmit"
  />
  <AlertModal
    :is-open="isAlertOpen"
    :message="AlertMessage"
    @confirm="handleAlert"
    @cancel="closeAlert"
  />
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
  import { useNotesStore } from '@/store/store';
  import FolderForm from '../../Modal/FolderForm.vue';
  import AlertModal from '../../Modal/AlertModal.vue';

  const store = useNotesStore();
  const isOpen = ref(false);
  const selectedFolder = computed(() => store.currentFolder);
  const dropdownRef = ref<HTMLElement | null>(null);

  const isModalOpen = ref(false);
  const modalMode = ref<'create' | 'rename'>('create');
  const currentFolderName = ref('');
  const notesCountByFolder = computed(() => store.notesCountByFolder());

  const isAlertOpen = ref(false);
  const AlertMessage = ref('');
  const folderToDelete = ref('');

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
    store.setActiveDropdown(isOpen.value ? 'folder' : null);
  };

  const selectFolder = (folder: string) => {
    store.setCurrentFolder(folder);
    closeDropdown();
  };

  const openRenameModal = (folder: string) => {
    modalMode.value = 'rename';
    currentFolderName.value = folder;
    isModalOpen.value = true;
    closeDropdown();
  };

  const uncategorizedFolder = computed(() => store.uncategorizedFolder);

  const sortedFolders = computed(() => {
    const userFolders = store.folders.filter(
      (folder: string) =>
        folder !== 'All Notes' && folder !== uncategorizedFolder.value
    );
    return ['All Notes', ...userFolders.sort(), uncategorizedFolder.value];
  });

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const handleModalSubmit = (folderName: string) => {
    if (modalMode.value === 'create') {
      store.createFolder(folderName);
      selectFolder(folderName);
    } else {
      store.renameFolder(currentFolderName.value, folderName);
      if (selectedFolder.value === currentFolderName.value) {
        selectFolder(folderName);
      }
    }
  };

  const openDeleteAlert = (folder: string) => {
    folderToDelete.value = folder;
    AlertMessage.value = `Are you sure you want to delete the folder "${folder}"?`;
    isAlertOpen.value = true;
  };

  const closeAlert = () => {
    isAlertOpen.value = false;
  };

  const handleAlert = () => {
    store.deleteFolder(folderToDelete.value);
    closeAlert();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.value &&
      !dropdownRef.value.contains(event.target as Node) &&
      !isAlertOpen.value
    ) {
      closeDropdown();
    }
  };

  const closeDropdown = () => {
    isOpen.value = false;
    if (store.activeDropdown === 'folder') {
      store.setActiveDropdown(null);
    }
  };

  onMounted(() => document.addEventListener('click', handleClickOutside));
  onUnmounted(() => document.removeEventListener('click', handleClickOutside));

  watch(isAlertOpen, (newVal) => {
    if (newVal) {
      isOpen.value = false;
    }
  });
</script>
