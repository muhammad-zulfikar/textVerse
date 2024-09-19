<template>
  <div
    class="max-w-xl md:max-w-2xl py-8 px-4 md:px-8 flex flex-col mx-auto gap-8 overflow-y-auto font-serif select-none"
  >
    <div class="flex-grow flex flex-col gap-2 md:gap-8">
      <div class="p-4 card">
        <h2 class="text-2xl font-semibold mb-4">Sync your notes</h2>
        <div class="flex flex-col gap-4">
          <SyncStatus />
          <ImportNotes />
        </div>
      </div>

      <div class="p-4 card">
        <h2 class="text-2xl font-semibold mb-4">Appearance</h2>
        <div class="flex flex-col gap-4">
          <ThemeSelector />
          <ViewTypeSelector />
          <noteViewTypeSelector />
        </div>
      </div>

      <div class="p-4 card">
        <h2 class="text-2xl font-semibold mb-4">Manage your data</h2>
        <div class="flex flex-col gap-4">
          <BackupData />
          <DeleteData />
        </div>
      </div>

      <UserSettings v-if="authStore.isLoggedIn" />

      <footer
        class="flex justify-between items-center mt-4 text-sm text-gray-600 dark:text-gray-400"
      >
        <span>Created by Zulfikar</span>
        <div class="flex gap-4">
          <div class="flex items-center">
            <PhInfo :size="16" class="mr-2" />
            <router-link to="/about" class="hover:underline">About</router-link>
          </div>
          <div class="flex items-center">
            <PhGithubLogo :size="16" class="mr-2" />
            <a
              href="https://github.com/muhammad-zulfikar/textverse"
              target="_blank"
              class="hover:underline"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { authStore } from '@/utils/stores';
  import { PhInfo, PhGithubLogo } from '@phosphor-icons/vue';
  import SyncStatus from '@/components/settings/sync/syncStatus.vue';
  import ImportNotes from '@/components/settings/sync/importNotes.vue';
  import ThemeSelector from '@/components/settings/appearance/themeSelector.vue';
  import ViewTypeSelector from '@/components/settings/appearance/viewTypeSelector.vue';
  import noteViewTypeSelector from '@/components/settings/appearance/noteViewTypeSelector.vue';
  import BackupData from '@/components/settings/data/backupData.vue';
  import DeleteData from '@/components/settings/data/deleteData.vue';
  import UserSettings from '@/components/settings/user/userSettings.vue';
</script>
