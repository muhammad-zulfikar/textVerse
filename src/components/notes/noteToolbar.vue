<!-- noteToolbar.vue -->

<template>
  <div class="flex justify-between items-center w-full text-sm">
    <div class="flex items-center mr-2 md:mr-4">
      <div
        class="flex items-center mr-2 md:mr-4 px-2 py-1.5 card"
        :class="{
          'hover:bg-cream-200 dark:hover:bg-gray-600': !isEditingTitle,
        }"
      >
        <PhFile :size="20" class="size-5 flex-shrink-0" />
        <div class="relative ml-2 flex-grow">
          <div v-if="isEditingTitle && !isTrash">
            <input
              ref="titleInputRef"
              v-model="editedTitle"
              @keyup.enter="saveTitle"
              @blur="saveTitle"
              class="bg-transparent outline-none w-full min-w-[50px]"
              :style="{ width: `${titleWidth}px` }"
              @input="updateTitleWidth"
              :class="{
                'border-b border-gray-600': isEditingTitle,
              }"
            />
            <span
              ref="titleMeasure"
              class="invisible absolute top-0 left-0 whitespace-pre"
            >
              {{ editedTitle }}
            </span>
          </div>
          <h1
            v-else-if="!isEditingTitle && !isTrash"
            ref="titleRef"
            class="cursor-text truncate border-b border-transparent hover:border-b hover:border-gray-600"
            @click="editTitle"
          >
            {{ truncatedTitle }}
          </h1>
          <h1
            v-else
            ref="titleRef"
            class="cursor-text truncate border-b border-transparent"
          >
            {{ truncatedTitle }}
          </h1>
        </div>
      </div>
    </div>

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
      <Button
        v-if="!isTrash"
        class="items-center flex mx-2 md:mx-4"
        title="Last Edited"
      >
        <PhSpinnerGap v-if="isSaving" :size="20" class="animate-spin" />
        <PhCalendarCheck v-else :size="20" />
        <span class="hidden md:flex md:ml-2">
          {{ localeDate(note.value.last_edited) }}
        </span>
      </Button>
      <Button
        v-if="isTrash && note.value.time_deleted"
        class="items-center flex mx-2 md:mx-4"
        title="Time Deleted"
      >
        <PhTrash :size="20" />
        <span class="hidden md:flex md:ml-2">
          {{ localeDate(note.value.time_deleted) }}
        </span>
      </Button>

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
          :icon="
            folder !== DEFAULT_FOLDERS.UNCATEGORIZED ? PhFolder : PhFolderMinus
          "
          :label="folderValue"
          :modelValue="activeSubmenu === 'folder'"
          @update:modelValue="toggleSubmenu('folder', $event)"
        >
          <DropdownItem
            v-for="folder in availableFolders"
            :key="folder"
            :icon="
              folder !== DEFAULT_FOLDERS.UNCATEGORIZED
                ? PhFolder
                : PhFolderMinus
            "
            :label="folder"
            :itemType="folder === folderValue ? 'active' : 'normal'"
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
  </div>
</template>

<script setup lang="ts">
  import {
    ref,
    computed,
    watch,
    nextTick,
    Ref,
    onMounted,
    onUnmounted,
  } from 'vue';
  import {
    PhFile,
    PhClipboardText,
    PhCopy,
    PhGlobe,
    PhGlobeX,
    PhFolder,
    PhFolderMinus,
    PhArrowsIn,
    PhArrowsOut,
    PhTrash,
    PhClockClockwise,
    PhPushPin,
    PhPushPinSlash,
    PhLock,
    PhDotsThreeCircle,
    PhSpinnerGap,
    PhX,
    PhCalendarCheck,
  } from '@phosphor-icons/vue';
  import { uiStore, folderStore, authStore, notesStore } from '@/store';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import DropdownSubmenu from '@/components/ui/dropdownSubmenu.vue';
  import Button from '@/components/ui/button.vue';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
  import { Note } from '@/store/notesStore/types';
  import {
    copyNoteContentToClipboard,
    copyPublicLink,
  } from '@/store/notesStore/actions';
  import { localeDate, isContentEmpty } from '@/store/notesStore/helpers';

  const props = defineProps<{
    note: Ref<Note>;
    isEditing: boolean;
    hasChanges: boolean;
    isSaving: boolean;
    isTrash: boolean;
  }>();

  const activeSubmenu = ref<'public' | 'folder' | null>(null);

  const toggleSubmenu = (submenu: 'public' | 'folder', isOpen: boolean) => {
    activeSubmenu.value = isOpen ? submenu : null;
  };
  const title = computed(() => props.note.value.title);
  const folder = computed(() => props.note.value.folder);
  const isNotePublic = computed(() =>
    notesStore.publicNotes.has(props.note.value.id)
  );
  const isNotePinned = computed(() =>
    notesStore.pinnedNotes.has(props.note.value.id)
  );

  const togglePublic = () => notesStore.togglePublic(props.note.value.id);
  const togglePin = () => notesStore.togglePin(props.note.value.id);
  const copyLink = () => copyPublicLink(props.note.value.id);
  const copyNote = () => copyNoteContentToClipboard(props.note.value);
  const duplicateNote = () => notesStore.duplicateNote(props.note.value);

  const moveNote = (folder: string) =>
    notesStore.moveNote(props.note.value.id, folder);

  const deleteNote = async () => {
    notesStore.closeNote();
    await notesStore.deleteNote(props.note.value.id);
  };

  const restoreNote = async () => {
    notesStore.restoreNote(props.note.value.id);
    notesStore.closeNote();
  };

  const deleteNotePermanently = async () => {
    uiStore.openAlertModal({
      message: `Are you sure you want to delete ${props.note.value.title}?`,
      cancel: () => {
        notesStore.openNote(props.note.value.id);
      },
      confirm: async () => {
        await notesStore.permanentlyDeleteNote(props.note.value.id);
      },
    });
    notesStore.closeNote();
  };

  const updateTitle = (newTitle: string) => {
    notesStore.updateNote(props.note.value.id, {
      ...props.note.value,
      title: newTitle,
    });
    uiStore.showToastMessage('Note title updated');
  };

  const closeNote = async () => {
    if (isContentEmpty(props.note.value.content)) {
      if (props.note.value.id) {
        await notesStore.deleteNote(props.note.value.id);
      }
      uiStore.showToastMessage('Empty note discarded');
    }
    notesStore.closeNote();
  };

  const titleRef = ref<HTMLElement | null>(null);
  const titleInputRef = ref<HTMLInputElement | null>(null);
  const titleMeasure = ref<HTMLElement | null>(null);
  const isEditingTitle = ref(false);
  const editedTitle = ref(title.value);
  const titleWidth = ref(0);
  const hoverPin = ref(false);
  const hoverPublic = ref(false);

  const truncatedTitle = computed(() => {
    const mobileMaxLength = 18;
    const midMaxLength = 25;
    const defaultMaxLength = 35;

    const truncate = (length: number) => {
      if (title.value.length <= length) return title.value;
      return title.value.slice(0, length - 3) + '...';
    };

    switch (true) {
      case isMobile.value && isNotePublic.value && isNotePinned.value:
        return truncate(mobileMaxLength);
      case isNotePublic.value || isNotePinned.value:
        return truncate(midMaxLength);
      default:
        return truncate(defaultMaxLength);
    }
  });

  const updateTitleWidth = () => {
    if (isEditingTitle && titleMeasure.value) {
      titleWidth.value = titleMeasure.value.offsetWidth;
    } else if (titleRef.value) {
      titleWidth.value = titleRef.value.offsetWidth;
    }
  };

  const editTitle = () => {
    if (!isEditingTitle.value) {
      isEditingTitle.value = true;
      editedTitle.value = title.value;

      nextTick(() => {
        titleInputRef.value?.focus();
        titleInputRef.value?.select();
      });
    }
  };

  const saveTitle = () => {
    isEditingTitle.value = false;
    if (editedTitle.value !== title.value && props.note.value.id) {
      updateTitle(editedTitle.value);
    }
  };

  const folderValue = computed(() => folder.value);

  const availableFolders = computed(() => {
    return [
      ...folderStore.folders.filter(
        (folder) => folder !== DEFAULT_FOLDERS.ALL_NOTES
      ),
    ];
  });

  const isExpanded = computed(() => uiStore.isExpanded);
  const isMobile = computed(() => window.innerWidth <= 768);
  const toggleExpand = () => uiStore.toggleExpand();

  watch(
    () => props.note.value.title,
    (newTitle) => {
      editedTitle.value = newTitle;
      nextTick(() => updateTitleWidth());
    }
  );

  watch(
    () => isEditingTitle,
    (newValue) => {
      if (newValue) {
        nextTick(() => {
          updateTitleWidth();
        });
      }
    }
  );

  watch(
    () => uiStore.activeDropdown,
    (newActiveDropdown) => {
      if (newActiveDropdown === null) {
        activeSubmenu.value = null;
      }
    }
  );

  onMounted(() => {
    updateTitleWidth();
    window.addEventListener('resize', updateTitleWidth);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateTitleWidth);
  });
</script>
