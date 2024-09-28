<template>
  <td
    class="p-3 border-b-[1px] border-r-[1px] border-black dark:border-white whitespace-nowrap"
  >
    {{ localeDate(lastEdited) }}
  </td>
</template>

<script setup lang="ts">
  import { localeDate } from '@/store/notesStore/helpers';

  defineProps<{
    lastEdited: string | Date;
  }>();
</script>
