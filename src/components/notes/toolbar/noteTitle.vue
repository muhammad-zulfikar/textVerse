<template>
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
</template>

<script setup lang="ts">
  import { PhFile } from '@phosphor-icons/vue';
  import { Ref } from 'vue';
  import { Note } from '@/store/notesStore/types';
  import { useNoteTitle } from '@/utils/useNoteTitle';

  const props = defineProps<{
    note: Ref<Note>;
    isTrash: boolean;
  }>();

  const {
    isEditingTitle,
    editedTitle,
    titleWidth,
    titleRef,
    titleInputRef,
    titleMeasure,
    truncatedTitle,
    updateTitleWidth,
    editTitle,
    saveTitle,
  } = useNoteTitle(props.note);
</script>
