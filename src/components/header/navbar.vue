<template>
  <div class="sticky top-0 z-30">
    <div
      class="flex justify-between items-center p-2 md:p-4 h-[52px] md:h-[62px] bg-cream-50 dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 font-serif text-sm md:text-base select-none"
    >
      <div class="flex items-center w-full relative">
        <TransitionGroup name="slide-fade">
          <div
            v-if="!isSelectMode && !isSearchExpanded"
            class="flex items-center space-x-2 md:space-x-4"
          >
            <Button @click="openSidebar">
              <PhList :size="20" />
            </Button>
            <Path v-if="!isPublicRoute" />
          </div>
        </TransitionGroup>

        <Transition name="slide-fade">
          <div v-if="isSearchExpanded" class="absolute top-0 left-0">
            <Button @click.stop="setSearchExpanded(false)">
              <PhX :size="20" />
            </Button>
          </div>
        </Transition>

        <Transition name="slide-fade">
          <div
            v-if="!isSelectMode"
            class="hidden md:flex justify-center items-center w-full pointer-events-none"
          >
            <div class="w-1/3 pointer-events-auto">
              <SearchBar @expanded="setSearchExpanded" />
            </div>
          </div>
        </Transition>

        <Transition name="slide-fade">
          <div
            v-if="!isSettingsRoute && !isSelectMode"
            class="flex items-center ml-auto"
          >
            <Transition name="slide-fade">
              <div
                v-if="!isSearchExpanded"
                class="flex items-center space-x-2 md:space-x-4"
              >
                <Transition name="slide-fade">
                  <Create v-if="isHomeRoute" />
                </Transition>
                <View />
                <SyncButton />
              </div>
            </Transition>

            <div class="md:hidden ml-2">
              <SearchBar @expanded="setSearchExpanded" />
            </div>
          </div>
        </Transition>

        <Transition name="slide-fade">
          <SelectionModeOverlay v-if="isSelectMode" />
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
  import { uiStore } from '@/store';
  import Button from '@/components/ui/button.vue';
  import Separator from '@/components/ui/separator.vue';
  import SearchBar from '@/components/header/searchBar.vue';
  import Create from '@/components/composable/dropdown/createDropdown.vue';
  import SyncButton from '@/components/composable/button/syncButton.vue';
  import Path from '@/components/composable/dropdown/pathDropdown.vue';
  import View from '@/components/composable/dropdown/viewDropdown.vue';
  import SelectionModeOverlay from '@/components/header/selectionModeOverlay.vue';

  const route = useRoute();
  const isSearchExpanded = ref(false);

  const setSearchExpanded = (expanded: boolean) => {
    isSearchExpanded.value = expanded;
  };

  const openSidebar = () => {
    uiStore.setActiveModal('sidebar');
  };

  const isHomeRoute = computed(() => {
    return route.path === '/' || route.name === 'Note';
  });

  const isPublicRoute = computed(() => {
    return route.path.startsWith('/public');
  });

  const isSettingsRoute = computed(() => {
    return route.path.startsWith('/settings');
  });

  const isSelectMode = computed(() => {
    return uiStore.isSelectMode;
  });
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
