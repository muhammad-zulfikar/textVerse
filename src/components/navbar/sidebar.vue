<template>
  <Button @click="toggleSidebar">
    <PhList :size="20" />
  </Button>

  <ModalBackdrop v-model="isOpen" @click="closeSidebar" />
  <transition name="slide-left">
    <div
      v-if="isOpen"
      class="card fixed inset-y-0 left-0 z-50 w-64 shadow-lg overflow-y-auto rounded-lg font-serif text-sm"
      @click.stop
    >
      <div
        class="flex justify-between items-center px-4 py-[6.5px] bg-cream-50 dark:bg-gray-700"
      >
        <img
          src="/icons/dark/android-chrome-512x512.png"
          class="size-12 -ml-2 hidden dark:block cursor-pointer"
        />
        <img
          src="/icons/light/android-chrome-512x512.png"
          class="size-12 -ml-2 dark:hidden cursor-pointer"
        />
      </div>

      <Separator />

      <div class="p-2">
        <h2 class="font-bold mb-2 px-2 mt-2">Menu</h2>
        <router-link
          v-for="(item, index) in menuItems"
          :key="index"
          :to="item.path"
          class="flex p-2 items-center hover:bg-cream-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
          @click="handleMenuItemClick(item)"
        >
          <component :is="item.icon" class="size-5 mr-2 inline-block" />
          {{ item.label }}
        </router-link>
        <router-link v-if="!authStore.isLoggedIn" to="/sign-in" class="my-1">
          <div
            class="text-sm p-2 cursor-pointer w-full text-left rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
          >
            <PhSignIn class="size-5 mr-2" />
            Sign in
          </div>
        </router-link>
      </div>

      <div class="p-2">
        <h2 class="font-bold mb-2 px-2 mt-2">Create</h2>
        <button
          @click="openNoteForm"
          class="w-full text-left p-2 rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PhFile class="size-5 mr-2" />
          Note
        </button>
        <button
          @click="openFolderForm"
          class="w-full text-left p-2 rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PhFolder class="size-5 mr-2" />
          Folder
        </button>
      </div>

      <div class="p-2">
        <h2 class="font-bold mb-2 px-2 mt-2">Recent Notes</h2>
        <div
          v-for="note in recentNotes"
          :key="note.id"
          @click="openNote(note.id)"
          class="flex items-center p-2 hover:bg-cream-200 dark:hover:bg-gray-700 rounded cursor-pointer transition-colors duration-200"
        >
          <PhFile class="size-5 mr-2" />
          <span class="truncate max-w-48">
            {{ note.title }}
          </span>
        </div>
      </div>

      <div v-if="authStore.isLoggedIn" class="p-2 absolute bottom-0 w-full">
        <button
          @click="toggleUserDropup"
          class="w-full py-2 px-4 flex justify-between items-center card transition-colors duration-200"
        >
          <div class="flex items-center">
            <img
              :src="authStore.avatarUrl"
              alt="User Avatar"
              class="size-8 rounded-full mr-2"
            />
            <span>{{ authStore.user?.displayName }}</span>
          </div>
          <div
            class="p-1 rounded-full hover:bg-cream-300 dark:hover:bg-gray-600 transition-transform duration-200"
            :class="{
              'rotate-180 bg-cream-300 dark:bg-gray-600': isUserDropupOpen,
            }"
          >
            <PhCaretUp class="size-4" />
          </div>
        </button>

        <transition name="fade">
          <div
            v-if="isUserDropupOpen"
            class="dropup card mt-2 p-2 mx-2 rounded shadow-lg z-60"
          >
            <p
              class="text-sm text-center text-gray-600 dark:text-gray-400 mb-2"
            >
              {{ authStore.user?.email }}
            </p>
            <div class="border-t border-gray-500 dark:border-gray-600 pt-2">
              <button
                @click="navigateToSettings"
                class="flex w-full text-left p-2 hover:bg-cream-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
              >
                <PhGear class="size-5 mr-2" />
                Settings
              </button>
              <button
                @click="openSignoutAlert"
                class="flex w-full text-left p-2 hover:bg-cream-200 dark:hover:bg-gray-700 rounded transition-colors duration-200"
              >
                <PhSignOut class="size-5 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
  <AlertModal
    :is-open="showSignoutConfirmation"
    :message="`Are you sure you want to sign out? You won't be able to sync your notes.`"
    @cancel="cancelSignout"
    @confirm="signout"
  />
  <InputModal
    :is-open="isFolderFormOpen"
    mode="folder"
    :max-length="10"
    @update="handleFolderSubmit"
    @close="closeFolderForm"
  />
</template>

<script setup lang="ts">
  import { ref, computed, watch, defineAsyncComponent } from 'vue';
  import { useRouter } from 'vue-router';
  import { authStore, notesStore, folderStore } from '@/store';
  import {
    PhList,
    PhHouseLine,
    PhGear,
    PhTrash,
    PhSignIn,
    PhSignOut,
    PhFile,
    PhFolder,
    PhCaretUp,
  } from '@phosphor-icons/vue';
  import ModalBackdrop from '@/components/ui/modal/backdropModal.vue';
  import Button from '@/components/ui/button.vue';
  import Separator from '../ui/separator.vue';

  const AlertModal = defineAsyncComponent(
    () => import('@/components/ui/modal/alertModal.vue')
  );

  const InputModal = defineAsyncComponent(
    () => import('@/components/ui/modal/inputModal.vue')
  );

  const isOpen = ref(false);
  const router = useRouter();
  const isUserDropupOpen = ref(false);
  const showSignoutConfirmation = ref(false);
  const isFolderFormOpen = ref(false);

  const toggleSidebar = () => {
    isOpen.value = !isOpen.value;
    if (!isOpen.value) {
      isUserDropupOpen.value = false;
    }
  };

  const closeSidebar = () => {
    isOpen.value = false;
    isUserDropupOpen.value = false;
  };

  const menuItems = [
    { label: 'Home', path: '/', icon: PhHouseLine },
    { label: 'Settings', path: '/settings', icon: PhGear },
    { label: 'Trash', path: '/trash', icon: PhTrash },
  ];

  const recentNotes = computed(() => {
    return notesStore.notes
      .filter((note) => !note.pinned)
      .sort((a, b) => {
        const dateA = new Date(a.last_edited).getTime();
        const dateB = new Date(b.last_edited).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  });

  const signout = async () => {
    showSignoutConfirmation.value = false;
    router.push('/');
    await authStore.logout();
  };

  const toggleUserDropup = (event: Event) => {
    event.stopPropagation();
    isUserDropupOpen.value = !isUserDropupOpen.value;
  };

  const openNote = (noteId: string) => {
    router.push('/');
    notesStore.openNote(noteId);
    closeSidebar();
  };

  const navigateToSettings = () => {
    router.push('/settings');
    closeSidebar();
  };

  const openSignoutAlert = () => {
    showSignoutConfirmation.value = true;
    closeSidebar();
  };

  const cancelSignout = () => {
    showSignoutConfirmation.value = false;
  };

  const handleMenuItemClick = (item: any) => {
    if (item.action) {
      item.action();
    }
    closeSidebar();
  };

  const openNoteForm = () => {
    router.push('/');
    notesStore.openNote(null);
    closeSidebar();
  };

  const openFolderForm = () => {
    router.push('/');
    isFolderFormOpen.value = true;
    closeSidebar();
  };

  const closeFolderForm = () => {
    isFolderFormOpen.value = false;
  };

  const handleFolderSubmit = (folderName: string) => {
    folderStore.addFolder(folderName);
    closeFolderForm();
  };

  watch(isOpen, (newValue) => {
    if (!newValue) {
      isUserDropupOpen.value = false;
    }
  });
</script>

<style scoped>
  .slide-left-enter-active,
  .slide-left-leave-active {
    transition: transform 0.3s ease;
  }

  .slide-left-enter-from,
  .slide-left-leave-to {
    transform: translateX(-100%);
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .dropup {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
  }
</style>
