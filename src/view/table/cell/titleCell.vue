<template>
  <td
    class="w-[250px] max-w-[190px] md:max-w-[250px] p-3 border-b-[1px] border-r-[1px] border-black dark:border-white relative group"
  >
    <div class="flex items-center">
      <div
        @click="$emit('open-note', props.note.id)"
        class="w-full bg-transparent outline-none truncate hover:underline cursor-pointer"
        :class="[{ selected: isSelected }]"
      >
        {{ note.title }}
      </div>
      <div class="flex items center absolute right-0 space-x-2 mr-2">
        <span
          v-if="isNotePinned"
          @click.stop="notesStore.togglePin(props.note.id)"
          class="px-2 py-1 hover:bg-cream-200 dark:hover:bg-gray-700 rounded-md card cursor-pointer"
          @mouseenter="hoveredPinId = props.note.id"
          @mouseleave="hoveredPinId = null"
        >
          <PhPushPin v-if="hoveredPinId !== props.note.id" :size="16" />
          <PhPushPinSlash v-else :size="16" />
        </span>
        <span
          v-if="isNotePublic"
          @click.stop="notesStore.togglePublic(props.note.id)"
          class="px-2 py-1 hover:bg-cream-200 dark:hover:bg-gray-700 rounded-md card cursor-pointer"
          @mouseenter="hoveredPublicId = props.note.id"
          @mouseleave="hoveredPublicId = null"
        >
          <PhGlobe v-if="hoveredPublicId !== props.note.id" :size="16" />
          <PhGlobeX v-else :size="16" />
        </span>
      </div>
    </div>
  </td>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { notesStore } from '@/store';
  import { Note } from '@/store/notesStore/types';
  import {
    PhGlobe,
    PhGlobeX,
    PhPushPin,
    PhPushPinSlash,
  } from '@phosphor-icons/vue';
  import { useNoteManagement } from '@/utils/useNoteManagement';

  const props = defineProps<{
    note: Note;
    isSelected: boolean;
  }>();

  defineEmits<{
    (e: 'open-note', noteId: string): void;
  }>();

  const hoveredPinId = ref<string | null>(null);
  const hoveredPublicId = ref<string | null>(null);

  const { isNotePublic, isNotePinned } = useNoteManagement(
    computed(() => props.note)
  );
</script>

<style scoped>
  .selected {
    text-decoration: underline;
  }
</style>
