<template>
  <div
    v-if="!isLoading"
    class="flex justify-center items-center font-serif select-none"
  >
    <div
      class="relative flex items-center justify-center w-full mx-auto md:w-[350px]"
      :class="{
        'w-[40px]': !isExpanded && isMobile,
        'w-[180px]': isExpanded && isMobile,
      }"
    >
      <transition name="expand">
        <div
          v-show="isExpanded || !isMobile"
          class="overflow-hidden absolute right-0"
          :class="{ 'w-full': !isMobile, 'w-[180px]': isMobile }"
        >
          <input
            ref="searchInput"
            v-model="searchQuery"
            @input="updateSearchQuery"
            @focus="isFocused = true"
            @blur="isFocused = false"
            placeholder="Search..."
            class="card-transparent text-sm md:text-base px-2.5 md:px-2 py-1 pr-8 outline-none w-full transition-all duration-300"
            :class="{
              'placeholder-transparent': isFocused,
            }"
          />
        </div>
      </transition>
      <div
        @click="toggleExpand"
        class="px-2 py-1.5 cursor-pointer md:hidden z-10"
        :class="{ card: !isExpanded }"
      >
        <PhMagnifyingGlass :size="20" />
      </div>
      <div
        class="hidden md:flex absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none transition-all duration-300"
      >
        <span class="text-sm text-gray-500 dark:text-gray-300">
          <kbd
            class="px-1 py-[2px] mr-[6px] font-serif shadow-md bg-cream text-gray-700 rounded dark:bg-gray-750 dark:text-gray-300"
          >
            Ctrl
          </kbd>
          +
          <kbd
            class="px-1 py-[2px] ml-1 font-serif shadow-md bg-cream text-gray-700 rounded dark:bg-gray-750 dark:text-gray-300"
          >
            K
          </kbd>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue';
  import { PhMagnifyingGlass } from '@phosphor-icons/vue';

  const searchQuery = ref('');
  const searchInput = ref(null);
  const isFocused = ref(false);
  const isLoading = ref(true);
  const isExpanded = ref(false);

  const emit = defineEmits(['update:modelValue', 'expanded']);

  const updateSearchQuery = () => {
    emit('update:modelValue', searchQuery.value.toLowerCase());
  };

  const isMobile = computed(() => window.innerWidth < 768);

  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
    if (isExpanded.value) {
      setTimeout(() => {
        searchInput.value.focus();
      }, 300);
    }
    emit('expanded', isExpanded.value);
  };

  const handleClickOutside = (event) => {
    if (isExpanded.value && !event.target.closest('.relative')) {
      isExpanded.value = false;
      emit('expanded', false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      event.stopPropagation();
      setTimeout(() => {
        searchInput.value.focus();
      }, 300);
    }
  };

  onMounted(() => {
    isLoading.value = false;
    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('click', handleClickOutside, true);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('click', handleClickOutside, true);
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
