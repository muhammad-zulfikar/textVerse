<!-- ContextMenu.vue -->

<template>
  <div v-if="visible" class="fixed inset-0 z-50 select-none">
    <div class="fixed inset-0" @click="hideMenu"></div>
    <div
      ref="menuRef"
      :style="menuStyle"
      class="custom-card-no-transition p-4 z-60"
    >
      <ul class="font-serif text-sm w-[100px]">
        <li
          v-if="!showFolderOptions"
          @click="editNote"
          class="hover:underline cursor-pointer mb-4"
        >
          Edit
        </li>
        <li
          v-if="!showFolderOptions"
          @click="copyNote"
          class="hover:underline cursor-pointer mt-4"
        >
          Copy
        </li>
        <li
          v-if="!showFolderOptions && props.note.pinned"
          @click="unpinNote"
          class="hover:underline cursor-pointer mt-4"
        >
          Unpin
        </li>
        <li
          v-if="!showFolderOptions && !props.note.pinned"
          @click="pinNote"
          class="hover:underline cursor-pointer mt-4"
        >
          Pin
        </li>
        <li
          v-if="!showFolderOptions"
          class="relative inline-block text-left mt-4"
          ref="dropdownRef"
        >
          <button
            @click.stop="toggleFolderOptions"
            class="hover:underline dark:hover:bg-transparent outline-none flex items-center"
          >
            Move to
          </button>
        </li>
        <li v-if="showFolderOptions">
          <ul>
            <li
              v-for="(folder, index) in availableFolders"
              :key="folder"
              @click.stop="moveNote(folder)"
              :class="{
                'mt-4': index !== 0,
                'block text-sm cursor-pointer hover:underline': true,
              }"
              role="menuitem"
            >
              {{ folder }}
            </li>
            <li
              @click.stop="toggleFolderOptions"
              class="hover:underline cursor-pointer mt-4"
            >
              Back
            </li>
          </ul>
        </li>
        <li
          v-if="!showFolderOptions"
          @click="downloadNote"
          class="hover:underline cursor-pointer mt-4"
        >
          Download
        </li>
        <li
          v-if="!showFolderOptions"
          @click="deleteNote"
          class="hover:underline cursor-pointer mt-4 text-red-500"
        >
          Delete
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { useNotesStore } from '@/store/store';
  import { Note } from '@/store/types';
  import { CSSProperties } from 'vue';

  const props = defineProps({
    visible: {
      type: Boolean,
      required: true,
    },
    noteId: {
      type: Number,
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
    'download',
    'pin',
    'unpin',
  ]);

  const store = useNotesStore();
  const showFolderOptions = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);
  const menuRef = ref<HTMLElement | null>(null);

  const availableFolders = computed(() =>
    store.folders.filter(
      (folder: string) => folder !== props.note.folder && folder !== 'All Notes'
    )
  );

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
    store.moveNote(props.note.id, targetFolder);
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
    store.copyNote(props.note.id);
    emit('hideMenu');
  };

  const deleteNote = () => {
    emit('delete', props.noteId);
    emit('hideMenu');
  };

  const downloadNote = () => {
    emit('download', props.note);
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
