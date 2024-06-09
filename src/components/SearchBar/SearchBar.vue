<template>
  <div>
    <div class="flex justify-center items-center mt-4 p-4 font-serif">
      <input v-model="searchQuery" @input="updateSearchQuery" placeholder="Search..." :style="{ width: searchBarWidth }" class="bg-transparent border-2 border-black rounded-lg shadow-lg hover:shadow-xl dark:border-white text-black dark:text-white placeholder-black dark:placeholder-white p-2 outline-none" />
    </div>
  </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

const searchQuery = ref('');

const emit = defineEmits('update:modelValue');

const updateSearchQuery = () => {
  emit('update:modelValue', searchQuery.value.toLowerCase());
};

const searchBarWidth = ref('400px');

if (window.innerWidth < 640) {
  searchBarWidth.value = '300px';
}
</script>
