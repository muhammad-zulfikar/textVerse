<!-- SearchBar.vue -->

<template>
  <div
    class="flex justify-center items-center p-4 mt-2 md:mt-4 font-serif select-none"
  >
    <div class="relative flex items-center w-full px-8 md:px-0 md:w-[400px]">
      <input
        ref="searchInput"
        v-model="searchQuery"
        @input="updateSearchQuery"
        @focus="isFocused = true"
        @blur="isFocused = false"
        placeholder="Search..."
        class="custom-card-transparent text-sm md:text-base p-2.5 md:p-2 pr-24 outline-none w-full"
        :class="{ 'placeholder-transparent': isFocused }"
      />
      <div
        class="hidden md:flex absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none transition-all duration-300"
      >
        <span class="text-sm text-gray-500 dark:text-gray-300">
          <kbd
            class="p-1 px-2 pb-1.5 mr-[6px] font-serif shadow-md bg-cream text-gray-700 rounded dark:bg-gray-700 dark:text-gray-300"
          >
            Ctrl
          </kbd>
          +
          <kbd
            class="p-1 px-2 pb-1.5 ml-1 font-serif shadow-md bg-cream text-gray-700 rounded dark:bg-gray-700 dark:text-gray-300"
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

  const searchQuery = ref('');
  const searchInput = ref(null);
  const isFocused = ref(false);

  const emit = defineEmits(['update:modelValue']);

  const updateSearchQuery = () => {
    emit('update:modelValue', searchQuery.value.toLowerCase());
  };

  const searchBarWidth = computed(() => {
    return window.innerWidth >= 768 ? '400px' : '100%';
  });

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      event.stopPropagation();
      searchInput.value.focus();
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown, true);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown, true);
  });
</script>

<style scoped>
  .placeholder-transparent::placeholder {
    color: transparent;
  }
</style>
