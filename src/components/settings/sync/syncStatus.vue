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
    <button
      v-if="authStore.isLoggedIn"
      @click="confirmSignout"
      class="w-full md:w-auto flex items-center justify-center text-sm md:text-base py-2 px-4 mt-4 md:mt-0"
      :class="[uiStore.blurEnabled ? 'custom-card-blur' : 'custom-card']"
    >
      <PhSignOut :size="20" class="mr-2" />
      Sign out
    </button>
    <router-link
      v-else
      to="/sign-in"
      class="w-full md:w-auto flex items-center justify-center text-sm md:text-base py-2 px-4 mt-4 md:mt-0"
      :class="[uiStore.blurEnabled ? 'custom-card-blur' : 'custom-card']"
    >
      <PhSignIn :size="20" class="mr-2" />
      Sign in
    </router-link>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router';
  import {
    PhCloudSlash,
    PhCloudCheck,
    PhSignIn,
    PhSignOut,
  } from '@phosphor-icons/vue';
  import { authStore, uiStore } from '@/utils/stores';

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
