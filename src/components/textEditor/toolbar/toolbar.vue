<template>
  <div class="toolbar flex">
    <div class="flex mr-4">
      <Save :note="note" :isNewNote="isNewNote" @save="handleSave" />
    </div>

    <div class="flex mr-4">
      <Heading />
    </div>

    <div class="flex mr-6">
      <TextFormat />
    </div>

    <div class="flex mr-6">
      <TextAlign />
    </div>

    <div class="flex mr-6">
      <List />
    </div>

    <div class="flex space-x-1 mr-6">
      <Code />
      <Blockquote />
    </div>

    <div class="flex space-x-1">
      <Link />
      <Image />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { defineProps, defineEmits } from 'vue';
  import Heading from './heading/heading.vue';
  import TextFormat from './textFormat/textFormat.vue';
  import TextAlign from './textAlign/textAlign.vue';
  import List from './list/list.vue';
  import Link from './link/link.vue';
  import Image from './image/image.vue';
  import Code from './code/code.vue';
  import Blockquote from './blockquote/blockquote.vue';
  import Save from './save.vue';
  import type { Note } from '@/store/notesStore/types';

  const props = defineProps<{
    note: Note;
    isNewNote: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'save', note: Note): void;
  }>();

  const handleSave = (note: Note) => {
    emit('save', note);
  };
</script>
