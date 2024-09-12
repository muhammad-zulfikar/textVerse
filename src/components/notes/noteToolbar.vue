<!-- noteToolbar.vue -->

<template>
  <div class="flex justify-between items-center w-full text-sm">
    <div class="flex items-center mr-2 md:mr-4">
      <div
        class="flex items-center mr-2 md:mr-4 px-2 py-1.5 card"
        :class="{
          'hover:bg-[#d9c698] dark:hover:bg-gray-600': !isEditingTitle,
        }"
      >
        <PhFile :size="20" class="size-5 flex-shrink-0" />
        <div class="relative ml-2 flex-grow">
          <div v-if="isEditingTitle">
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
            v-else
            ref="titleRef"
            title="Click to change title"
            class="cursor-text truncate border-b border-transparent hover:border-b hover:border-gray-600"
            @click="editTitle"
          >
            {{ title }}
          </h1>
        </div>
      </div>

      <Dropdown
        ref="dropdownRef"
        dropdownId="noteOptionsDropdown"
        contentWidth="9rem"
        position="left"
        direction="down"
      >
        <template #label>
          <div
            class="flex items-center px-2 py-1.5 cursor-pointer card hover:bg-[#d9c698] dark:hover:bg-gray-600"
          >
            <PhDotsThreeCircle :size="20" class="size-5" />
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
          v-if="!isNotePinned"
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
          v-if="isNotePinned"
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
            <PhGlobe v-if="isNotePublic" :size="20" class="size-5 mr-2" />
            <PhLock v-else :size="20" class="size-5 mr-2" />
            {{ isNotePublic ? 'Public' : 'Private' }}
            <PhCaretRight :size="14" class="absolute right-2" />
          </span>
          <div
            v-if="activeSubmenu.visibility"
            :class="[
              'absolute top-0 card p-1 min-w-36 whitespace-nowrap',
              submenuPosition === 'right'
                ? 'left-full -ml-1'
                : 'right-full -mr-1',
            ]"
          >
            <div
              @click="togglePublic"
              class="p-2 cursor-pointer rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
            >
              <PhLock :size="20" class="size-5 mr-2" />
              Private
            </div>
            <div
              @click="togglePublic"
              class="p-2 cursor-pointer rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center whitespace-nowrap"
            >
              <PhGlobe :size="20" class="size-5 mr-2" />
              Public
            </div>
            <div
              v-if="isNotePublic"
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
              'absolute top-0 card p-1 min-w-36 whitespace-nowrap',
              submenuPosition === 'right'
                ? 'left-full -ml-1'
                : 'right-full -mr-1',
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
    </div>

    <div class="flex">
      <Button
        v-if="isNotePinned"
        class="ml-2 md:ml-4"
        @mouseenter="hoverPin = true"
        @mouseleave="hoverPin = false"
        @click="unpinNote"
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
        class="items-center hidden md:flex ml-2 md:ml-4"
        title="Last Edited"
      >
        <PhSpinnerGap v-if="isSaving" :size="20" class="mr-2 animate-spin" />
        <PhCalendarBlank v-else :size="20" class="mr-2" />
        {{
          notesStore.localeDate(
            note.value.last_edited || note.value.time_created
          )
        }}
      </Button>
      <Button class="ml-4" @click="closeNote">
        <PhX :size="20" class="size-5" />
      </Button>
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
    PhArrowsIn,
    PhArrowsOut,
    PhTrash,
    PhCaretRight,
    PhPushPin,
    PhPushPinSlash,
    PhLock,
    PhDotsThreeCircle,
    PhSpinnerGap,
    PhCalendarBlank,
    PhX,
  } from '@phosphor-icons/vue';
  import { notesStore, uiStore, folderStore, authStore } from '@/utils/stores';
  import Dropdown from '@/components/ui/dropdown.vue';
  import Button from '@/components/ui/button.vue';
  import { DEFAULT_FOLDERS } from '@/utils/constants';
  import { useNotesManagement } from '@/utils/useNotesManagement';
  import { Note } from '@/utils/types';

  const props = defineProps<{
    note: Ref<Note>;
    isEditMode: boolean;
    isValid: boolean;
    hasChanges: boolean;
    isSaving: boolean;
  }>();

  const {
    title,
    folder,
    isNotePublic,
    isNotePinned,
    togglePublic,
    copyPublicLink,
    copyNote,
    duplicateNote,
    pinNote,
    unpinNote,
    updateTitle,
    updateFolder,
    deleteNote,
    closeNote,
  } = useNotesManagement(props.note);

  const titleRef = ref<HTMLElement | null>(null);
  const titleInputRef = ref<HTMLInputElement | null>(null);
  const titleMeasure = ref<HTMLElement | null>(null);
  const isEditingTitle = ref(false);
  const editedTitle = ref(title.value);
  const titleWidth = ref(0);

  const updateTitleWidth = () => {
    if (isEditingTitle && titleMeasure.value) {
      titleWidth.value = titleMeasure.value.offsetWidth;
    } else if (titleRef.value) {
      titleWidth.value = titleRef.value.offsetWidth;
    }
  };

  const hoverPin = ref(false);
  const hoverPublic = ref(false);

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
    if (editedTitle.value !== title.value) {
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

  const activeSubmenu = ref({
    visibility: false,
    folder: false,
  });

  const submenuPosition = ref('right');

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
    (newDropdown) => {
      if (newDropdown === null) {
        activeSubmenu.value.visibility = false;
        activeSubmenu.value.folder = false;
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
