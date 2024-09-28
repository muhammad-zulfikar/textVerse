<template>
  <div class="mb-2 md:mb-4">
    <Transition name="slide-fade" mode="out-in">
      <component
        v-if="currentView && notesStore.notesLoaded && filteredNotes.length > 0"
        :key="uiStore.viewType"
        :is="currentView"
        :notes="filteredNotes"
      />
      <div
        v-else-if="notesStore.notesLoaded && filteredNotes.length === 0"
        class="flex flex-col items-center justify-center h-[60vh]"
      >
        <component
          :is="isTrash ? PhTrash : PhEmpty"
          :size="100"
          class="text-gray-400 dark:text-gray-600 mb-4"
        />
        <p class="text-gray-600 dark:text-gray-400 text-lg font-serif">
          {{ noNotesMessage }}
        </p>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
  import { computed, defineAsyncComponent } from 'vue';
  import { notesStore, uiStore } from '@/store';
  import { PhEmpty, PhTrash } from '@phosphor-icons/vue';

  const props = defineProps<{
    notes: ReturnType<typeof notesStore.filteredNotes>;
    isTrash?: boolean;
  }>();

  const filteredNotes = computed(() => props.notes);

  const noNotesMessage = computed(() => {
    if (props.isTrash) {
      return notesStore.searchQuery ? 'No notes found' : 'Trash empty';
    }
    return 'No notes found';
  });

  const currentView = computed(() => {
    switch (uiStore.viewType) {
      case 'card':
        return defineAsyncComponent(() => import('@/view/cardView.vue'));
      case 'table':
        return defineAsyncComponent(() => import('@/view/tableView.vue'));
      case 'mail':
        return defineAsyncComponent(() => import('@/view/mailView.vue'));
      case 'folder':
        return defineAsyncComponent(() => import('@/view/folderView.vue'));
      default:
        return null;
    }
  });
</script>

<style scoped>
  .break-inside-avoid {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }
</style>
