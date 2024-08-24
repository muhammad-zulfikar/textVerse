<template>
  <div class="mb-[28px] md:mb-[46px]">
    <template v-if="notesStore.filteredNotes.length > 0">
      <transition name="slide-fade" mode="out-in">
        <keep-alive>
          <component
            v-if="currentView"
            :key="uiStore.viewType"
            :is="currentView"
            :notes="filteredNotes"
          />
        </keep-alive>
      </transition>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, watch, computed } from 'vue';
  import { authStore, notesStore, folderStore, uiStore } from '@/store/stores';
  import cardView from './view/cardView.vue';
  import tableView from './view/tableView.vue';
  import mailView from './view/mailView.vue';
  import folderView from './view/folderView.vue';

  const filteredNotes = computed(() =>
    notesStore.filteredNotes(folderStore.currentFolder)
  );

  const loadNotes = async () => {
    await notesStore.loadNotes();
  };

  onMounted(async () => {
    await loadNotes();
  });

  watch(
    () => authStore.user,
    async () => {
      await loadNotes();
    }
  );

  const currentView = computed(() => {
    switch (uiStore.viewType) {
      case 'card':
        return cardView;
      case 'table':
        return tableView;
      case 'mail':
        return mailView;
      case 'folder':
        return folderView;
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
