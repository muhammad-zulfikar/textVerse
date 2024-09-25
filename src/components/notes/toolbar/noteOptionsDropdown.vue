<!-- NoteOptionsDropdown.vue -->
<template>
  <Dropdown
    ref="dropdownRef"
    dropdownId="noteOptionsDropdown"
    contentWidth="9rem"
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

    <DropdownItem @click="$emit('closeNote')" icon="PhX">Close</DropdownItem>

    <DropdownItem
      v-if="!isMobile"
      @click="$emit('toggleExpand')"
      :icon="isExpanded ? 'PhArrowsIn' : 'PhArrowsOut'"
    >
      {{ isExpanded ? 'Collapse' : 'Expand' }}
    </DropdownItem>

    <DropdownItem
      v-if="!isTrash"
      @click="$emit('copyNote')"
      icon="PhClipboardText"
    >
      Copy
    </DropdownItem>

    <DropdownItem v-if="!isTrash" @click="$emit('duplicateNote')" icon="PhCopy">
      Duplicate
    </DropdownItem>

    <DropdownItem
      v-if="!isNotePinned && !isTrash"
      @click="$emit('togglePin')"
      icon="PhPushPin"
    >
      Pin
    </DropdownItem>

    <DropdownItem
      v-if="isNotePinned && !isTrash"
      @click="$emit('togglePin')"
      icon="PhPushPinSlash"
    >
      Unpin
    </DropdownItem>

    <DropdownSubmenu
      v-if="!isTrash"
      :icon="isNotePublic ? 'PhGlobe' : 'PhLock'"
      :label="isNotePublic ? 'Public' : 'Private'"
    >
      <DropdownItem
        @click="$emit('togglePublic')"
        :icon="isNotePublic ? 'PhGlobe' : 'PhLock'"
        :active="!isNotePublic"
      >
        Private
      </DropdownItem>
      <DropdownItem
        @click="$emit('togglePublic')"
        icon="PhGlobe"
        :active="isNotePublic"
      >
        Public
      </DropdownItem>
      <DropdownItem
        v-if="isNotePublic"
        @click="$emit('copyLink')"
        icon="PhCopy"
      >
        Copy link
      </DropdownItem>
    </DropdownSubmenu>

    <DropdownSubmenu v-if="!isTrash" icon="PhFolder" :label="note.folder">
      <DropdownItem
        v-for="folder in availableFolders"
        :key="folder"
        @click="$emit('moveNote', folder)"
        icon="PhFolder"
        :active="folder === note.folder"
      >
        {{ folder }}
      </DropdownItem>
    </DropdownSubmenu>

    <DropdownItem
      v-if="isEditing"
      @click="$emit('deleteNote')"
      icon="PhTrash"
      class="text-red-500 hover:text-red-100"
    >
      Delete
    </DropdownItem>

    <DropdownItem
      v-if="isTrash"
      @click="$emit('restoreNote')"
      icon="PhClockClockwise"
    >
      Restore
    </DropdownItem>

    <DropdownItem
      v-if="isTrash"
      @click="$emit('deletePermanently')"
      icon="PhTrash"
      class="text-red-500 hover:text-red-100"
    >
      Delete
    </DropdownItem>
  </Dropdown>
</template>

<script setup lang="ts">
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import DropdownSubmenu from '@/components/ui/dropdownSubmenu.vue';
  import { Note } from '@/store/notesStore/types';

  const props = defineProps<{
    note: Note;
    isTrash: boolean;
    isEditing: boolean;
    isExpanded: boolean;
    isMobile: boolean;
    isNotePinned: boolean;
    isNotePublic: boolean;
    availableFolders: string[];
  }>();

  const emit = defineEmits<{
    (e: 'closeNote'): void;
    (e: 'toggleExpand'): void;
    (e: 'copyNote'): void;
    (e: 'duplicateNote'): void;
    (e: 'togglePin'): void;
    (e: 'togglePublic'): void;
    (e: 'copyLink'): void;
    (e: 'moveNote', folder: string): void;
    (e: 'deleteNote'): void;
    (e: 'restoreNote'): void;
    (e: 'deletePermanently'): void;
  }>();
</script>
