<!-- Create.vue -->

<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <button
      @click.stop="toggleDropdown"
      :class="{ 'z-50': dropdownOpen }"
      class="hover:underline dark:hover:bg-transparent outline-none mr-4 flex items-center relative"
    >
      + Create
      <span class="ml-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            v-if="dropdownOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 15l7-7 7 7"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </span>
    </button>
    <div
      v-if="dropdownOpen"
      class="custom-card z-50 origin-top-right absolute mt-2 w-[6.4rem] md:w-30"
    >
      <div class="py-1" role="menu" aria-orientation="vertical">
        <a
          @click.stop="openNoteForm"
          class="block px-4 py-2 text-sm cursor-pointer hover:underline"
          role="menuitem"
        >
          Note
        </a>
        <a
          @click.stop="openFolderForm"
          class="block px-4 py-2 text-sm cursor-pointer hover:underline"
          role="menuitem"
        >
          Folder
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import { useNotesStore } from '@/store/store';

  const store = useNotesStore();
  const dropdownOpen = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);

  const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
    store.setActiveDropdown(dropdownOpen.value ? 'create' : null);
  };

  const openNoteForm = () => {
    store.setEditing(true);
    closeDropdown();
  };

  const openFolderForm = () => {
    emit('openFolderForm');
    closeDropdown();
  };

  const closeDropdown = () => {
    dropdownOpen.value = false;
    if (store.activeDropdown === 'create') {
      store.setActiveDropdown(null);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.value &&
      !dropdownRef.value.contains(event.target as Node)
    ) {
      closeDropdown();
    }
  };

  onMounted(() => document.addEventListener('click', handleClickOutside));
  onUnmounted(() => document.removeEventListener('click', handleClickOutside));

  watch(
    () => store.editing,
    (newValue) => {
      if (newValue) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    }
  );

  const emit = defineEmits(['openFolderForm']);
</script>
