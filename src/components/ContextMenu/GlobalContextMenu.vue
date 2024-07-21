<!-- GlobalContextMenu.vue -->

<template>
  <div v-if="visible" class="fixed inset-0 z-50 select-none">
    <div class="fixed inset-0" @click="hideMenu"></div>
    <div
      ref="menuRef"
      :style="menuStyle"
      class="custom-card-no-transition p-4 z-60"
      @click.stop
    >
      <ul v-if="!activeSubmenu" class="font-serif text-sm w-[100px]">
        <li
          @click="setActiveSubmenu('create')"
          class="hover:underline cursor-pointer mb-4"
        >
          Create
        </li>
        <li
          @click="setActiveSubmenu('folder')"
          class="hover:underline cursor-pointer mt-4"
        >
          Folder
        </li>
        <li
          @click="setActiveSubmenu('view')"
          class="hover:underline cursor-pointer mt-4"
        >
          View
        </li>
      </ul>

      <ul
        v-if="activeSubmenu === 'create'"
        class="font-serif text-sm w-[100px]"
      >
        <li @click="createNote" class="hover:underline cursor-pointer mb-4">
          Note
        </li>
        <li @click="openFolderForm" class="hover:underline cursor-pointer mt-4">
          Folder
        </li>
        <li
          @click="setActiveSubmenu(null)"
          class="hover:underline cursor-pointer mt-4"
        >
          Back
        </li>
      </ul>

      <ul
        v-if="activeSubmenu === 'folder'"
        class="font-serif text-sm w-[100px]"
      >
        <li
          v-for="(folder, index) in availableFolders"
          :key="folder"
          @click.stop="selectFolder(folder)"
          :class="{
            'mt-4': index !== 0,
            'block text-sm cursor-pointer hover:underline': true,
          }"
          role="menuitem"
        >
          {{ folder }}
        </li>
        <li
          @click="setActiveSubmenu(null)"
          class="hover:underline cursor-pointer mt-4"
        >
          Back
        </li>
      </ul>

      <ul v-if="activeSubmenu === 'view'" class="font-serif text-sm w-[100px]">
        <li
          v-for="(column, index) in columnOptions"
          :key="column"
          @click.stop="setColumns(column)"
          :class="{
            'mt-4': index !== 0,
            'block text-sm cursor-pointer hover:underline': true,
          }"
          role="menuitem"
        >
          {{ column }} Column{{ column > 1 ? 's' : '' }}
        </li>
        <li
          @click="setActiveSubmenu(null)"
          class="hover:underline cursor-pointer mt-4"
        >
          Back
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useNotesStore } from '@/store/store';
  import { CSSProperties } from 'vue';

  const props = defineProps({
    visible: Boolean,
    position: {
      type: Object as () => { x: number; y: number },
      required: true,
    },
  });

  const emit = defineEmits(['hideMenu', 'openFolderForm']);

  const store = useNotesStore();
  const menuRef = ref<HTMLElement | null>(null);
  const activeSubmenu = ref<string | null>(null);

  const availableFolders = computed(() => store.folders);
  const columnOptions = [1, 2, 3, 4, 5];

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

  const hideMenu = () => {
    activeSubmenu.value = null;
    emit('hideMenu');
  };

  const setActiveSubmenu = (submenu: string | null) => {
    activeSubmenu.value = submenu;
  };

  const createNote = () => {
    store.setEditing(true);
    hideMenu();
  };

  const openFolderForm = () => {
    emit('openFolderForm');
    hideMenu();
  };

  const selectFolder = (folder: string) => {
    store.setCurrentFolder(folder);
    hideMenu();
  };

  const setColumns = (columns: number) => {
    store.setColumns(columns);
    hideMenu();
  };

  const handleScroll = () => {
    hideMenu();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
      hideMenu();
    }
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll, true);
    document.removeEventListener('click', handleClickOutside);
  });
</script>
