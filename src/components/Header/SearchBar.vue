<template>
  <div class="search-bar-wrapper">
    <div class="search-bar-container flex justify-center items-center w-full mt-4 p-4 bg-yellow-100 dark:bg-gray-900">
      <div class="flex items-center mr-4">
        <input v-model="searchQuery" @input="updateSearchQuery" placeholder="Search..." class="bg-white p-2 rounded-lg border-2 border-black dark:border-white shadow-md 
          hover:shadow-xl outline-none w-full md:w-auto md:flex-grow-0" />
      </div>
      <button @click="startEditing" class="bg-yellow-500 dark:bg-yellow-600 text-black dark:text-white 
        dark:hover:text-black p-2 border-2 border-black dark:border-white 
        hover:shadow-xl rounded-lg shadow-md hover:bg-yellow-600 
        dark:hover:bg-yellow-500 hover:text-white outline-none">
        <span class="text-sm">Add New</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted, onUnmounted } from 'vue';

const searchQuery = ref('');
const emit = defineEmits(['update:modelValue', 'startEditing']);

const updateSearchQuery = () => {
  emit('update:modelValue', searchQuery.value);
};

const startEditing = () => {
  emit('startEditing');
};

const handleScroll = () => {
  const searchBarContainer = document.querySelector('.search-bar-container');
  const searchBarWrapper = document.querySelector('.search-bar-wrapper');
  if (window.scrollY > 50) {
    searchBarContainer.classList.add('sticky');
    searchBarWrapper.classList.add('with-placeholder');
  } else {
    searchBarContainer.classList.remove('sticky');
    searchBarWrapper.classList.remove('with-placeholder');
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.search-bar-wrapper.with-placeholder {
  height: 88px;
}

.search-bar-container.sticky {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  margin-top: 0;
  padding-top: 16px;
  padding-bottom: 16px;
}
</style>