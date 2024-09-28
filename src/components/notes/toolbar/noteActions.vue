<template>
  <div class="flex">
    <Button
      v-if="isNotePinned"
      class="ml-2 md:ml-4"
      @mouseenter="hoverPin = true"
      @mouseleave="hoverPin = false"
      @click="togglePin"
    >
      <PhPushPin v-if="!hoverPin" :size="20" class="size-5" />
      <PhPushPinSlash v-else :size="20" class="size-5" />
    </Button>
    <Button
      v-if="isNotePublic"
      class="ml-2 md:ml-4"
      @mouseenter="hoverPublic = true"
      @mouseleave="hoverPublic = false"
      @click="togglePublic"
    >
      <PhGlobe v-if="!hoverPublic" :size="20" class="size-5" />
      <PhGlobeX v-else :size="20" class="size-5" />
    </Button>

    <Dropdown
      v-if="!isTrash"
      ref="dropdownRef"
      dropdownId="noteHistoryDropdown"
      contentWidth="9rem"
      position="right"
      direction="down"
    >
      <template #label>
        <div
          class="flex items-center px-2 py-1.5 mx-2 md:mx-4 cursor-pointer card hover:bg-cream-200 dark:hover:bg-gray-600"
        >
          <div class="items-center flex" title="Note History">
            <PhSpinnerGap v-if="isSaving" :size="20" class="animate-spin" />
            <PhCalendarCheck v-else-if="isLatestVersion" :size="20" />
            <PhClockCounterClockwise v-else :size="20" />
            <span class="hidden md:flex md:ml-2">
              {{ localeDate(currentHistoryEntry.timestamp) }}
            </span>
          </div>
        </div>
      </template>

      <DropdownItem
        v-if="!note.value.history || note.value.history.length === 0"
        @click="openNoteHistory(-1)"
        :icon="PhCalendarCheck"
        :label="localeDate(note.value.last_edited)"
        :itemType="isLatestVersion ? 'active' : 'normal'"
      />
      <template v-else>
        <DropdownItem
          v-for="(historyEntry, index) in reversedHistory"
          :key="index"
          @click="openNoteHistory(note.value.history.length - 1 - index)"
          :icon="index === 0 ? PhCalendarCheck : PhClockCounterClockwise"
          :label="localeDate(historyEntry.timestamp)"
          :itemType="
            currentHistoryIndex === note.value.history.length - 1 - index
              ? 'active'
              : 'normal'
          "
        />
      </template>
    </Dropdown>

    <Dropdown
      ref="dropdownRef"
      dropdownId="noteOptionsDropdown"
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
        v-if="!isTrash"
        @click="copyNote"
        :icon="PhClipboardText"
        label="Copy"
      />

      <DropdownItem
        v-if="!isTrash"
        @click="duplicateNote"
        :icon="PhCopy"
        label="Duplicate"
      />

      <DropdownItem
        v-if="!isNotePinned && !isTrash"
        @click="togglePin"
        :icon="PhPushPin"
        label="Pin"
      />

      <DropdownItem
        v-if="isNotePinned && !isTrash"
        @click="togglePin"
        :icon="PhPushPinSlash"
        label="Unpin"
      />

      <DropdownSubmenu
        v-if="authStore.isLoggedIn && !isTrash"
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
        v-if="!isTrash"
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
        v-if="isEditing"
        @click="deleteNote"
        :icon="PhTrash"
        label="Delete"
        itemType="destructive"
      />

      <DropdownItem
        v-if="isTrash"
        @click="restoreNote"
        :icon="PhClockClockwise"
        label="Restore"
      />

      <DropdownItem
        v-if="isTrash"
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
    PhGlobeX,
    PhSpinnerGap,
    PhCalendarCheck,
    PhTrash,
    PhDotsThreeCircle,
    PhX,
    PhArrowsIn,
    PhArrowsOut,
    PhClipboardText,
    PhCopy,
    PhLock,
    PhFolder,
    PhFolderMinus,
    PhFolderDashed,
    PhClockClockwise,
    PhClockCounterClockwise,
  } from '@phosphor-icons/vue';
  import { Note } from '@/store/notesStore/types';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
  import { localeDate } from '@/store/notesStore/helpers';
  import { useNoteManagement } from '@/utils/useNoteManagement';
  import { uiStore, authStore, notesStore } from '@/store';
  import Button from '@/components/ui/button.vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import DropdownSubmenu from '@/components/ui/dropdownSubmenu.vue';

  const props = defineProps<{
    note: Ref<Note>;
    isEditing: boolean;
    isTrash: boolean;
    isSaving: boolean;
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

  const hoverPin = ref(false);
  const hoverPublic = ref(false);
  const activeSubmenu = ref<'public' | 'folder' | null>(null);
  const isExpanded = computed(() => uiStore.isExpanded);
  const isMobile = computed(() => window.innerWidth <= 768);

  const currentHistoryIndex = computed(() => notesStore.currentHistoryIndex);

  const isLatestVersion = computed(() => {
    return (
      currentHistoryIndex.value === null ||
      (props.note.value.history &&
        currentHistoryIndex.value === props.note.value.history.length - 1)
    );
  });

  const currentHistoryEntry = computed(() => {
    if (currentHistoryIndex.value === null || !props.note.value.history) {
      return { timestamp: props.note.value.last_edited };
    }
    return props.note.value.history[currentHistoryIndex.value];
  });

  const reversedHistory = computed(() => {
    if (!props.note.value.history) return [];
    return [...props.note.value.history].reverse();
  });

  function openNoteHistory(index: number) {
    notesStore.currentHistoryIndex = index;
    if (index === -1 || !props.note.value.history) {
      props.note.value.title = props.note.value.title;
      props.note.value.content = props.note.value.content;
      props.note.value.last_edited = props.note.value.last_edited;
    } else if (
      props.note.value.history &&
      index < props.note.value.history.length
    ) {
      const historyEntry = props.note.value.history[index];
      props.note.value.title = historyEntry.title;
      props.note.value.content = historyEntry.content;
      props.note.value.last_edited = historyEntry.timestamp;
    } else {
      uiStore.showToastMessage('History not available');
    }
  }

  const toggleSubmenu = (submenu: 'public' | 'folder', isOpen: boolean) => {
    activeSubmenu.value = isOpen ? submenu : null;
  };

  const toggleExpand = () => uiStore.toggleExpand();
</script>
