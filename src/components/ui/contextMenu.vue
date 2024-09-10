<!-- ContextMenu.vue -->

<template>
  <div v-if="visible" class="fixed inset-0 z-50 select-none">
    <div class="fixed inset-0" @click="hideMenu"></div>
    <div
      ref="menuRef"
      :style="menuStyle"
      class="z-60"
      :class="[
        uiStore.blurEnabled ? 'custom-card-blur' : 'custom-card-no-transition',
      ]"
    >
      <ul class="font-serif text-sm min-w-[145px] w-fit p-1">
        <li
          v-if="!showFolderOptions"
          @click="editNote"
          class="flex p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PhNotePencil :size="20" class="mr-2" />
          Edit
        </li>
        <li
          v-if="!showFolderOptions"
          @click="copyNote"
          class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PhClipboardText :size="20" class="mr-2" />
          Copy
        </li>
        <li
          v-if="!showFolderOptions"
          @click="duplicateNote"
          class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PhCopy :size="20" class="mr-2" />
          Duplicate
        </li>
        <li
          v-if="!showFolderOptions && props.note.pinned"
          @click="unpinNote"
          class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PhPushPinSlash :size="20" class="mr-2" />
          Unpin
        </li>
        <li
          v-if="!showFolderOptions && !props.note.pinned"
          @click="pinNote"
          class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PhPushPin :size="20" class="mr-2" />
          Pin
        </li>
        <li
          v-if="!showFolderOptions"
          @click="publicNote"
          class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PhGlobe v-if="!isNotePublic" :size="20" class="mr-2" />
          <PhGlobeX v-else :size="20" class="mr-2" />
          {{ isNotePublic ? 'Unpublic' : 'Make public' }}
        </li>
        <li
          v-if="!showFolderOptions"
          class="relative inline-block text-left w-full"
          ref="dropdownRef"
        >
          <button
            @click.stop="toggleFolderOptions"
            class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
          >
            <PhFolderPlus :size="20" class="mr-2" />
            Move to
          </button>
        </li>
        <li v-if="showFolderOptions">
          <ul>
            <li
              v-for="(folder, _index) in sortedFolders"
              :key="folder"
              @click.stop="moveNote(folder)"
              class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
              role="menuitem"
            >
              <PhFolder
                v-if="folder !== DEFAULT_FOLDERS.UNCATEGORIZED"
                class="size-5 mr-2"
              />
              <PhFolderMinus v-else class="size-5 mr-2" />
              {{ folder }}
            </li>
            <div
              class="bg-black dark:bg-gray-400 h-px transition-all duration-300"
            ></div>
            <li
              @click.stop="toggleFolderOptions"
              class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
            >
              <PhCaretLeft :size="20" class="mr-2" />
              Back
            </li>
          </ul>
        </li>
        <li
          v-if="!showFolderOptions"
          @click="deleteNote"
          class="p-2 cursor-pointer w-full text-left rounded-md text-red-500 hover:text-red-100 hover:bg-red-700/50 dark:hover:bg-red-800/60 transition-colors duration-200 flex items-center"
        >
          <PhTrash :size="20" class="mr-2" />
          Delete
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { notesStore, folderStore, uiStore } from '@/utils/stores';
  import { Note } from '@/utils/types';
  import {
    PhNotePencil,
    PhClipboardText,
    PhCopy,
    PhPushPin,
    PhPushPinSlash,
    PhGlobe,
    PhGlobeX,
    PhTrash,
    PhCaretLeft,
    PhFolder,
    PhFolderPlus,
    PhFolderMinus,
  } from '@phosphor-icons/vue';

  import { CSSProperties } from 'vue';
  import { DEFAULT_FOLDERS } from '@/utils/constants';

  const props = defineProps({
    visible: {
      type: Boolean,
      required: true,
    },
    noteId: {
      type: String,
      required: true,
    },
    position: {
      type: Object as () => { x: number; y: number },
      required: true,
    },
    note: {
      type: Object as () => Note,
      required: true,
    },
  });

  const emit = defineEmits([
    'hideMenu',
    'edit',
    'delete',
    'pin',
    'unpin',
    'share',
    'duplicate',
  ]);

  const showFolderOptions = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);
  const menuRef = ref<HTMLElement | null>(null);

  const availableFolders = computed(() =>
    folderStore.folders.filter(
      (folder: string) =>
        folder !== props.note.folder && folder !== DEFAULT_FOLDERS.ALL_NOTES
    )
  );

  const sortedFolders = computed(() => {
    const folders = availableFolders.value;
    const uncategorizedIndex = folders.indexOf(DEFAULT_FOLDERS.UNCATEGORIZED);
    if (uncategorizedIndex > -1) {
      folders.push(folders.splice(uncategorizedIndex, 1)[0]);
    }
    return folders;
  });

  const isNotePublic = computed(() => notesStore.publicNotes.has(props.noteId));

  const calculateMenuPosition = (x: number, y: number) => {
    if (!menuRef.value) return { x, y };

    const menuRect = menuRef.value.getBoundingClientRect();
    const menuWidth = menuRect.width;
    const menuHeight = menuRect.height;
    const padding = 10;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let newX = x;
    let newY = y;

    if (x + menuWidth > windowWidth - padding) {
      newX = x - menuWidth;
    }

    if (y + menuHeight > windowHeight - padding) {
      newY = y - menuHeight;
    }

    newX = Math.max(padding, newX);
    newY = Math.max(padding, newY);

    return { x: newX, y: newY };
  };

  const menuStyle = computed(() => {
    const { x, y } = calculateMenuPosition(props.position.x, props.position.y);
    return {
      left: `${x}px`,
      top: `${y}px`,
      position: 'fixed',
      zIndex: 60,
    } as CSSProperties;
  });

  const moveNote = (targetFolder: string) => {
    notesStore.moveNote(props.note.id, targetFolder);
    showFolderOptions.value = false;
    emit('hideMenu');
  };

  const hideMenu = () => {
    showFolderOptions.value = false;
    emit('hideMenu');
  };

  const toggleFolderOptions = (event?: Event) => {
    if (event) {
      event.stopPropagation();
    }
    showFolderOptions.value = !showFolderOptions.value;
  };

  const editNote = () => {
    emit('edit', props.note.id);
    emit('hideMenu');
  };

  const copyNote = () => {
    notesStore.copyNote(props.note.id);
    emit('hideMenu');
  };

  const duplicateNote = () => {
    notesStore.duplicateNote(props.note);
    emit('hideMenu');
  };

  const deleteNote = () => {
    emit('delete', props.note.id);
    emit('hideMenu');
  };

  const pinNote = () => {
    emit('pin', props.noteId);
    emit('hideMenu');
  };

  const unpinNote = () => {
    emit('unpin', props.noteId);
    emit('hideMenu');
  };

  const publicNote = () => {
    emit('share', props.noteId);
    emit('hideMenu');
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
      hideMenu();
    }
  };

  const handleScroll = () => {
    hideMenu();
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('scroll', handleScroll);
  });
</script>

<style scoped>
  .z-50 {
    z-index: 50;
  }

  .z-60 {
    z-index: 60;
  }
</style>
