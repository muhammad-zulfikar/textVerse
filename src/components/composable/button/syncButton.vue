<template>
  <div>
    <Button
      @click="handleClick"
      :disabled="isSyncing || (!authStore.isLoggedIn && !isSignInMode)"
    >
      <component
        :is="currentIcon"
        :size="20"
        :class="{ 'animate-spin': isSpinning }"
      />
    </Button>
  </div>
  <SignInModal id="signInModal" />
</template>

<script setup lang="ts">
  import { ref, computed, watch, defineAsyncComponent } from 'vue';
  import {
    PhCloudCheck,
    PhSpinnerGap,
    PhCloudSlash,
    PhSignIn,
  } from '@phosphor-icons/vue';
  import { firebaseStore, authStore, uiStore } from '@/store';
  import Button from '@/components/ui/button.vue';

  const SignInModal = defineAsyncComponent(
    () => import('@/components/composable/modal/signInModal.vue')
  );

  const isSyncing = ref(false);
  const isSpinning = ref(false);
  const syncStatus = ref('idle');
  const isSignInMode = ref(!authStore.isLoggedIn);

  const showSigninModal = () => {
    uiStore.setActiveModal('signInModal');
  };

  const currentIcon = computed(() => {
    if (isSignInMode.value) return PhSignIn;
    if (isSpinning.value) return PhSpinnerGap;
    if (syncStatus.value === 'error') return PhCloudSlash;
    return PhCloudCheck;
  });

  const handleClick = () => {
    if (isSignInMode.value) {
      showSigninModal();
    } else {
      syncNotes();
    }
  };

  const syncNotes = async () => {
    if (isSyncing.value || !authStore.isLoggedIn) return;

    isSyncing.value = true;
    isSpinning.value = true;
    syncStatus.value = 'syncing';
    uiStore.setSyncing(true);

    try {
      await Promise.all([
        firebaseStore.syncNotesFromFirebase(authStore.user!.uid),
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
      syncStatus.value = 'idle';
    } catch (error) {
      console.error('Error syncing notes:', error);
      syncStatus.value = 'error';
    } finally {
      setTimeout(() => {
        isSyncing.value = false;
        isSpinning.value = false;
        uiStore.showToastMessage('Notes synced successfully');
        uiStore.setSyncing(false);
      }, 100);
    }
  };

  watch(
    () => authStore.isLoggedIn,
    (newValue) => {
      isSignInMode.value = !newValue;
      if (newValue) {
        syncNotes();
      }
    }
  );
</script>
