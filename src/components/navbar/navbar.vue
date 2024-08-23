<template>
  <div class="sticky top-0 z-30">
    <div
      class="flex justify-between items-center p-2 md:p-4 h-[52px] md:h-[62px] bg-[#f7f4e4] dark:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 font-serif text-sm md:text-base select-none"
    >
      <div class="flex items-center w-full relative">
        <!-- Left: Menu (always) -->
        <transition-group name="slide-fade">
          <div
            v-if="!isSelectModeActive && !isSearchExpanded"
            class="flex items-center space-x-2 md:space-x-4"
          >
            <Button @click.stop="toggleSidebar">
              <PhList :size="20" />
            </Button>
            <Path />
          </div>
        </transition-group>

        <!-- Center: Search bar (desktop only, only on home page) -->
        <transition name="slide-fade">
          <div
            v-if="isHomePage && !isSelectModeActive"
            class="hidden md:flex absolute left-0 right-0 justify-center pointer-events-none"
          >
            <div class="w-1/3 pointer-events-auto">
              <SearchBar @update:modelValue="updateSearchQuery" />
            </div>
          </div>
        </transition>

        <!-- Right: Search (mobile), Create, View, Sync -->
        <transition name="slide-fade">
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
        </transition>

        <!-- Selection mode overlay -->
        <transition name="slide-fade">
          <div
            v-if="isSelectModeActive"
            class="absolute inset-0 flex items-center bg-[#f7f4e4] dark:bg-gray-700"
          >
            <div class="flex items-center">
              <Button @click="deselectAllNotes" class="mr-2 md:mr-4">
                <PhX :size="20" />
              </Button>
              <span>{{ notesStore.selectedNotes.length }} selected</span>
            </div>
            <div class="flex items-center ml-auto">
              <Button @click="selectAllNotes" class="mr-2 md:mr-4">
                <PhChecks :size="20" />
              </Button>
              <Button
                v-if="isTrashRoute"
                @click="restoreSelectedNotes"
                class="mr-2 md:mr-4"
              >
                <PhArrowCounterClockwise :size="20" />
              </Button>
              <Button v-else @click="togglePinSelected" class="mr-2 md:mr-4">
                <component
                  :is="allSelectedNotesPinned ? PhPushPinSlash : PhPushPin"
                  :size="20"
                />
              </Button>
              <Button @click="deleteSelectedNotes" variant="danger">
                <PhTrash :size="20" />
              </Button>
            </div>
          </div>
        </transition>
      </div>
    </div>
    <Separator />
    <LeftSidebar :isOpen="isSidebarOpen" />
    <AlertModal
      :is-open="showSignoutConfirmation"
      :message="`Are you sure you want to sign out? You won't be able to sync your notes.`"
      @cancel="showSignoutConfirmation = false"
      @confirm="signout"
    />
    <AlertModal
      v-if="isTrashRoute"
      :is-open="showDeleteConfirmation"
      :message="'Are you sure you want to permanently delete the selected notes?'"
      @confirm="confirmDeleteSelected"
      @cancel="showDeleteConfirmation = false"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import {
    PhList,
    PhX,
    PhPushPin,
    PhPushPinSlash,
    PhTrash,
    PhChecks,
    PhArrowCounterClockwise,
  } from '@phosphor-icons/vue';
  import { authStore, notesStore, uiStore } from '@/store/stores';
  import Button from '@/components/ui/button.vue';
  import Separator from '@/components/ui/separator.vue';
  import SearchBar from '@/components/searchBar/searchBar.vue';
  import Create from '@/components/ui/dropdown/createDropdown.vue';
  import SyncButton from '@/components/ui/button/syncButton.vue';
  import Path from '@/components/ui/dropdown/pathDropdown.vue';
  import View from '@/components/ui/dropdown/viewDropdown.vue';
  import AlertModal from '@/components/ui/modal/alertModal.vue';
  import LeftSidebar from '@/components/ui/menuSidebar.vue';

  const router = useRouter();
  const route = useRoute();
  const isTrashRoute = computed(() => route.path === '/trash');
  const showSignoutConfirmation = ref(false);
  const showDeleteConfirmation = ref(false);
  const isSidebarOpen = ref(false);

  const isSearchExpanded = ref(false);

  const setSearchExpanded = (expanded: boolean) => {
    isSearchExpanded.value = expanded;
  };

  const updateSearchQuery = (query: string) => {
    if (notesStore && notesStore.setSearchQuery) {
      notesStore.setSearchQuery(query);
    } else {
      console.error('notesStore or setSearchQuery is not available');
    }
  };

  const isHomePage = computed(() => route.path === '/');
  const isSelectModeActive = computed(
    () => notesStore.selectedNotes.length > 0
  );

  const signout = async () => {
    await authStore.logout();
    showSignoutConfirmation.value = false;
    router.push('/');
  };

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const closeSidebar = () => {
    isSidebarOpen.value = false;
  };

  const selectAllNotes = () => {
    notesStore.selectAllNotes();
  };

  const deselectAllNotes = () => {
    notesStore.clearSelectedNotes();
  };

  const allSelectedNotesPinned = computed(() => {
    return (
      notesStore.selectedNotes.length > 0 &&
      notesStore.selectedNotes.every((noteId) => {
        const note = notesStore.notes.find((n) => n.id === noteId);
        return note && note.pinned;
      })
    );
  });

  const togglePinSelected = async () => {
    if (allSelectedNotesPinned.value) {
      await notesStore.unpinSelectedNotes();
    } else {
      await notesStore.pinSelectedNotes();
    }
  };

  const restoreSelectedNotes = async () => {
    for (const noteId of notesStore.selectedNotes) {
      await notesStore.restoreNote(noteId);
    }
    notesStore.clearSelectedNotes();
    uiStore.showToastMessage('Selected notes restored');
  };

  const deleteSelectedNotes = () => {
    if (isTrashRoute.value) {
      showDeleteConfirmation.value = true;
    } else {
      notesStore.deleteSelectedNotes(false);
    }
  };

  const confirmDeleteSelected = () => {
    notesStore.deleteSelectedNotes(true);
    showDeleteConfirmation.value = false;
  };

  const handleOutsideClick = () => {
    if (isSidebarOpen.value) {
      closeSidebar();
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleOutsideClick);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick);
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
