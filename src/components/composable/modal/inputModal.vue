<template>
  <Modal :modelValue="isOpen" id="input">
    <div
      class="card flex flex-col font-serif p-5 relative w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3"
    >
      <h1 class="text-xl font-bold mb-4">{{ modalTitle }}</h1>
      <input
        v-model="inputValue"
        @focus="handleFocus"
        @blur="handleBlur"
        :placeholder="placeholderText"
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
      <div class="flex justify-end mt-6 space-x-4">
        <Button @click="handleCancel">
          <PhProhibit :size="20" class="mr-2" />
          <span class="text-sm">Cancel</span>
        </Button>
        <Button @click="handleConfirm" variant="confirm" :disabled="!isValid">
          <div v-if="mode !== 'email'" class="flex items-center">
            <PhCheckCircle :size="20" class="mr-2" />
            <span>Save</span>
          </div>
          <div v-else class="flex items-center">
            <PhPaperPlaneTilt :size="20" class="mr-2" />
            <span>Send</span>
          </div>
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { ref, computed, watch, onMounted } from 'vue';
  import {
    PhProhibit,
    PhCheckCircle,
    PhPaperPlaneTilt,
  } from '@phosphor-icons/vue';
  import { uiStore } from '@/store';
  import Modal from '@/components/ui/modal.vue';
  import Button from '@/components/ui/button.vue';

  const isOpen = computed(() => uiStore.activeModal === 'input');
  const mode = computed(() => uiStore.inputModalOptions?.mode || 'folder');
  const currentValue = computed(
    () => uiStore.inputModalOptions?.currentValue || ''
  );
  const maxLength = computed(() => uiStore.inputModalOptions?.maxLength || 100);

  const inputValue = ref(currentValue.value);
  const placeholderText = ref('');

  const modalTitle = computed(() => {
    const titles = {
      username: 'Rename',
      email: 'Forgot Password',
      folder: currentValue.value ? 'Rename Folder' : 'Create New Folder',
      link: 'Enter Link URL',
    };
    return titles[mode.value] || placeholderText.value;
  });

  const showCharCount = computed(() => mode.value === 'folder');

  const isValid = computed(() => {
    const trimmedLength = inputValue.value.trim().length;
    if (mode.value === 'link') {
      return (
        trimmedLength > 0 &&
        trimmedLength <= maxLength.value &&
        inputValue.value.startsWith('http')
      );
    }
    if (mode.value === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(inputValue.value);
    }
    return trimmedLength > 0 && trimmedLength <= maxLength.value;
  });

  const handleConfirm = () => {
    if (isValid.value && uiStore.inputModalOptions?.confirm) {
      uiStore.inputModalOptions.confirm(inputValue.value);
    }
    uiStore.inputModalOptions = null;
    uiStore.setActiveModal(null);
  };

  const handleCancel = () => {
    if (uiStore.inputModalOptions?.cancel) {
      uiStore.inputModalOptions.cancel();
    }
    uiStore.inputModalOptions = null;
    if (uiStore.activeModal === 'signIn') {
      uiStore.setActiveModal('signIn');
    } else {
      uiStore.setActiveModal(null);
    }
  };

  const handleFocus = () => {
    placeholderText.value = '';
  };

  const handleBlur = () => {
    if (inputValue.value.trim() === '') {
      setPlaceholder();
    }
  };

  const setPlaceholder = () => {
    const placeholders = {
      username: 'Enter your username',
      folder: 'Enter folder name',
      link: 'Enter link URL',
      email: 'Enter your email address',
    };
    placeholderText.value = placeholders[mode.value] || '';
  };

  watch(currentValue, (newValue) => {
    inputValue.value = newValue;
  });

  watch(mode, () => {
    setPlaceholder();
  });

  onMounted(() => {
    setPlaceholder();
  });
</script>
