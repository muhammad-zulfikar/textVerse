<template>
  <div
    class="flex flex-col md:flex-row items-start md:items-center md:justify-between"
  >
    <div class="flex-grow">
      <h4 class="flex items-center text-lg font-semibold mb-1">
        Sync status:
        <span
          class="flex items-center"
          :class="authStore.isLoggedIn ? 'text-green-500' : 'text-red-500'"
        >
          <PhCloudCheck v-if="authStore.isLoggedIn" :size="20" class="mx-2" />
          <PhCloudSlash v-else :size="20" class="mx-2" />
          {{ authStore.isLoggedIn ? 'On' : 'Off' }}
        </span>
      </h4>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        <span v-if="!authStore.isLoggedIn">Sign in to turn on notes sync</span>
        <span v-else>Your notes are being synced across devices.</span>
      </p>
    </div>
    <Button
      v-if="authStore.isLoggedIn"
      @click="openSignOutAlert"
      class="w-full md:w-auto text-sm md:text-base py-2 px-4 mt-4 md:mt-0"
    >
      <PhSignOut :size="20" class="mr-2" />
      Sign out
    </Button>
    <Button
      v-else
      @click="openSignInModal"
      class="w-full md:w-auto text-sm md:text-base py-2 px-4 mt-4 md:mt-0"
    >
      <PhSignIn :size="20" class="mr-2" />
      Sign in
    </Button>
  </div>

  <SignInModal id="signInModal" />

  <AlertModal
    id="signOutAlert"
    :message="signOutMessage"
    @cancel="closeSignOutAlert"
    @confirm="signout"
  />
</template>

<script setup lang="ts">
  import { defineAsyncComponent, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    PhCloudSlash,
    PhCloudCheck,
    PhSignIn,
    PhSignOut,
  } from '@phosphor-icons/vue';
  import { authStore, uiStore } from '@/store';
  import Button from '@/components/ui/button.vue';

  const SignInModal = defineAsyncComponent(
    () => import('@/components/composable/modal/signInModal.vue')
  );

  const AlertModal = defineAsyncComponent(
    () => import('@/components/composable/modal/alertModal.vue')
  );

  const openSignInModal = () => {
    uiStore.setActiveModal('signInModal');
  };

  const signOutMessage = ref('');

  const openSignOutAlert = () => {
    signOutMessage.value =
      "Are you sure you want to sign out? You won't be able to sync your notes.";
    uiStore.setActiveModal('signOutAlert');
  };

  const closeSignOutAlert = () => {
    uiStore.setActiveModal(null);
  };

  const signout = () => {
    uiStore.setActiveModal(null);
    confirmSignout();
  };

  const router = useRouter();

  const confirmSignout = async () => {
    try {
      await authStore.logout();
      router.push('/');
    } catch (error) {
      uiStore.showToastMessage('Error logging out, please try again later');
    }
  };
</script>
