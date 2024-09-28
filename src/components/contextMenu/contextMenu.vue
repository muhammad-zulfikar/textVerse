<template>
  <TransitionGroup name="zoom">
    <div v-if="showMenu" class="fixed inset-0 z-50 select-none">
      <div class="fixed inset-0" @click="hideMenu"></div>
      <div ref="menuRef" :style="menuStyle" class="z-60 card-no-transition">
        <ul class="font-serif text-sm min-w-[145px] w-fit py-1">
          <template v-if="!isTrashRoute">
            <DropdownItem
              label="Copy"
              :icon="PhClipboardText"
              @click="copyNote"
            />
            <DropdownItem
              label="Duplicate"
              :icon="PhCopy"
              @click="duplicateNote"
            />
            <DropdownItem
              :label="isNotePinned ? 'Unpin' : 'Pin'"
              :icon="isNotePinned ? PhPushPinSlash : PhPushPin"
              @click="togglePin"
            />
            <DropdownSubmenu
              v-if="authStore.isLoggedIn"
              :label="isNotePublic ? 'Public' : 'Private'"
              :icon="isNotePublic ? PhGlobe : PhLock"
              :modelValue="activeSubmenu === 'public'"
              @update:modelValue="toggleSubmenu('public', $event)"
            >
              <DropdownItem
                label="Public"
                :icon="PhGlobe"
                :itemType="isNotePublic ? 'active' : 'normal'"
                @click="togglePublic"
              />
              <DropdownItem
                label="Private"
                :icon="PhLock"
                :itemType="!isNotePublic ? 'active' : 'normal'"
                @click="togglePublic"
              />
              <DropdownItem
                v-if="isNotePublic"
                label="Copy Link"
                :icon="PhLink"
                @click="copyLink"
              />
            </DropdownSubmenu>
            <DropdownSubmenu
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
                :label="folder"
                :icon="
                  folder !== DEFAULT_FOLDERS.UNCATEGORIZED
                    ? notesCountByFolder[folder] === 0
                      ? PhFolderDashed
                      : PhFolder
                    : PhFolderMinus
                "
                :itemType="folder === note.folder ? 'active' : 'normal'"
                @click="moveNote(folder)"
              />
            </DropdownSubmenu>
            <DropdownItem
              label="Delete"
              :icon="PhTrash"
              itemType="destructive"
              @click="deleteNote"
            />
          </template>
          <template v-else>
            <DropdownItem
              label="Restore"
              :icon="PhArrowCounterClockwise"
              @click="restoreNote"
            />
            <DropdownItem
              label="Delete permanently"
              :icon="PhTrash"
              itemType="destructive"
              @click="deleteNotePermanently"
            />
          </template>
        </ul>
      </div>
    </div>
  </TransitionGroup>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
  import { useRoute } from 'vue-router';
  import { authStore } from '@/store';
  import { Note } from '@/store/notesStore/types';
  import {
    PhClipboardText,
    PhCopy,
    PhPushPin,
    PhPushPinSlash,
    PhGlobe,
    PhTrash,
    PhFolder,
    PhFolderDashed,
    PhFolderMinus,
    PhLink,
    PhLock,
    PhArrowCounterClockwise,
  } from '@phosphor-icons/vue';
  import { CSSProperties } from 'vue';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import DropdownSubmenu from '@/components/ui/dropdownSubmenu.vue';
  import { useNoteManagement } from '@/utils/useNoteManagement';

  const props = defineProps({
    visible: {
      type: Boolean,
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

  const emit = defineEmits(['hideMenu']);
  const route = useRoute();
  const isTrashRoute = computed(() => route.path === '/trash');

  const menuRef = ref<HTMLElement | null>(null);
  const showMenu = ref(false);
  const hideMenu = () => {
    emit('hideMenu');
  };

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
  } = useNoteManagement(
    computed(() => props.note),
    hideMenu
  );

  const activeSubmenu = ref<'public' | 'folder' | null>(null);
  const toggleSubmenu = (submenu: 'public' | 'folder', isOpen: boolean) => {
    activeSubmenu.value = isOpen ? submenu : null;
  };

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

  const handleOutsideClick = (event: MouseEvent) => {
    if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
      emit('hideMenu');
    }
  };

  const handleScroll = () => {
    emit('hideMenu');
  };

  watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        nextTick(() => {
          showMenu.value = true;
        });
      } else {
        showMenu.value = false;
      }
    },
    { immediate: true }
  );

  onMounted(() => {
    document.addEventListener('click', handleOutsideClick);
    window.addEventListener('scroll', handleScroll);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);
    window.removeEventListener('scroll', handleScroll);
  });
</script>
