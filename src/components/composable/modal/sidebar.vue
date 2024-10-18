<template>
  <Modal
    :modelValue="isOpen"
    id="sidebar"
    transition="sidebar-left"
    @close="closeSidebar"
  >
    <div
      class="card fixed inset-y-0 left-0 z-50 w-64 shadow-lg overflow-y-auto rounded-lg font-serif text-sm select-none"
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
        <div v-if="!authStore.isLoggedIn" @click="openSigninModal" class="my-1">
          <div
            class="text-sm p-2 cursor-pointer w-full text-left rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
          >
            <PhSignIn class="size-5 mr-2" />
            Sign in
          </div>
        </div>
      </div>

      <div class="p-2">
        <h2 class="font-bold mb-2 px-2 mt-2">Create</h2>
        <li
          @click="openNoteForm"
          class="w-full text-left p-2 rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center cursor-pointer"
        >
          <PhFile class="size-5 mr-2" />
          Note
        </li>
        <li
          @click="openFolderForm"
          class="w-full text-left p-2 rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center cursor-pointer"
        >
          <PhFolder class="size-5 mr-2" />
          Folder
        </li>
      </div>

      <div v-if="recentNotes.length > 0" class="p-2">
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
        <Dropdown dropdownId="userDropdown" direction="up" contentWidth="100%">
          <template #label>
            <Button
              class="w-[14.9rem] py-2 px-4 flex justify-between items-center card transition-colors duration-200"
            >
              <div class="flex items-center">
                <img
                  :src="authStore.avatarUrl"
                  alt="User Avatar"
                  class="size-8 rounded-full object-cover mr-3"
                />
                <span>{{ authStore.user?.displayName || 'User' }}</span>
              </div>
              <div
                class="p-1 rounded-full hover:bg-cream-300 dark:hover:bg-gray-600 transition-transform duration-200"
                :class="{
                  'rotate-180 bg-cream-300 dark:bg-gray-600':
                    uiStore.activeDropdown === 'userDropdown',
                }"
              >
                <PhCaretUp class="size-4" />
              </div>
            </Button>
          </template>
          <p class="text-sm text-center text-gray-600 dark:text-gray-400 mb-1">
            {{ authStore.user?.email }}
          </p>
          <Separator />
          <DropdownItem
            @click="navigateToSettings"
            :icon="PhGear"
            label="Settings"
          />
          <DropdownItem
            @click="openSignOutAlert"
            :icon="PhSignOut"
            label="Sign out"
          />
        </Dropdown>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { authStore, folderStore, notesStore, uiStore } from '@/store';
  import {
    PhHouseLine,
    PhGear,
    PhTrash,
    PhSignIn,
    PhSignOut,
    PhFile,
    PhFolder,
    PhCaretUp,
  } from '@phosphor-icons/vue';
  import Modal from '@/components/ui/modal.vue';
  import Separator from '@/components/ui/separator.vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import Button from '@/components/ui/button.vue';

  const isOpen = computed(() => uiStore.activeModal === 'sidebar');

  const router = useRouter();
  const isUserDropupOpen = ref(false);

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

  const openNote = (noteId: string) => {
    router.push('/');
    closeSidebar();
    notesStore.openNote(noteId);
  };

  const navigateToSettings = () => {
    router.push('/settings');
    closeSidebar();
  };

  const openSigninModal = () => {
    uiStore.setActiveModal('signIn');
  };

  const closeSidebar = () => {
    uiStore.setActiveModal(null);
  };

  const openSignOutAlert = () => {
    uiStore.openAlertModal({
      message: `Are you sure you want to sign out? You won't be able to sync your notes.`,
      confirm: async () => {
        await authStore.logout();
        closeSidebar();
        router.push('/');
      },
      cancel: () => {
        closeSidebar();
      },
    });
  };

  const handleMenuItemClick = (item: any) => {
    if (item.action) {
      item.action();
    }
    closeSidebar();
  };

  const openNoteForm = () => {
    router.push('/');
    closeSidebar();
    notesStore.openNote(null);
  };

  const openFolderForm = () => {
    router.push('/');
    uiStore.openInputModal({
      mode: 'folder',
      maxLength: 10,
      cancel: () => {
        uiStore.setActiveModal(null);
      },
      confirm: (folderName: string) => {
        folderStore.addFolder(folderName);
        uiStore.showToastMessage(`Folder ${folderName} successfully created`);
      },
    });
  };

  const activeModal = computed(() => uiStore.activeModal);

  watch(activeModal, (newVal) => {
    if (newVal === null) {
      isUserDropupOpen.value = false;
    }
  });
</script>
