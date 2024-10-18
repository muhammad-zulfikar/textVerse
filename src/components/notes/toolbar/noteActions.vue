<!--noteActions.vue-->

<template>
  <div class="flex">
    <Dropdown
      ref="dropdownRef"
      dropdownId="noteActionsDropdown"
      contentWidth="9.5rem"
      position="right"
      direction="down"
    >
      <template #label>
        <div
          class="flex items-center px-2 py-1.5 cursor-pointer card hover:bg-cream-200 dark:hover:bg-gray-600"
        >
          <PhDotsThreeCircle :size="20" class="size-5" />
        </div>
      </template>

      <DropdownItem @click="closeNote" :icon="PhX" label="Close" />

      <DropdownItem
        v-if="!isMobile"
        @click="toggleExpand"
        :icon="isExpanded ? PhArrowsIn : PhArrowsOut"
        :label="isExpanded ? 'Collapse' : 'Expand'"
      />

      <DropdownItem
        v-if="!isTrashRoute"
        @click="copyNote"
        :icon="PhClipboardText"
        label="Copy"
      />

      <DropdownItem
        v-if="!isTrashRoute"
        @click="duplicateNote"
        :icon="PhCopy"
        label="Duplicate"
      />

      <DropdownItem
        v-if="!isNotePinned && !isTrashRoute"
        @click="togglePin"
        :icon="PhPushPin"
        label="Pin"
      />

      <DropdownItem
        v-if="isNotePinned && !isTrashRoute"
        @click="togglePin"
        :icon="PhPushPinSlash"
        label="Unpin"
      />

      <DropdownSubmenu
        v-if="authStore.isLoggedIn && !isTrashRoute"
        :icon="isNotePublic ? PhGlobe : PhLock"
        :label="isNotePublic ? 'Public' : 'Private'"
        :modelValue="activeSubmenu === 'public'"
        @update:modelValue="toggleSubmenu('public', $event)"
      >
        <DropdownItem
          @click="togglePublic"
          :icon="PhLock"
          label="Private"
          :itemType="!isNotePublic ? 'active' : 'normal'"
        />
        <DropdownItem
          @click="togglePublic"
          :icon="PhGlobe"
          label="Public"
          :itemType="isNotePublic ? 'active' : 'normal'"
        />
        <DropdownItem
          v-if="isNotePublic"
          @click="copyLink"
          :icon="PhCopy"
          label="Copy link"
        />
      </DropdownSubmenu>

      <DropdownSubmenu
        v-if="!isTrashRoute"
        :label="currentFolder"
        :icon="
          currentFolder !== DEFAULT_FOLDERS.UNCATEGORIZED
            ? PhFolder
            : PhFolderMinus
        "
        :modelValue="activeSubmenu === 'folder'"
        @update:modelValue="toggleSubmenu('folder', $event)"
      >
        <DropdownItem
          v-for="folder in sortedAvailableFolders"
          :key="folder"
          :icon="
            folder !== DEFAULT_FOLDERS.UNCATEGORIZED
              ? notesCountByFolder[folder] === 0
                ? PhFolderDashed
                : PhFolder
              : PhFolderMinus
          "
          :label="folder"
          :itemType="folder === note.value.folder ? 'active' : 'normal'"
          @click="moveNote(folder)"
        />
      </DropdownSubmenu>

      <DropdownItem
        v-if="note.value.history"
        @click="openVersionModal"
        :icon="PhClockCounterClockwise"
        label="Version History"
      />

      <DropdownItem
        v-if="isViewingHistory"
        @click="applyVersion"
        :icon="PhCheck"
        label="Apply Version"
      />

      <DropdownItem
        v-if="isEditing"
        @click="deleteNote"
        :icon="PhTrash"
        label="Delete"
        itemType="destructive"
      />

      <DropdownItem
        v-if="isTrashRoute"
        @click="restoreNote"
        :icon="PhClockClockwise"
        label="Restore"
      />

      <DropdownItem
        v-if="isTrashRoute"
        @click="deleteNotePermanently"
        :icon="PhTrash"
        label="Delete"
        itemType="destructive"
      />
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, Ref } from 'vue';
  import {
    PhPushPin,
    PhPushPinSlash,
    PhGlobe,
    PhTrash,
    PhDotsThreeCircle,
    PhX,
    PhArrowsIn,
    PhArrowsOut,
    PhClipboardText,
    PhCopy,
    PhCheck,
    PhLock,
    PhFolder,
    PhFolderMinus,
    PhFolderDashed,
    PhClockClockwise,
    PhClockCounterClockwise,
  } from '@phosphor-icons/vue';
  import { Note, NoteHistory } from '@/store/notesStore/types';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
  import { useNoteManagement } from '@/utils/useNoteManagement';
  import { uiStore, authStore } from '@/store';
  import { useCurrentRoute } from '@/utils/useCurrentRoute';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import DropdownSubmenu from '@/components/ui/dropdownSubmenu.vue';

  const props = defineProps<{
    note: Ref<Note>;
    isEditing: boolean;
    isSaving: boolean;
    isViewingHistory: boolean;
  }>();

  const {
    isNotePublic,
    isNotePinned,
    currentFolder,
    sortedAvailableFolders,
    notesCountByFolder,
    togglePublic,
    togglePin,
    copyLink,
    copyNote,
    duplicateNote,
    deleteNote,
    restoreNote,
    deleteNotePermanently,
    moveNote,
    closeNote,
  } = useNoteManagement(props.note);

  const { isTrashRoute } = useCurrentRoute();

  const activeSubmenu = ref<'public' | 'folder' | 'version' | null>(null);
  const isExpanded = computed(() => uiStore.isExpanded);
  const isMobile = computed(() => window.innerWidth <= 768);

  const toggleSubmenu = (
    submenu: 'public' | 'folder' | 'version',
    isOpen: boolean
  ) => {
    activeSubmenu.value = isOpen ? submenu : null;
  };

  const openVersionModal = () => {
    uiStore.openVersionModal({
      cancel: () => {},
      preview: (version) => {
        emit('previewVersion', version);
      },
      apply: () => {
        emit('applyVersion');
      },
    });
  };

  const applyVersion = () => {
    if (props.isViewingHistory) {
      emit('applyVersion');
    }
  };

  const emit = defineEmits<{
    (e: 'previewVersion', version: NoteHistory): void;
    (e: 'applyVersion'): void;
  }>();

  const toggleExpand = () => uiStore.toggleExpand();
</script>
