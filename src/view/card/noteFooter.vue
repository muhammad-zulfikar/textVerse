<template>
  <div
    class="flex justify-between items-center pt-3 mt-auto font-serif text-gray-700 dark:text-gray-400 text-xs"
  >
    <div class="flex items-center">
      <div
        v-if="props.note.folder !== DEFAULT_FOLDERS.UNCATEGORIZED"
        class="ml-auto text-left text-[10px] md:text-xs"
      >
        <p
          class="flex items-center px-2 py-1 cursor-pointer truncate card hover:text-black dark:hover:text-white hover:bg-cream-200 dark:hover:bg-gray-700"
          @click.stop="folderStore.setCurrentFolder(props.note.folder)"
        >
          <PhFolder class="mr-1 md:mr-[6px] size-[14px] md:size-[16px]" />
          {{ props.note.folder }}
        </p>
      </div>
    </div>
    <div class="ml-auto text-left text-[10px] md:text-xs">
      <p class="flex items-center px-2 py-1 cursor-pointer truncate card">
        <PhCalendarBlank class="mr-1 md:mr-[6px] size-[14px] md:size-[16px]" />
        {{ localeDate(props.note.last_edited) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { PhFolder, PhCalendarBlank } from '@phosphor-icons/vue';
  import { folderStore } from '@/store';
  import { Note } from '@/store/notesStore/types';
  import { DEFAULT_FOLDERS } from '@/store/folderStore/constants';
  import { localeDate } from '@/store/notesStore/helpers';

  const props = defineProps<{
    note: Note;
  }>();
</script>
