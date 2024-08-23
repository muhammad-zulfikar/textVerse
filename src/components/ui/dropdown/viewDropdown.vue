<template>
  <Dropdown
    dropdownId="view"
    contentWidth="8.8rem"
    direction="down"
    position="right"
  >
    <template #label>
      <Button>
        <div v-if="uiStore.viewType === 'card'">
          <PhSquaresFour :size="20" />
        </div>
        <div v-if="uiStore.viewType === 'table'">
          <PhTable :size="20" />
        </div>
        <div v-if="uiStore.viewType === 'mail'">
          <PhEnvelopeSimple :size="20" />
        </div>
        <div v-if="uiStore.viewType === 'folder'">
          <PhFolder :size="20" />
        </div>

        <!-- <span class="hidden md:flex md:ml-2" v-if="uiStore.viewType === 'card'">Card</span>
        <span class="hidden md:flex md:ml-2" v-else-if="uiStore.viewType === 'table'">Table</span>
        <span class="hidden md:flex md:ml-2" v-else-if="uiStore.viewType === 'mail'">Mail</span>
        <span class="hidden md:flex md:ml-2" v-else-if="uiStore.viewType === 'folder'">Folder</span> -->
      </Button>
    </template>
    <div class="px-1 space-y-1 text-sm">
      <div
        class="w-full rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200"
        :class="{
          'bg-[#ebdfc0] dark:bg-gray-700':
            expandedOption === 'card' || uiStore.viewType === 'card',
        }"
      >
        <div class="flex items-center justify-between">
          <button
            @click="setViewType('card')"
            class="flex-grow text-left flex items-center p-2 cursor-pointer"
          >
            <PhSquaresFour :size="20" class="mr-2" />
            Card
          </button>
          <button
            @click.stop="toggleOptions('card')"
            class="mr-2 p-1 rounded-full hover:bg-[#d9c698] dark:hover:bg-gray-600 transition-transform duration-200"
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
                'hover:bg-[#d9c698] dark:hover:bg-gray-600':
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
                'hover:bg-[#d9c698] dark:hover:bg-gray-600':
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
        class="w-full text-left p-2 rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        :class="{
          'bg-[#ebdfc0] dark:bg-gray-700': uiStore.viewType === 'table',
        }"
      >
        <PhTable :size="20" class="mr-2" />
        Table
      </button>
      <button
        @click="setViewType('mail')"
        class="w-full text-left p-2 rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        :class="{
          'bg-[#ebdfc0] dark:bg-gray-700': uiStore.viewType === 'mail',
        }"
      >
        <PhEnvelopeSimple :size="20" class="mr-2" />
        Mail
      </button>
      <div
        class="w-full rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200"
        :class="{
          'bg-[#ebdfc0] dark:bg-gray-700':
            expandedOption === 'folder' || uiStore.viewType === 'folder',
        }"
      >
        <div class="flex items-center justify-between">
          <button
            @click="setViewType('folder')"
            class="flex-grow text-left flex items-center p-2"
          >
            <PhFolder :size="20" class="mr-2" />
            Folder
          </button>
          <button
            @click.stop="toggleOptions('folder')"
            class="mr-2 p-1 rounded-full hover:bg-[#d9c698] dark:hover:bg-gray-600 transition-transform duration-200"
            :class="{ 'rotate-180': expandedOption === 'folder' }"
          >
            <PhCaretDown :size="16" />
          </button>
        </div>
        <Transition name="expand">
          <div v-if="expandedOption === 'folder'">
            <button
              @click.stop="setFolderViewType('grid')"
              class="w-full flex items-center text-center text-sm p-2 rounded-md text-gray-750 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-[#d9c698] dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <PhGridFour :size="20" class="mr-2" />
              <span>Grid</span>
            </button>
            <button
              @click.stop="setFolderViewType('list')"
              class="w-full flex items-center text-center text-sm p-2 rounded-md text-gray-750 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-[#d9c698] dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <PhList :size="20" class="mr-2" />
              <span>List</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </Dropdown>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { uiStore } from '@/store/stores';
  import {
    PhSquaresFour,
    PhTable,
    PhEnvelopeSimple,
    PhFolder,
    PhCaretDown,
    PhMinusCircle,
    PhPlusCircle,
    PhGridFour,
    PhList,
  } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import Button from '@/components/ui/button.vue';

  const isOpen = ref(false);
  const isMobile = ref(window.innerWidth < 640);
  const expandedOption = ref('');

  const closeModal = () => {
    isOpen.value = false;
    expandedOption.value = '';
  };

  const toggleOptions = (option: string) => {
    expandedOption.value = expandedOption.value === option ? '' : option;
  };

  const setViewType = (viewType: 'card' | 'table' | 'mail' | 'folder') => {
    uiStore.setViewType(viewType);
    if (viewType !== 'card') {
      uiStore.setColumns(isMobile.value ? 1 : 4);
    }
    closeModal();
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

  const setFolderViewType = (viewType: 'grid' | 'list') => {
    uiStore.setFolderViewType(viewType);
    uiStore.setViewType('folder');
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
    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
</script>
