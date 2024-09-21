<template>
  <Modal :modelValue="isOpen" :id="id">
    <div
      class="card flex flex-col font-serif p-5 relative w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3"
    >
      <h1 class="text-xl font-bold mb-4">{{ modalTitle }}</h1>
      <input
        v-model="inputValue"
        @focus="handleFocus"
        @blur="handleBlur"
        :placeholder="placeholder"
        class="w-full p-1 bg-transparent border-0 border-b-[1px] border-black dark:border-white outline-none placeholder-black dark:placeholder-white placeholder-opacity-50"
      />
      <span
        v-if="showCharCount"
        :class="[
          'flex justify-end font-normal text-gray-500 text-sm mt-1',
          { 'text-red-500': inputValue.length > maxLength },
        ]"
      >
        {{ inputValue.length }} / {{ maxLength }}
      </span>
      <div class="flex justify-end mt-6">
        <button
          @click="closeModal"
          class="flex items-center px-2 py-1 card hover:bg-cream-300 dark:hover:bg-gray-700 mr-4 cursor-pointer"
        >
          <PhProhibit :size="20" class="mr-2" />
          <span class="text-sm">Cancel</span>
        </button>
        <button
          @click="handleSubmit"
          :disabled="!isValid"
          :class="[
            'text-sm flex items-center px-2 py-1 card hover:bg-cream-300 dark:hover:bg-gray-700',
            {
              'text-blue-500 hover:text-blue-600 hover:bg-blue-700': isValid,
              'text-gray-400 cursor-default': !isValid,
            },
          ]"
        >
          <PhCheckCircle :size="20" class="size-5 mr-2" />
          <span>Save</span>
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { PhProhibit, PhCheckCircle } from '@phosphor-icons/vue';
  import { uiStore } from '@/store';
  import Modal from '@/components/ui/modal.vue';

  const props = defineProps<{
    id: string;
    mode: 'username' | 'folder' | 'title' | 'link';
    currentValue?: string;
    maxLength?: number;
  }>();

  const emit = defineEmits<{
    (e: 'cancel'): void;
    (e: 'update', value: string): void;
  }>();

  const isOpen = computed(() => uiStore.activeModal === props.id);

  const inputValue = ref(props.currentValue || '');
  const placeholder = ref('Enter value');

  const modalTitle = computed(() => {
    switch (props.mode) {
      case 'username':
        return 'Rename';
      case 'folder':
        return props.currentValue ? 'Rename Folder' : 'Create New Folder';
      case 'title':
        return props.currentValue ? 'Edit Title' : 'Enter Title';
      case 'link':
        return 'Enter Link URL';
      default:
        return placeholder;
    }
  });

  const showCharCount = computed(() => props.mode === 'folder');
  const maxLength = computed(() => props.maxLength || 500);

  const isValid = computed(() => {
    const trimmedLength = inputValue.value.trim().length;
    if (props.mode === 'link') {
      return (
        trimmedLength > 0 &&
        trimmedLength <= maxLength.value &&
        inputValue.value.startsWith('http')
      );
    }
    return trimmedLength > 0 && trimmedLength <= maxLength.value;
  });

  const handleSubmit = () => {
    if (isValid.value) {
      emit('update', inputValue.value);
      closeModal();
    }
  };

  const closeModal = () => {
    emit('cancel');
  };

  const handleFocus = () => {
    placeholder.value = '';
  };

  const handleBlur = () => {
    if (inputValue.value.trim() === '') {
      placeholder.value =
        props.mode === 'username'
          ? 'Enter your username'
          : props.mode === 'folder'
            ? 'Enter folder name'
            : props.mode === 'title'
              ? 'Enter title'
              : 'Enter Link URL';
    }
  };

  watch(
    () => props.currentValue,
    (newValue) => {
      inputValue.value = newValue || '';
    }
  );
</script>
