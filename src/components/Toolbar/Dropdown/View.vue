<!-- View.vue -->

<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <button
      @click.stop="toggleDropdown"
      :class="{ 'z-50': dropdownOpen }"
      class="hover:underline dark:hover:bg-transparent outline-none flex items-center relative"
    >
      View
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
      class="custom-card z-50 origin-top-left absolute left-0 mt-2 w-[6.4rem] md:w-30"
    >
      <div class="py-1" role="menu" aria-orientation="vertical">
        <a
          @click.stop="setColumns(1)"
          class="block px-4 py-2 text-sm cursor-pointer hover:underline"
          role="menuitem"
        >
          1 Column
        </a>
        <a
          @click.stop="setColumns(2)"
          class="block px-4 py-2 text-sm cursor-pointer hover:underline"
          role="menuitem"
        >
          2 Columns
        </a>
        <template v-if="!isMobile">
          <a
            @click.stop="setColumns(3)"
            class="block px-4 py-2 text-sm cursor-pointer hover:underline"
            role="menuitem"
          >
            3 Columns
          </a>
          <a
            @click.stop="setColumns(4)"
            class="block px-4 py-2 text-sm cursor-pointer hover:underline"
            role="menuitem"
          >
            4 Columns
          </a>
          <a
            @click.stop="setColumns(5)"
            class="block px-4 py-2 text-sm cursor-pointer hover:underline"
            role="menuitem"
          >
            5 Columns
          </a>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { useNotesStore } from '@/store/store';

  const store = useNotesStore();
  const dropdownOpen = ref(false);
  const dropdownRef = ref<HTMLElement | null>(null);
  const isMobile = ref(window.innerWidth < 640);

  const toggleDropdown = () => {
    dropdownOpen.value = !dropdownOpen.value;
    store.setActiveDropdown(dropdownOpen.value ? 'view' : null);
  };

  const closeDropdown = () => {
    dropdownOpen.value = false;
    if (store.activeDropdown === 'view') {
      store.setActiveDropdown(null);
    }
  };

  const setColumns = (columns: number) => {
    store.setColumns(columns);
    closeDropdown();
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.value &&
      !dropdownRef.value.contains(event.target as Node)
    ) {
      closeDropdown();
    }
  };

  const handleResize = () => {
    const newIsMobile = window.innerWidth < 640;
    if (newIsMobile !== isMobile.value) {
      isMobile.value = newIsMobile;
      if (isMobile.value && store.columns > 2) {
        store.setColumns(2);
      } else if (!isMobile.value && store.columns < 3) {
        store.setColumns(4);
      }
    }
  };

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    window.addEventListener('resize', handleResize);
    handleResize();
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
    window.removeEventListener('resize', handleResize);
  });
</script>
