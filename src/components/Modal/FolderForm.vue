<!-- FolderForm.vue -->

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-40 flex items-center justify-center"
  >
    <div
      @click="closeModal"
      class="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-[2px]"
    ></div>
    <form
      @submit.prevent="handleSubmit"
      @click.stop
      class="z-50 font-serif custom-card p-5 relative flex flex-col w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3"
    >
      <h1 class="text-xl font-bold mb-4 relative mt-2">
        {{ modalTitle }}
      </h1>
      <input
        v-model="folderName"
        @focus="handleFocus"
        @blur="handleBlur"
        :placeholder="placeholder"
        class="w-full p-1 bg-transparent border-0 border-b-2 border-black dark:border-white outline-none placeholder-black dark:placeholder-white placeholder-opacity-50"
      />
      <span
        :class="[
          'flex justify-end font-normal text-gray-500 text-sm mt-1',
          { 'text-red-500': folderName.length > 30 },
        ]"
      >
        {{ folderName.length }} / 10
      </span>
      <div class="flex justify-end mt-6">
        <button
          @click.prevent="closeModal"
          class="hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none mr-6 cursor-pointer"
        >
          <span class="text-sm">Cancel</span>
        </button>
        <button
          :disabled="!isValid"
          type="submit"
          :class="[
            'dark:hover:bg-transparent outline-none text-sm',
            {
              'hover:underline cursor-pointer': isValid,
              'text-gray-500': !isValid,
            },
          ]"
        >
          <span class="text-sm">Save</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watchEffect, watch } from 'vue';

  const props = defineProps<{
    isOpen: boolean;
    mode: 'create' | 'rename';
    currentName?: string;
  }>();

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'submit', folderName: string): void;
  }>();

  const folderName = ref(props.currentName || '');
  const placeholder = ref('Enter folder name');

  const modalTitle = computed(() =>
    props.mode === 'create' ? 'Create New Folder' : 'Rename Folder'
  );

  const isValid = computed(
    () => folderName.value.trim().length > 0 && folderName.value.length <= 10
  );

  watchEffect(() => {
    if (props.mode === 'rename' && props.currentName) {
      folderName.value = props.currentName;
    }
  });

  const handleSubmit = () => {
    if (isValid.value) {
      emit('submit', folderName.value);
      closeModal();
    }
  };

  const closeModal = () => {
    folderName.value = '';
    emit('close');
  };

  const handleFocus = () => {
    placeholder.value = '';
  };

  const handleBlur = () => {
    if (folderName.value.trim() === '') {
      placeholder.value = 'Enter folder name';
    }
  };

  watch(
    () => props.isOpen,
    (newValue) => {
      if (newValue) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    }
  );
</script>
