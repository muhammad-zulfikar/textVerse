<template>
  <Dropdown
    ref="dropdownRef"
    dropdownId="noteOptionsDropdown"
    contentWidth="9rem"
    position="left"
    direction="down"
  >
    <template #label>
      <div
        class="flex items-center px-2 py-1.5 cursor-pointer custom-card hover:bg-[#d9c698] dark:hover:bg-gray-600"
      >
        <PhFile :size="20" class="size-5 flex-shrink-0" />
        <div class="relative ml-2 flex-grow">
          <div v-if="isTitleEditing">
            <input
              ref="titleInputRef"
              v-model="editedTitle"
              class="bg-transparent outline-none w-full min-w-[50px]"
              :style="{ width: `${titleWidth}px` }"
              @input="updateTitleWidth"
              @blur="finishTitleEdit"
              @keyup.enter="finishTitleEdit"
            />
            <span
              ref="titleMeasure"
              class="invisible absolute top-0 left-0 whitespace-pre"
            >
              {{ editedTitle }}
            </span>
          </div>
          <h1 v-else ref="titleRef" class="truncate">{{ title }}</h1>
        </div>
      </div>
    </template>

    <div
      @click="copyNote"
      class="block px-1 text-sm cursor-pointer"
      role="menuitem"
    >
      <span
        class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
      >
        <PhClipboardText :size="20" class="mr-2" />
        Copy
      </span>
    </div>
    <div
      @click="duplicateNote"
      class="block px-1 text-sm cursor-pointer"
      role="menuitem"
    >
      <span
        class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
      >
        <PhCopy :size="20" class="mr-2" />
        Duplicate
      </span>
    </div>
    <div
      v-if="!isPinned"
      @click="pinNote"
      class="block px-1 text-sm cursor-pointer"
      role="menuitem"
    >
      <span
        class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
      >
        <PhPushPin :size="20" class="size-5 mr-2" />
        Pin
      </span>
    </div>
    <div
      v-if="isPinned"
      @click="unpinNote"
      class="block px-1 text-sm cursor-pointer"
      role="menuitem"
    >
      <span
        class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
      >
        <PhPushPinSlash :size="20" class="size-5 mr-2" />
        Unpin
      </span>
    </div>
    <div
      v-if="authStore.isLoggedIn"
      @click.stop="toggleSubmenu('visibility', $event)"
      class="block px-1 text-sm cursor-pointer relative"
      role="menuitem"
    >
      <span
        class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
      >
        <PhGlobe v-if="isPublic" :size="20" class="size-5 mr-2" />
        <PhLock v-else :size="20" class="size-5 mr-2" />
        {{ isPublic ? 'Public' : 'Private' }}
        <PhCaretRight :size="14" class="absolute right-2" />
      </span>
      <div
        v-if="activeSubmenu.visibility"
        :class="[
          'absolute top-0 custom-card p-1 min-w-36 whitespace-nowrap',
          submenuPosition === 'right' ? 'left-full -ml-1' : 'right-full -mr-1',
        ]"
      >
        <div
          @click="togglePublic(false)"
          class="p-2 cursor-pointer rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
        >
          <PhLock :size="20" class="size-5 mr-2" />
          Private
        </div>
        <div
          @click="togglePublic(true)"
          class="p-2 cursor-pointer rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
        >
          <PhGlobe :size="20" class="size-5 mr-2" />
          Public
        </div>
        <div
          v-if="isPublic"
          @click="copyPublicLink"
          class="p-2 cursor-pointer rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
        >
          <PhCopy :size="20" class="size-5 mr-2" />
          Copy link
        </div>
      </div>
    </div>
    <div
      @click.stop="toggleSubmenu('folder', $event)"
      class="block px-1 text-sm cursor-pointer relative"
      role="menuitem"
    >
      <span
        class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
      >
        <PhFolder :size="20" class="size-5 mr-2" />
        {{ folderValue }}
        <PhCaretRight :size="14" class="absolute right-2" />
      </span>
      <div
        v-if="activeSubmenu.folder"
        :class="[
          'absolute top-0 custom-card p-1 min-w-36 whitespace-nowrap',
          submenuPosition === 'right' ? 'left-full -ml-1' : 'right-full -mr-1',
        ]"
      >
        <div
          v-for="folder in availableFolders"
          :key="folder"
          @click="updateFolder(folder)"
          class="p-2 cursor-pointer rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
        >
          <PhFolder :size="20" class="size-5 mr-2" />
          {{ folder }}
        </div>
      </div>
    </div>

    <div
      v-if="!isMobile"
      @click="toggleExpand"
      class="block px-1 text-sm cursor-pointer"
      role="menuitem"
    >
      <span
        class="p-2 w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
      >
        <PhArrowsIn v-if="isExpanded" :size="20" class="size-5 mr-2" />
        <PhArrowsOut v-else :size="20" class="size-5 mr-2" />
        {{ isExpanded ? 'Collapse' : 'Expand' }}
      </span>
    </div>

    <div
      v-if="isEditMode"
      @click="deleteNote"
      class="block px-1 text-sm cursor-pointer text-red-500 hover:text-red-100"
      role="menuitem"
    >
      <span
        class="p-2 w-full text-left rounded-md hover:bg-red-700/50 dark:hover:bg-red-800/60 transition-colors duration-200 flex items-center whitespace-nowrap"
      >
        <PhTrash :size="20" class="size-5 mr-2" />
        Delete
      </span>
    </div>
  </Dropdown>

  <InputModal
    :is-open="isRenameModalOpen"
    mode="title"
    :current-value="title"
    :max-length="30"
    @update="handleRename"
    @close="closeRenameModal"
  />
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, watch, nextTick, onUnmounted } from 'vue';
  import {
    PhFile,
    PhClipboardText,
    PhCopy,
    PhGlobe,
    PhFolder,
    PhArrowsIn,
    PhArrowsOut,
    PhTrash,
    PhCaretRight,
    PhPushPin,
    PhPushPinSlash,
    PhLock,
  } from '@phosphor-icons/vue';
  import { uiStore, folderStore, authStore } from '@/utils/stores';
  import Dropdown from '@/components/ui/dropdown.vue';
  import InputModal from '@/components/ui/modal/inputModal.vue';
  import { DEFAULT_FOLDERS } from '@/utils/constants';

  const props = defineProps<{
    noteId: string | null;
    title: string;
    isTitleEditing: boolean;
    isPublic: boolean;
    folder: string;
    lastEditedDate: string | Date;
    content: string;
    isEditMode: boolean;
    isValid: boolean;
    hasChanges: boolean;
    isPinned: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'togglePublic', isPublic: boolean): void;
    (e: 'copyPublicLink'): void;
    (e: 'copyNote'): void;
    (e: 'updateFolder', folder: string): void;
    (e: 'deleteNote'): void;
    (e: 'updateTitle', title: string): void;
    (e: 'finishTitleEdit', newTitle: string): void;
    (e: 'duplicateNote'): void;
    (e: 'pinNote'): void;
    (e: 'unpinNote'): void;
  }>();

  const titleInputRef = ref<HTMLInputElement | null>(null);
  const titleRef = ref<HTMLElement | null>(null);
  const titleMeasure = ref<HTMLElement | null>(null);
  const editedTitle = ref(props.title);
  const titleWidth = ref(0);

  const updateTitleWidth = () => {
    if (props.isTitleEditing && titleMeasure.value) {
      titleWidth.value = titleMeasure.value.offsetWidth + 1;
    } else if (titleRef.value) {
      titleWidth.value = titleRef.value.offsetWidth;
    }
  };

  watch(
    () => props.isTitleEditing,
    (newValue) => {
      if (newValue) {
        nextTick(() => {
          updateTitleWidth();
          titleInputRef.value?.focus();
        });
      }
    }
  );

  watch(
    () => props.title,
    (newValue) => {
      editedTitle.value = newValue;
      updateTitleWidth();
    }
  );

  const finishTitleEdit = () => {
    emit('finishTitleEdit', editedTitle.value);
  };

  onMounted(() => {
    updateTitleWidth();
    window.addEventListener('resize', updateTitleWidth);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateTitleWidth);
  });

  const isRenameModalOpen = ref(false);
  const activeSubmenu = ref({
    visibility: false,
    folder: false,
  });
  const submenuPosition = ref('right');

  const closeRenameModal = () => {
    isRenameModalOpen.value = false;
  };

  const handleRename = (newTitle: string) => {
    emit('updateTitle', newTitle.trim());
    closeRenameModal();
  };

  const togglePublic = (isPublic: boolean) => {
    emit('togglePublic', isPublic);
  };

  const copyPublicLink = () => {
    emit('copyPublicLink');
  };

  const copyNote = () => {
    emit('copyNote');
  };

  const duplicateNote = () => {
    emit('duplicateNote');
  };

  const pinNote = () => {
    emit('pinNote');
  };

  const unpinNote = () => {
    emit('unpinNote');
  };

  const folderValue = computed(() => props.folder);

  const updateFolder = (folder: string) => {
    emit('updateFolder', folder);
    closeSubmenu('folder');
  };

  const availableFolders = computed(() => {
    return [
      ...folderStore.folders.filter(
        (folder) => folder !== DEFAULT_FOLDERS.ALL_NOTES
      ),
    ];
  });

  const isExpanded = computed(() => uiStore.isExpanded);
  const isMobile = computed(() => window.innerWidth <= 768);

  const deleteNote = () => emit('deleteNote');
  const toggleExpand = () => uiStore.toggleExpand();

  const checkSubmenuPosition = (event: MouseEvent) => {
    const targetElement = event.currentTarget as HTMLElement;
    const rect = targetElement.getBoundingClientRect();
    const spaceOnRight = window.innerWidth - rect.right;
    const requiredSpace = 200;

    submenuPosition.value = spaceOnRight >= requiredSpace ? 'right' : 'left';
  };

  const toggleSubmenu = (
    submenu: 'visibility' | 'folder',
    event: MouseEvent
  ) => {
    checkSubmenuPosition(event);

    if (submenu === 'visibility') {
      activeSubmenu.value.visibility = !activeSubmenu.value.visibility;
      activeSubmenu.value.folder = false;
    } else {
      if (activeSubmenu.value.visibility && submenu === 'folder') {
        activeSubmenu.value.visibility = false;
      }

      activeSubmenu.value[submenu] = !activeSubmenu.value[submenu];
    }
  };

  const closeSubmenu = (submenu: 'visibility' | 'folder') => {
    activeSubmenu.value[submenu] = false;
  };
</script>
