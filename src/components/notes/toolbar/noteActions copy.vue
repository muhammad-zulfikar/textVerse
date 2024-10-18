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

      <DropdownItem
        v-if="note.value.history"
        @click="openVersionModal"
        :icon="PhClockCounterClockwise"
        label="Version History"
      />

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

      <DropdownSubmenu
        v-if="note.value.history"
        label="Version"
        :icon="PhClockCounterClockwise"
        :modelValue="activeSubmenu === 'version'"
        @update:modelValue="toggleSubmenu('version', $event)"
      >
        <template v-for="{ date, entries } in sortedGroupedHistory" :key="date">
          <DropdownSubmenu
            :label="localeDate(date)"
            :icon="PhCalendarBlank"
            :modelValue="activeSubSubmenu === date"
            @update:modelValue="toggleSubSubmenu(date, $event)"
          >
            <DropdownItem
              v-for="(historyEntry, index) in entries"
              :key="index"
              :icon="PhClockCounterClockwise"
              :label="formatTime(historyEntry.timestamp)"
              :itemType="isCurrentVersion(historyEntry) ? 'active' : 'normal'"
              @click="openNoteHistory(getHistoryIndex(historyEntry))"
            />
          </DropdownSubmenu>
        </template>
      </DropdownSubmenu>

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
  import { ref, computed, Ref, onMounted } from 'vue';
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
    PhLock,
    PhFolder,
    PhFolderMinus,
    PhFolderDashed,
    PhClockClockwise,
    PhClockCounterClockwise,
    PhCalendarBlank,
  } from '@phosphor-icons/vue';
  import { Note, NoteHistory } from '@/store/notesStore/types';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
  import { useNoteManagement } from '@/utils/useNoteManagement';
  import { uiStore, authStore, notesStore } from '@/store';
  import { useCurrentRoute } from '@/utils/useCurrentRoute';
  import { localeDate } from '@/store/notesStore/helpers';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import DropdownSubmenu from '@/components/ui/dropdownSubmenu.vue';

  const props = defineProps<{
    note: Ref<Note>;
    isEditing: boolean;
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
      cancel: () => {
        // Handle cancel action if needed
      },
      confirm: () => {
        // Handle confirm action if needed
      },
    });
  };

  const toggleExpand = () => uiStore.toggleExpand();

  const currentHistoryIndex = computed(() => notesStore.currentHistoryIndex);

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

  const activeSubSubmenu = ref<string | null>(null);

  const groupedHistory = computed(() => {
    if (!props.note.value.history) return {};

    return props.note.value.history.reduce(
      (acc, entry) => {
        const date = new Date(entry.timestamp).toDateString();
        if (!acc[date]) {
          acc[date] = [];
        }
        acc[date].push(entry);
        return acc;
      },
      {} as Record<string, NoteHistory[]>
    );
  });

  const sortedGroupedHistory = computed(() => {
    const sortedDates = Object.keys(groupedHistory.value).sort(
      (a, b) => new Date(b).getTime() - new Date(a).getTime()
    );

    return sortedDates.map((date) => ({
      date,
      entries: groupedHistory.value[date].sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    }));
  });

  const toggleSubSubmenu = (date: string, isOpen: boolean) => {
    activeSubSubmenu.value = isOpen ? date : null;
  };

  const formatTime = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const isCurrentVersion = (historyEntry: NoteHistory) => {
    return getHistoryIndex(historyEntry) === currentHistoryIndex.value;
  };

  const getHistoryIndex = (historyEntry: NoteHistory) => {
    return (
      props.note.value.history?.findIndex(
        (entry) => entry.timestamp === historyEntry.timestamp
      ) ?? -1
    );
  };

  onMounted(() => {
    if (props.note.value.history && props.note.value.history.length > 0) {
      notesStore.currentHistoryIndex = props.note.value.history.length - 1;
    } else {
      notesStore.currentHistoryIndex = null;
    }
  });
</script>
