<template>
  <Modal :modelValue="isOpen" :id="id">
    <div
      class="font-serif card p-5 relative flex flex-col w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3"
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
          class="w-full h-32 md:h-52 flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 cursor-pointer bg-cream-100 dark:bg-gray-750 border-[1px] border-dashed border-black dark:border-gray-400 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
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
          @click="removeAvatar"
          class="flex items-center px-2 py-1 card text-red-500 hover:text-red-100 hover:bg-red-700/50 dark:hover:bg-red-800/60 mr-4 cursor-pointer"
        >
          <PhTrash :size="20" class="mr-2" />
          Remove Avatar
        </button>
        <div class="flex">
          <button
            @click="closeModal"
            class="flex items-center px-2 py-1 card hover:bg-cream-300 dark:hover:bg-gray-700 mr-4 cursor-pointer"
          >
            <PhProhibit :size="20" class="mr-2" />
            Cancel
          </button>
          <button
            :disabled="!avatarUrl"
            @click="confirmSelection"
            class="flex items-center px-2 py-1 card hover:bg-cream-300 dark:hover:bg-gray-700 cursor-pointer"
          >
            <PhCheckCircle :size="20" class="mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { uiStore } from '@/store';
  import { ref, computed } from 'vue';
  import { PhTrash, PhProhibit, PhCheckCircle } from '@phosphor-icons/vue';
  import Modal from '@/components/ui/modal.vue';

  const props = defineProps<{
    id: string;
    initialAvatarUrl?: string;
  }>();

  const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'update', avatarUrl: string): void;
    (e: 'remove'): void;
  }>();

  const isOpen = computed(() => uiStore.activeModal === props.id);

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
        emit('update', avatarUrl.value);
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
    emit('cancel');
  };
</script>
