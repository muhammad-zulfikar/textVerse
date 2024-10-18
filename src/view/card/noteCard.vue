<template>
  <div
    class="notes card mb-2 p-2 cursor-pointer relative group select-none transform-gpu transition-all duration-300"
    :class="[{ shadow: props.note.pinned }]"
    @click.stop="$emit('click', props.note)"
    @contextmenu.prevent="handleContextMenu"
  >
    <SelectButton :note="props.note" :isSelected="isSelected" />
    <Header :note="props.note" />
    <Separator v-if="props.note.title" />
    <Content :note="props.note" />
    <Footer :note="props.note" />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { Note } from '@/store/notesStore/types';
  import { notesStore } from '@/store';
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

  const isSelected = computed(() =>
    notesStore.selectedNotes.includes(props.note.id)
  );

  const handleContextMenu = (event: MouseEvent) => {
    event.preventDefault();
    emit('contextmenu', event);

    notesStore.toggleNoteSelection(props.note.id);
  };
</script>
