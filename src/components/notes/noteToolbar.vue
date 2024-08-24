<!-- components/NoteToolbar.vue -->
<template>
  <div class="flex justify-between items-center w-full text-sm">
    <div class="flex">
      <NoteOptionDropdown
        :noteId="noteId"
        :title="title"
        :isTitleEditing="isTitleEditing"
        :isPublic="isNotePublic"
        :folder="folder"
        :lastEditedDate="lastEditedDate"
        :content="content"
        :isEditMode="isEditMode"
        :isValid="isValid"
        :hasChanges="hasChanges"
        :isPinned="isPinned"
        @togglePublic="togglePublic"
        @copyPublicLink="copyPublicLink"
        @copyNote="copyNote"
        @duplicateNote="duplicateNote"
        @pinNote="pinNote"
        @unpinNote="unpinNote"
        @updateFolder="updateFolder"
        @deleteNote="deleteNote"
        @updateTitle="updateTitle"
        @finishTitleEdit="finishTitleEdit"
      />
      <Button class="ml-2 md:ml-4 py-1 px-2" @click="startTitleEdit">
        <PhPencilSimple v-if="!isTitleEditing" :size="20" class="size-5" />
        <PhCheckCircle v-else :size="20" class="size-5" />
      </Button>
    </div>
    <div class="flex">
      <Button
        v-if="isPinned"
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
        @mouseenter="hoverGlobe = true"
        @mouseleave="hoverGlobe = false"
        @click="togglePublic"
      >
        <PhGlobe v-if="!hoverGlobe" :size="20" class="size-5" />
        <PhGlobeX v-else :size="20" class="size-5" />
      </Button>
      <LastEditedButton
        :lastEdited="note.last_edited || note.time_created"
        :created="note.time_created"
        :isSaving="isSaving"
        class="hidden md:flex ml-2 md:ml-4"
      />
      <Button class="ml-4" @click="closeNote">
        <PhX :size="20" class="size-5" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    PhPencilSimple,
    PhCheckCircle,
    PhPushPin,
    PhPushPinSlash,
    PhGlobe,
    PhGlobeX,
    PhX,
  } from '@phosphor-icons/vue';
  import NoteOptionDropdown from '@/components/ui/dropdown/noteOptionDropdown.vue';
  import Button from '@/components/ui/button.vue';
  import LastEditedButton from '@/components/ui/button/lastEditedButton.vue';
  import { notesStore, uiStore } from '@/store/stores';
  import { Note } from '@/store/types';

  const props = defineProps<{
    note: Note;
    noteId: string | null;
    title: string;
    isTitleEditing: boolean;
    isEditMode: boolean;
    isValid: boolean;
    hasChanges: boolean;
    folder: string;
    lastEditedDate: string | Date;
    content: string;
    isPinned: boolean;
    isSaving: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'deleteNote'): void;
    (e: 'updateFolder', folder: string): void;
    (e: 'updateTitle', title: string): void;
    (e: 'startTitleEdit'): void;
    (e: 'finishTitleEdit', newTitle: string): void;
  }>();

  const startTitleEdit = () => {
    emit('startTitleEdit');
  };

  const finishTitleEdit = (newTitle: string) => {
    emit('finishTitleEdit', newTitle);
  };

  const isNotePublic = computed(() => {
    return props.noteId !== null && notesStore.publicNotes.has(props.noteId);
  });

  const togglePublic = () => {
    if (props.noteId !== null) {
      notesStore.togglePublic(props.noteId);
    }
  };

  const copyPublicLink = () => {
    if (props.noteId !== null) {
      notesStore.copyPublicLink(props.noteId);
    }
  };

  const copyNote = () => {
    if (props.noteId !== null) {
      notesStore.copyNote(props.noteId);
    }
  };

  const duplicateNote = () => {
    if (props.noteId !== null) {
      notesStore.duplicateNote(props.note);
    }
  };

  const pinNote = () => {
    if (props.noteId !== null) {
      notesStore.pinNote(props.noteId);
    }
  };

  const unpinNote = () => {
    if (props.noteId !== null) {
      notesStore.unpinNote(props.noteId);
    }
  };

  const closeNote = async () => {
    if (notesStore.isContentEmpty(props.note.content)) {
      if (props.note.id) {
        await notesStore.deleteNote(props.note.id);
      }
      uiStore.showToastMessage('Empty note discarded');
    } else if (props.isEditMode && !props.hasChanges) {
    } else {
      uiStore.closeNote();
      return;
    }

    uiStore.closeNote();
  };

  const updateTitle = (newTitle: string) => emit('updateTitle', newTitle);
  const deleteNote = () => emit('deleteNote');
  const updateFolder = (folder: string) => emit('updateFolder', folder);

  const hoverPin = ref(false);
  const hoverGlobe = ref(false);
</script>
