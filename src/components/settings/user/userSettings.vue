<template>
  <div class="p-4 card mb-2">
    <h2 class="text-2xl font-semibold mb-4">User Settings</h2>
    <div class="flex flex-col items-center">
      <div class="relative group w-24 h-24 mb-4 rounded-full cursor-pointer">
        <img
          :src="userAvatar"
          alt="User Avatar"
          class="w-full h-full rounded-full object-cover"
        />
        <img
          v-if="isGoogleUser"
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google logo"
          class="absolute bottom-0 left-0 w-6 h-6 bg-white rounded-full p-1"
        />
        <div
          class="absolute inset-0 bg-black bg-opacity-80 md:bg-opacity-40 rounded-full opacity-60 md:opacity-0 md:group-hover:opacity-90 flex justify-between items-center transition-opacity duration-300"
        >
          <div
            class="w-1/2 h-full flex justify-center items-center text-white cursor-pointer transition-colors duration-300 rounded-l-full hover:bg-black hover:bg-opacity-80"
            @click="openImageViewer"
          >
            <PhEye :size="20" />
          </div>
          <div
            class="w-1/2 h-full flex justify-center items-center text-white cursor-pointer transition-colors duration-300 rounded-r-full hover:bg-black hover:bg-opacity-60"
            @click="openAvatarPicker"
          >
            <PhSwap :size="20" />
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <h3 class="text-xl font-semibold">{{ username }}</h3>
        <PhPencilSimpleLine
          :size="20"
          class="text-gray-700 dark:text-gray-400 cursor-pointer"
          @click="openNameEditor"
        />
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        {{ userEmail }}
      </p>
      <div
        class="flex flex-col gap-4 mt-6 w-full sm:flex-row sm:justify-center sm:gap-4"
      >
        <Button
          v-if="!isGoogleUser"
          @click="openChangePasswordModal"
          class="py-2 px-4 text-sm md:text-base w-full sm:w-auto"
        >
          <PhTextbox :size="20" class="mr-2" />
          Change Password
        </Button>
        <Button
          @click="openDeleteAccountAlert"
          variant="danger"
          class="py-2 px-4 text-sm md:text-base w-full sm:w-auto"
        >
          <PhTrash :size="20" class="mr-2" />
          Delete Account
        </Button>
      </div>
    </div>
  </div>

  <SignInModal id="forgotPasswordModal" :from-user-settings="true" />

  <AlertModal
    id="deleteAccountAlert"
    :message="'Are you sure you want to delete your account? This action cannot be undone.'"
    @cancel="closeDeleteAccountAlert"
    @confirm="deleteAccount"
  />

  <AvatarModal
    id="avatarModal"
    :initial-avatar-url="userAvatar"
    @update="updateAvatar"
    @remove="removeAvatar"
    @cancel="closeAvatarPicker"
  />

  <ImageViewModal id="imageViewModal" :avatar-url="userAvatar" />

  <InputModal
    id="renameUserInput"
    mode="username"
    :current-value="username"
    @update="updateName"
    @cancel="closeRenameUserInput"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import {
    PhPencilSimpleLine,
    PhEye,
    PhSwap,
    PhTextbox,
    PhTrash,
  } from '@phosphor-icons/vue';
  import { authStore, uiStore } from '@/store';
  import Button from '@/components/ui/button.vue';
  import AlertModal from '@/components/composable/modal/alertModal.vue';
  import AvatarModal from '@/components/composable/modal/avatarModal.vue';
  import ImageViewModal from '@/components/composable/modal/imageViewModal.vue';
  import InputModal from '@/components/composable/modal/inputModal.vue';
  import SignInModal from '@/components/composable/modal/signInModal.vue';

  const router = useRouter();

  const userAvatar = computed(() => authStore.avatarUrl);
  const username = computed(() => authStore.user?.displayName || 'User');
  const userEmail = computed(() => authStore.user?.email || '');
  const isGoogleUser = computed(
    () => authStore.user?.providerData[0]?.providerId === 'google.com'
  );

  const openChangePasswordModal = () => {
    uiStore.setActiveModal('forgotPasswordModal');
  };

  const openDeleteAccountAlert = () => {
    uiStore.setActiveModal('deleteAccountAlert');
  };

  const closeDeleteAccountAlert = () => {
    uiStore.setActiveModal(null);
  };

  const deleteAccount = async () => {
    try {
      await authStore.deleteAccount();
      uiStore.setActiveModal(null);
      router.push('/');
      uiStore.showToastMessage('Account successfully deleted');
    } catch (error) {
      uiStore.showToastMessage('Failed to delete account');
    }
  };

  const openAvatarPicker = () => {
    uiStore.setActiveModal('avatarModal');
  };

  const closeAvatarPicker = () => {
    uiStore.setActiveModal('null');
  };

  const openImageViewer = () => {
    uiStore.setActiveModal('imageViewModal');
  };

  const updateAvatar = async (newAvatarUrl: string) => {
    try {
      await authStore.updateAvatar(newAvatarUrl);
      closeAvatarPicker();
      uiStore.showToastMessage('Avatar successfully updated');
    } catch (error) {
      uiStore.showToastMessage('Failed to update avatar. Please try again.');
    }
  };

  const removeAvatar = async () => {
    try {
      await authStore.updateAvatar('/icons/avatar.png');
      closeAvatarPicker();
      uiStore.showToastMessage('Avatar removed successfully');
    } catch (error) {
      uiStore.showToastMessage('Failed to remove avatar. Please try again.');
    }
  };

  const openNameEditor = () => {
    uiStore.setActiveModal('renameUserInput');
  };

  const closeRenameUserInput = () => {
    uiStore.setActiveModal(null);
  };

  const updateName = async (newName: string) => {
    try {
      await authStore.updateName(newName);
      closeRenameUserInput();
      uiStore.showToastMessage('Username successfully updated');
    } catch (error) {
      uiStore.showToastMessage('Failed to update username');
    }
  };
</script>
