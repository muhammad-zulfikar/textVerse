<template>
  <div
    v-if="!isLoading"
    class="flex justify-center items-center font-serif select-none"
  >
    <div
      ref="searchContainer"
      class="relative flex items-center justify-center w-full mx-auto md:w-[350px]"
      :class="{
        'w-[40px]': !isExpanded && isMobile,
        'w-[180px]': isExpanded && isMobile,
      }"
    >
      <Transition name="expand">
        <div
          v-show="isExpanded || !isMobile"
          class="overflow-hidden absolute right-0"
          :class="{ 'w-full': !isMobile, 'w-[180px]': isMobile }"
        >
          <div class="relative">
            <div
              v-if="!isMobile"
              class="absolute inset-y-0 left-2 flex items-center pointer-events-none"
            >
              <PhMagnifyingGlass :size="20" class="text-gray-400" />
            </div>
            <input
              ref="searchInput"
              v-model="searchQuery"
              @input="updateSearchQuery"
              @focus="isFocused = true"
              @blur="isFocused = false"
              placeholder="Search..."
              class="card-transparent text-sm md:text-base pl-2 md:pl-10 px-2.5 md:px-2 py-1 pr-8 outline-none w-full transition-all duration-300"
              :class="{
                'placeholder-transparent': isFocused,
              }"
            />
          </div>
        </div>
      </Transition>
      <div
        @click="toggleExpand"
        class="px-2 py-1.5 cursor-pointer md:hidden z-10"
        :class="{ card: !isExpanded }"
      >
        <PhMagnifyingGlass :size="20" />
      </div>
      <div
        class="hidden md:flex absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer transition-all duration-300"
      >
        <PhX
          v-if="searchQuery"
          :size="20"
          class="text-gray-500 dark:text-gray-300"
          @click="clearSearch"
        />
        <span
          v-else
          class="text-sm text-gray-500 dark:text-gray-300 cursor-default"
        >
          <kbd
            class="px-[5px] py-[2px] mr-[6px] font-serif shadow-md bg-cream-200 text-gray-700 rounded dark:bg-gray-750 dark:text-gray-300"
          >
            Ctrl
          </kbd>
          +
          <kbd
            class="px-[5px] py-[2px] ml-1 font-serif shadow-md bg-cream-200 text-gray-700 rounded dark:bg-gray-750 dark:text-gray-300"
          >
            K
          </kbd>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { PhMagnifyingGlass, PhX } from '@phosphor-icons/vue';
  import { notesStore } from '@/store';

  const searchQuery = ref('');
  const searchInput = ref<HTMLInputElement | null>(null);
  const searchContainer = ref<HTMLDivElement | null>(null);
  const isFocused = ref(false);
  const isLoading = ref(true);
  const isExpanded = ref(false);

  const emit = defineEmits<{
    (e: 'expanded', value: boolean): void;
  }>();

  const isMobile = computed(() => window.innerWidth < 768);

  const updateSearchQuery = () => {
    if (notesStore && notesStore.setSearchQuery) {
      notesStore.setSearchQuery(searchQuery.value.toLowerCase());
    }
  };

  const clearSearch = () => {
    searchQuery.value = '';
    updateSearchQuery();
  };

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
    if (isExpanded.value) {
      setTimeout(() => {
        searchInput.value?.focus();
      }, 300);
    }
    emit('expanded', isExpanded.value);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      isExpanded.value &&
      searchContainer.value &&
      !searchContainer.value.contains(event.target as Node)
    ) {
      isExpanded.value = false;
      emit('expanded', false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      event.stopPropagation();
      setTimeout(() => {
        searchInput.value?.focus();
      }, 300);
    }
  };

  onMounted(() => {
    isLoading.value = false;
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('click', handleOutsideClick, true);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('click', handleOutsideClick, true);
  });
</script>

<style scoped>
  .placeholder-transparent::placeholder {
    color: transparent;
  }

  .expand-enter-active,
  .expand-leave-active {
    transition: all 0.3s ease-out;
  }

  .expand-enter-from,
  .expand-leave-to {
    width: 0 !important;
    opacity: 0;
  }

  .expand-enter-to,
  .expand-leave-from {
    width: 180px;
    opacity: 1;
  }
</style>
