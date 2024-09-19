<template>
  <div class="p-4 card mb-2">
    <h2 class="text-2xl font-semibold mb-4">User Settings</h2>
    <div class="flex flex-col items-center">
      <img
        :src="userAvatar"
        alt="User Avatar"
        class="w-24 h-24 rounded-full mb-4 card-transparent-avatar object-cover cursor-pointer"
        @click="openAvatarViewer"
      />
      <h3 class="text-xl font-semibold">{{ username }}</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Account created: {{ joinedSince }}
      </p>
      <div
        class="flex flex-col gap-4 mt-6 w-full sm:flex-row sm:justify-center sm:gap-4"
      >
        <button
          @click="openAvatarPicker"
          class="card flex items-center justify-center py-2 px-4 text-sm md:text-base w-full sm:w-auto"
        >
          <PhSwap :size="20" class="mr-2" />
          Change Avatar
        </button>
        <button
          @click="openNameEditor"
          class="card flex items-center justify-center py-2 px-4 text-sm md:text-base w-full sm:w-auto"
        >
          <PhTextbox :size="20" class="mr-2" />
          Rename
        </button>
        <button
          @click="confirmDeleteAccount"
          class="card flex items-center justify-center text-red-600 dark:text-red-500 py-2 px-4 text-sm md:text-base w-full sm:w-auto"
        >
          <PhTrash :size="20" class="mr-2" />
          Delete Account
        </button>
      </div>
    </div>
  </div>

  <AlertModal
    :is-open="showDeleteAccountConfirmation"
    :message="'Are you sure you want to delete your account? This action cannot be undone.'"
    @cancel="showDeleteAccountConfirmation = false"
    @confirm="deleteAccount"
  />

  <AvatarModal
    :is-open="showAvatarPicker"
    :initial-avatar-url="userAvatar"
    @select="updateAvatar"
    @remove="removeAvatar"
    @close="showAvatarPicker = false"
  />

  <ImageViewModal
    :is-open="showAvatarViewer"
    :avatar-url="userAvatar"
    @close="showAvatarViewer = false"
  />

  <InputModal
    :is-open="showNameEditor"
    mode="username"
    :current-value="username"
    @update="updateName"
    @close="showNameEditor = false"
  />
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { PhSwap, PhTextbox, PhTrash } from '@phosphor-icons/vue';
  import { authStore, uiStore } from '@/utils/stores';
  import AlertModal from '@/components/ui/modal/alertModal.vue';
  import AvatarModal from '@/components/ui/modal/avatarModal.vue';
  import ImageViewModal from '@/components/ui/modal/imageViewModal.vue';
  import InputModal from '@/components/ui/modal/inputModal.vue';

  const router = useRouter();

  const showDeleteAccountConfirmation = ref(false);
  const showAvatarPicker = ref(false);
  const showNameEditor = ref(false);
  const showAvatarViewer = ref(false);

  const userAvatar = computed(() => authStore.avatarUrl);
  const username = computed(() => authStore.user?.displayName || 'User');
  const joinedSince = computed(() => {
    const joinedDate = authStore.user?.metadata?.creationTime;
    return joinedDate ? new Date(joinedDate).toLocaleDateString() : 'Unknown';
  });

  const confirmDeleteAccount = () => {
    showDeleteAccountConfirmation.value = true;
  };

  const deleteAccount = async () => {
    try {
      await authStore.deleteAccount();
      showDeleteAccountConfirmation.value = false;
      router.push('/');
      uiStore.showToastMessage('Account successfully deleted');
    } catch (error) {
      uiStore.showToastMessage('Failed to delete account');
    }
  };

  const openAvatarPicker = () => {
    showAvatarPicker.value = true;
  };

  const openAvatarViewer = () => {
    showAvatarViewer.value = true;
  };

  const updateAvatar = async (newAvatarUrl: string) => {
    try {
      await authStore.updateAvatar(newAvatarUrl);
      showAvatarPicker.value = false;
      uiStore.showToastMessage('Avatar successfully updated');
    } catch (error) {
      uiStore.showToastMessage('Failed to update avatar. Please try again.');
    }
  };

  const removeAvatar = async () => {
    try {
      await authStore.updateAvatar('/icons/avatar.png');
      showAvatarPicker.value = false;
      uiStore.showToastMessage('Avatar removed successfully');
    } catch (error) {
      uiStore.showToastMessage('Failed to remove avatar. Please try again.');
    }
  };

  const openNameEditor = () => {
    showNameEditor.value = true;
  };

  const updateName = async (newName: string) => {
    try {
      await authStore.updateName(newName);
      showNameEditor.value = false;
      uiStore.showToastMessage('Username successfully updated');
    } catch (error) {
      uiStore.showToastMessage('Failed to update username');
    }
  };
</script>
