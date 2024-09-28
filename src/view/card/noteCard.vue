<template>
  <div
    class="notes card mb-2 p-2 cursor-pointer relative group select-none transform-gpu transition-all duration-300"
    :class="[{ shadow: props.note.pinned }, { selected: props.isSelected }]"
    @click.stop="$emit('click', props.note)"
    @contextmenu.prevent="$emit('contextmenu', $event)"
  >
    <SelectButton :note="props.note" />
    <Header :note="props.note" />
    <Separator />
    <Content :note="props.note" />
    <Footer :note="props.note" />
  </div>
</template>

<script setup lang="ts">
  import { Note } from '@/store/notesStore/types';
  import Separator from '@/components/ui/separator.vue';
  import SelectButton from './selectButton.vue';
  import Header from './header.vue';
  import Content from './content.vue';
  import Footer from './footer.vue';

  const props = defineProps<{
    note: Note;
    isSelected: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'click', note: Note): void;
    (e: 'contextmenu', event: MouseEvent): void;
  }>();
</script>

<style scoped>
  .notes.selected {
    border-width: 2px;
  }

  .notes:active {
    transform: scale(0.98);
  }

  .shadow {
    box-shadow:
      0 30px 60px -15px rgba(0, 0, 0, 0.3),
      0 12px 16px -8px rgba(0, 0, 0, 0.2);
  }

  .shadow:hover {
    box-shadow:
      0 30px 60px -15px rgba(0, 0, 0, 0.3),
      0 12px 16px -8px rgba(0, 0, 0, 0.2);
  }
</style>
