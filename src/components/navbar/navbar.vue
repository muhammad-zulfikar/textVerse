<template>
  <div class="sticky top-0 z-30">
    <div
      class="flex justify-between items-center p-2 md:p-4 h-[52px] md:h-[62px] bg-cream-50 dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 font-serif text-sm md:text-base select-none"
    >
      <div class="flex items-center w-full relative">
        <!-- Left: Menu (always) -->
        <TransitionGroup name="slide-fade">
          <div
            v-if="!isSelectModeActive && !isSearchExpanded"
            class="flex items-center"
          >
            <Button @click="openSidebar">
              <PhList :size="20" />
            </Button>
            <div class="mr-2 md:mr-4"></div>
            <Path v-if="!isPublicPage" />
          </div>
        </TransitionGroup>

        <Transition name="slide-fade">
          <div v-if="isSearchExpanded" class="absolute top-0 left-0">
            <Button @click.stop="setSearchExpanded(false)">
              <PhX :size="20" />
            </Button>
          </div>
        </Transition>

        <!-- Center: Search bar (desktop only, only on home page) -->
        <Transition name="slide-fade">
          <div
            v-if="isHomePage && !isSelectModeActive"
            class="hidden md:flex justify-center items-center w-full pointer-events-none"
          >
            <div class="w-1/3 pointer-events-auto">
              <SearchBar @update:modelValue="updateSearchQuery" />
            </div>
          </div>
        </Transition>

        <!-- Right: Search (mobile), Create, View, Sync -->
        <Transition name="slide-fade">
          <div
            v-if="isHomePage && !isSelectModeActive"
            class="flex items-center ml-auto"
          >
            <div class="mr-2 md:mr-4" v-if="!isSearchExpanded">
              <Create />
            </div>
            <div class="mr-2 md:mr-4">
              <View v-if="!isSearchExpanded" />
            </div>
            <div>
              <SyncButton v-if="!isSearchExpanded" />
            </div>
            <div class="md:hidden ml-2">
              <SearchBar
                @update:modelValue="updateSearchQuery"
                @expanded="setSearchExpanded"
              />
            </div>
          </div>
        </Transition>

        <Transition name="slide-fade">
          <SelectionModeOverlay v-if="isSelectModeActive" />
        </Transition>
      </div>
    </div>
    <Separator />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { PhList, PhX } from '@phosphor-icons/vue';
  import { notesStore, uiStore } from '@/store';
  import Button from '@/components/ui/button.vue';
  import Separator from '@/components/ui/separator.vue';
  import SearchBar from '@/components/navbar/searchBar.vue';
  import Create from '@/components/composable/dropdown/createDropdown.vue';
  import SyncButton from '@/components/composable/button/syncButton.vue';
  import Path from '@/components/composable/dropdown/pathDropdown.vue';
  import View from '@/components/composable/dropdown/viewDropdown.vue';
  import SelectionModeOverlay from '@/components/navbar/selectionModeOverlay.vue';

  const route = useRoute();
  const isSearchExpanded = ref(false);

  const setSearchExpanded = (expanded: boolean) => {
    isSearchExpanded.value = expanded;
  };

  const updateSearchQuery = (query: string) => {
    if (notesStore && notesStore.setSearchQuery) {
      notesStore.setSearchQuery(query);
    }
  };

  const openSidebar = () => {
    uiStore.setActiveModal('sidebar');
  };

  const isHomePage = computed(() => {
    return route.path === '/' || route.name === 'Note';
  });

  const isPublicPage = computed(() => {
    return route.path.startsWith('/public');
  });

  const isSelectModeActive = computed(
    () => notesStore.selectedNotes.length > 0
  );
</script>

<style scoped>
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: all 0.3s ease;
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
  }
</style>
