<template>
  <div class="app-container">
    <LoadingSpinner v-if="isLoading" />
    <template v-else>
      <Navbar />
      <div class="scrollable-container">
        <router-view v-slot="{ Component, route }">
          <Transition :name="transitionName" mode="out-in">
            <component :is="Component" :key="route.path"></component>
          </Transition>
        </router-view>
      </div>
      <Toast />
      <ModalView />
    </template>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    authStore,
    localStore,
    uiStore,
    notesStore,
    folderStore,
  } from './store';
  import Navbar from '@/components/header/navbar.vue';
  import Toast from '@/components/ui/toast.vue';
  import LoadingSpinner from '@/components/ui/loading.vue';
  import ModalView from '@/components/composable/modal/modalView.vue';

  const router = useRouter();
  const routeOrder = ['Home', 'Settings', 'Trash', 'Sign In', 'About'];
  const transitionName = ref('slide-right');
  const isLoading = ref(true);

  watch(
    () => router.currentRoute.value,
    (to, from) => {
      const toIndex = to ? routeOrder.indexOf(to.name as string) : -1;
      const fromIndex = from ? routeOrder.indexOf(from.name as string) : -1;
      transitionName.value = toIndex > fromIndex ? 'slide-left' : 'slide-right';
    },
    { immediate: true }
  );

  const initializeApp = async () => {
    isLoading.value = true;
    const startTime = Date.now();

    try {
      await uiStore.initializeUI();
      await notesStore.initializeNotes();
      await folderStore.initializeFolders();

      if (!authStore.isLoggedIn && !localStore.initialNotesLoaded) {
        await localStore.loadInitialNotes();
      }
    } catch (error) {
      console.error('Error loading app:', error);
      uiStore.showToastMessage('An error occurred while loading the app');
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(2000 - elapsedTime, 0);

      setTimeout(() => {
        isLoading.value = false;
      }, remainingTime);
    }
  };

  watch(
    () => authStore.user,
    async (newUser, oldUser) => {
      if (newUser !== oldUser) {
        await initializeApp();
      }
    }
  );

  onMounted(async () => {
    await authStore.initializeAuth();
    await initializeApp();
  });
</script>

<style>
  html,
  body,
  #app {
    height: 100%;
    margin: 0;
  }

  .app-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .scrollable-container {
    flex: 1;
    overflow-y: auto;
  }
</style>
