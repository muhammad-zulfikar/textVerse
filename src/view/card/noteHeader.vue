<template>
  <div class="relative mb-1" :class="{ 'mb-2': note.pinned || isNotePublic }">
    <h1
      class="font-bold text-sl font-serif cursor-pointer dark:text-white truncate"
    >
      {{ note.title }}
    </h1>
    <div class="absolute top-0 right-0 flex space-x-2">
      <span
        v-if="note.pinned"
        @click.stop="notesStore.togglePin(note.id)"
        class="justify-start px-2 py-1 hover:bg-cream-200 dark:hover:bg-gray-700 rounded-md card"
        @mouseenter="hoveredPinId = note.id"
        @mouseleave="hoveredPinId = null"
      >
        <PhPushPin
          v-if="hoveredPinId !== note.id"
          class="size-[14px] md:size-[16px]"
        />
        <PhPushPinSlash v-else class="size-[14px] md:size-[16px]" />
      </span>
      <span
        v-if="isNotePublic"
        @click.stop="notesStore.togglePublic(note.id)"
        class="justify-start px-2 py-1 hover:bg-cream-200 dark:hover:bg-gray-700 rounded-md card"
        @mouseenter="hoveredGlobeId = note.id"
        @mouseleave="hoveredGlobeId = null"
      >
        <PhGlobe
          v-if="hoveredGlobeId !== note.id"
          class="text-[10px] md:text-xs"
        />
        <PhGlobeX v-else class="text-[10px] md:text-xs" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import {
    PhPushPin,
    PhPushPinSlash,
    PhGlobe,
    PhGlobeX,
  } from '@phosphor-icons/vue';
  import { notesStore } from '@/store';
  import { Note } from '@/store/notesStore/types';

  const props = defineProps<{
    note: Note;
  }>();

  const hoveredPinId = ref<string | null>(null);
  const hoveredGlobeId = ref<string | null>(null);

  const isNotePublic = computed(() =>
    notesStore.publicNotes.has(props.note.id)
  );
</script>
