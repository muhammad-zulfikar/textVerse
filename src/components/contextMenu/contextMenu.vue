<template>
  <div v-if="visible" class="fixed inset-0 z-50 select-none">
    <div class="fixed inset-0" @click="hideMenu"></div>
    <div ref="menuRef" :style="menuStyle" class="z-60 card-no-transition">
      <ul class="font-serif text-sm min-w-[145px] w-fit p-1">
        <template v-if="!showFolderOptions">
          <li
            v-for="(item, index) in menuItems"
            :key="index"
            @click="item.action"
            :class="[
              'p-2 cursor-pointer w-full text-left rounded-md transition-colors duration-200 flex items-center',
              item.class || 'hover:bg-cream-200 dark:hover:bg-gray-700',
            ]"
          >
            <component :is="item.icon" :size="20" class="mr-2" />
            {{ item.label }}
          </li>
        </template>
        <template v-else>
          <li
            v-for="folder in sortedFolders"
            :key="folder"
            @click.stop="moveNote(folder)"
            class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
          >
            <component
              :is="
                folder === DEFAULT_FOLDERS.UNCATEGORIZED
                  ? PhFolderMinus
                  : PhFolder
              "
              class="size-5 mr-2"
            />
            {{ folder }}
          </li>
          <div
            class="bg-black dark:bg-gray-400 h-px transition-all duration-300"
          ></div>
          <li
            @click.stop="toggleFolderOptions"
            class="p-2 cursor-pointer w-full text-left rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
          >
            <PhCaretLeft :size="20" class="mr-2" />
            Back
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { notesStore, folderStore, authStore } from '@/store';
  import { Note } from '@/store/notesStore/types';
  import {
    PhCheckCircle,
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
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
  import { copyNoteContentToClipboard } from '@/store/notesStore/actions';

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
    'select',
    'delete',
    'pin',
    'public',
    'duplicate',
  ]);

  const menuItems = computed(() => [
    {
      label: 'Select',
      icon: PhCheckCircle,
      action: selectNote,
    },
    {
      label: 'Copy',
      icon: PhClipboardText,
      action: copyNote,
    },
    {
      label: 'Duplicate',
      icon: PhCopy,
      action: duplicateNote,
    },
    {
      label: isNotePinned.value ? 'Unpin' : 'Pin',
      icon: isNotePinned.value ? PhPushPinSlash : PhPushPin,
      action: pinNote,
    },
    ...(authStore.isLoggedIn
      ? [
          {
            label: isNotePublic.value ? 'Unpublic' : 'Make public',
            icon: isNotePublic.value ? PhGlobeX : PhGlobe,
            action: publicNote,
          },
        ]
      : []),
    {
      label: 'Move to',
      icon: PhFolderPlus,
      action: toggleFolderOptions,
    },
    {
      label: 'Delete',
      icon: PhTrash,
      action: deleteNote,
      class:
        'text-red-500 hover:text-red-100 hover:bg-red-700/50 dark:hover:bg-red-800/60',
    },
  ]);

  const showFolderOptions = ref(false);
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
  const isNotePinned = computed(() => notesStore.pinnedNotes.has(props.noteId));

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

  const selectNote = () => {
    emit('select', props.note.id);
    emit('hideMenu');
  };

  const copyNote = () => {
    copyNoteContentToClipboard(props.note);
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

  const publicNote = () => {
    emit('public', props.noteId);
    emit('hideMenu');
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
      hideMenu();
    }
  };

  const handleScroll = () => {
    hideMenu();
  };

  onMounted(() => {
    document.addEventListener('click', handleOutsideClick);
    window.addEventListener('scroll', handleScroll);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);
    window.removeEventListener('scroll', handleScroll);
  });
</script>
