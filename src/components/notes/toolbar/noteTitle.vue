<!--noteTitle.vue-->

<template>
  <div
    class="flex items-center mr-2 md:mr-4 px-2 py-1.5 card max-w-full"
    :class="{
      'hover:bg-cream-200 dark:hover:bg-gray-600':
        !isEditingTitle && !isTrashRoute,
    }"
  >
    <PhFile :size="20" class="size-5 flex-shrink-0" />
    <div class="relative ml-2 flex-grow overflow-hidden">
      <input
        v-if="isEditingTitle && !isTrashRoute"
        id="note-title-input"
        v-model="editedTitle"
        @keyup.enter="saveTitle"
        @blur="saveTitle"
        :style="{ width: `${titleWidth}px` }"
        class="bg-transparent outline-none px-0"
        :class="{
          'border-b border-gray-600': isEditingTitle,
        }"
      />
      <h1
        v-else
        class="cursor-text truncate border-b border-transparent w-full"
        :class="{ 'hover:border-b hover:border-gray-600': !isTrashRoute }"
        @click="handleTitleClick"
      >
        {{ title }}
      </h1>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { PhFile } from '@phosphor-icons/vue';
  import { Ref, watch, onMounted } from 'vue';
  import { Note } from '@/store/notesStore/types';
  import { useNoteTitle } from '@/utils/useNoteTitle';
  import { useCurrentRoute } from '@/utils/useCurrentRoute';

  const props = defineProps<{
    note: Ref<Note>;
  }>();

  const {
    title,
    isEditingTitle,
    editedTitle,
    titleWidth,
    editTitle,
    saveTitle,
    updateTitleWidth,
  } = useNoteTitle(props.note);

  const { isTrashRoute } = useCurrentRoute();

  const handleTitleClick = () => {
    if (!isTrashRoute.value) {
      editTitle();
    }
  };

  watch(isEditingTitle, (newValue) => {
    if (newValue) {
      updateTitleWidth();
    }
  });

  watch(title, (newTitle) => {
    props.note.value.title = newTitle;
  });

  onMounted(() => {
    updateTitleWidth();
  });
</script>
