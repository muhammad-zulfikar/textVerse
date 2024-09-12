<template>
  <ModalBackdrop v-model="props.isOpen" />
  <transition name="zoom">
    <div
      v-if="props.isOpen"
      class="fixed inset-0 z-40 flex items-center justify-center"
    >
      <div @click="closeModal" class="absolute inset-0"></div>
      <div
        @click.stop
        class="z-50 font-serif card p-5 relative flex flex-col w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3"
      >
        <h1 class="text-xl font-bold mb-4">Select Avatar</h1>
        <div class="flex flex-col items-center mb-4 relative">
          <img
            v-if="avatarUrl"
            :src="avatarUrl"
            class="w-32 h-32 rounded-full card-transparent-avatar mb-4 object-cover"
            alt="Avatar"
          />
          <div
            @dragover.prevent
            @drop.prevent="handleDrop"
            class="card-border-dashed w-full h-32 md:h-52 flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 cursor-pointer"
            @click="triggerFilePicker"
          >
            <p class="text-sm">Drag & drop your image here</p>
            <p class="text-xs">or click to select a file</p>
          </div>
          <input
            type="file"
            @change="handleFileChange"
            class="hidden"
            ref="fileInput"
            accept="image/*"
          />
        </div>
        <div class="flex justify-between mt-6 text-sm">
          <button
            @click.prevent="removeAvatar"
            class="flex items-center px-2 py-1 card text-red-500 hover:text-red-100 hover:bg-red-700/50 dark:hover:bg-red-800/60 mr-4 cursor-pointer"
          >
            <PhTrash :size="20" class="mr-2" />
            Remove Avatar
          </button>
          <div class="flex">
            <button
              @click.prevent="closeModal"
              class="flex items-center px-2 py-1 card hover:bg-[#d9c698] dark:hover:bg-gray-700 mr-4 cursor-pointer"
            >
              <PhProhibit :size="20" class="mr-2" />
              Cancel
            </button>
            <button
              :disabled="!avatarUrl"
              @click.prevent="confirmSelection"
              class="flex items-center px-2 py-1 card hover:bg-[#d9c698] dark:hover:bg-gray-700 cursor-pointer"
            >
              <PhCheckCircle :size="20" class="mr-2" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
  import { uiStore } from '@/utils/stores';
  import { ref } from 'vue';
  import ModalBackdrop from '@/components/ui/modal/backdropModal.vue';
  import { PhTrash, PhProhibit, PhCheckCircle } from '@phosphor-icons/vue';

  const props = defineProps<{
    isOpen: boolean;
    initialAvatarUrl?: string;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'select', avatarUrl: string): void;
    (e: 'remove'): void;
  }>();

  const avatarUrl = ref<string | null>(null);
  const fileInput = ref<HTMLInputElement | null>(null);

  const handleFileChange = (event: Event) => {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        avatarUrl.value = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: DragEvent) => {
    const file = event.dataTransfer?.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        avatarUrl.value = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFilePicker = () => {
    fileInput.value?.click();
  };

  const confirmSelection = () => {
    if (avatarUrl.value) {
      try {
        emit('select', avatarUrl.value);
        closeModal();
      } catch (error) {
        uiStore.showToastMessage('Failed to update avatar');
      }
    }
  };

  const removeAvatar = () => {
    emit('remove');
    uiStore.showToastMessage('Avatar removed');
    closeModal();
  };

  const closeModal = () => {
    avatarUrl.value = null;
    emit('close');
  };
</script>
