<template>
  <div>
    <div class="flex justify-center items-center w-full mt-4 p-4 bg-yellow-100 dark:bg-gray-900">
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
</script>