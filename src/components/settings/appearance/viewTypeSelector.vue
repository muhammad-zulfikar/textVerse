<template>
  <div class="flex items-center justify-between relative md:mb-2">
    <div class="mr-6">
      <label for="viewType" class="text-lg font-semibold mb-1">View Type</label>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Choose how your notes are displayed.
      </p>
    </div>
    <Dropdown
      label="ViewType"
      dropdownId="viewtype"
      contentWidth="8.8rem"
      content-margin-left="-0.75rem"
      showArrow="false"
      direction="down"
    >
      <template #label>
        <button
          @click="toggleDropdown"
          :class="[
            'card flex items-center relative mt-2 md:mt-0 text-sm md:text-base px-4 py-2',
          ]"
        >
          <component :is="currentViewIcon" :size="20" class="mr-2" />
          {{ viewTypeText }}
          <div
            class="p-1 ml-2 rounded-full hover:bg-cream-300 dark:hover:bg-gray-600 transition-transform duration-200"
            :class="{ 'rotate-180 bg-cream-300 dark:bg-gray-600': isOpen }"
          >
            <PhCaretDown class="size-4" />
          </div>
        </button>
      </template>
      <div class="px-1 text-sm">
        <div
          class="w-full rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200"
          :class="{
            'bg-cream-200 dark:bg-gray-700': expandedOption === 'card',
          }"
        >
          <div class="flex items-center justify-between">
            <button
              @click="setViewType('card')"
              class="flex-grow text-left flex items-center p-2"
            >
              <PhSquaresFour :size="20" class="mr-2" />
              Card
            </button>
            <button
              @click.stop="toggleOptions('card')"
              class="mr-2 p-1 rounded-full hover:bg-cream-300 dark:hover:bg-gray-600 transition-transform duration-200"
              :class="{ 'rotate-180': expandedOption === 'card' }"
            >
              <PhCaretDown :size="16" />
            </button>
          </div>
          <Transition name="expand">
            <div
              v-if="expandedOption === 'card'"
              class="flex items-center justify-between w-full px-2"
            >
              <button
                @click.stop="decreaseColumns"
                :class="{
                  'text-gray-400 cursor-default': uiStore.columns <= 1,
                  'hover:bg-cream-300 dark:hover:bg-gray-600':
                    uiStore.columns > 1,
                }"
                class="text-center text-sm p-2 mb-1 rounded-md transition-colors duration-200"
                :disabled="uiStore.columns <= 1"
              >
                <PhMinusCircle :size="16" />
              </button>
              <span
                class="text-sm text-center mb-1 text-gray-750 dark:text-gray-300"
              >
                {{ uiStore.columns }}
              </span>
              <button
                @click.stop="increaseColumns"
                :class="{
                  'text-gray-400 cursor-default':
                    uiStore.columns >= (isMobile ? 2 : 4),
                  'hover:bg-cream-300 dark:hover:bg-gray-600':
                    uiStore.columns < (isMobile ? 2 : 4),
                }"
                class="text-center text-sm p-2 mb-1 rounded-md transition-colors duration-200"
                :disabled="uiStore.columns >= (isMobile ? 2 : 4)"
              >
                <PhPlusCircle :size="16" />
              </button>
            </div>
          </Transition>
        </div>
        <button
          @click="setViewType('table')"
          class="w-full text-left p-2 rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PhTable :size="20" class="mr-2" />
          Table
        </button>
        <button
          @click="setViewType('mail')"
          class="w-full text-left p-2 rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PhEnvelopeSimple :size="20" class="mr-2" />
          Mail
        </button>
        <div
          class="w-full rounded-md hover:bg-cream-200 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <div class="flex items-center justify-between">
            <button
              @click="setViewType('folder')"
              class="flex-grow text-left flex items-center p-2"
            >
              <PhFolder :size="20" class="mr-2" />
              Folder
            </button>
          </div>
        </div>
      </div>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onBeforeUnmount } from 'vue';
  import {
    PhSquaresFour,
    PhTable,
    PhEnvelopeSimple,
    PhFolder,
    PhCaretDown,
    PhMinusCircle,
    PhPlusCircle,
  } from '@phosphor-icons/vue';
  import { uiStore } from '@/store';
  import Dropdown from '@/components/ui/dropdown.vue';

  const isOpen = ref(false);
  const isMobile = ref(window.innerWidth < 640);

  const viewTypeText = computed(
    () => uiStore.viewType.charAt(0).toUpperCase() + uiStore.viewType.slice(1)
  );

  const currentViewIcon = computed(() => {
    switch (uiStore.viewType) {
      case 'card':
        return PhSquaresFour;
      case 'table':
        return PhTable;
      case 'mail':
        return PhEnvelopeSimple;
      case 'folder':
        return PhFolder;
      default:
        return PhSquaresFour;
    }
  });

  const toggleDropdown = () => {
    isOpen.value = !isOpen.value;
  };

  const expandedOption = ref('');

  const toggleOptions = (option: string) => {
    expandedOption.value = expandedOption.value === option ? '' : option;
  };

  const setViewType = (viewType: 'card' | 'table' | 'mail' | 'folder') => {
    uiStore.setViewType(viewType);
    if (viewType !== 'card') {
      uiStore.setColumns(isMobile.value ? 1 : 4);
    }
    uiStore.showToastMessage('View type updated');
    isOpen.value = false;
    expandedOption.value = '';
  };

  const increaseColumns = () => {
    if (uiStore.columns < (isMobile.value ? 2 : 4)) {
      uiStore.setColumns(uiStore.columns + 1);
    }
    uiStore.setViewType('card');
  };

  const decreaseColumns = () => {
    if (uiStore.columns > 1) {
      uiStore.setColumns(uiStore.columns - 1);
    }
    uiStore.setViewType('card');
  };

  const handleOutsideClick = (event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest('[dropdown-id="viewtype"]')) {
      isOpen.value = false;
      expandedOption.value = '';
    }
  };

  const handleResize = () => {
    const newIsMobile = window.innerWidth < 640;
    if (newIsMobile !== isMobile.value) {
      isMobile.value = newIsMobile;
      if (isMobile.value && uiStore.columns > 2) {
        uiStore.setColumns(2);
      } else if (!isMobile.value && uiStore.columns < 3) {
        uiStore.setColumns(4);
      }
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleOutsideClick);
    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleOutsideClick);
    window.removeEventListener('resize', handleResize);
  });
</script>
