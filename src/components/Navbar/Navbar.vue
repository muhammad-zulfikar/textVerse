<template>
  <div>
    <div class="flex justify-center items-center p-4 bg-transparent">
      <div class="flex items-center">
        <router-link to="/" class="dark:text-gray-200 dark:hover:text-white mr-4">Home</router-link>
        <span class="dark:text-gray-200">|</span>
        <router-link to="/about" class="dark:text-gray-200 dark:hover:text-white ml-4 mr-4">About</router-link>
        <span class="dark:text-gray-200">|</span>
        <button @click="toggleDarkMode" class="dark:text-gray-200 dark:hover:text-white ml-4">
          {{ darkModeText }}
        </button>
      </div>
    </div>
    <div class="bg-black dark:bg-white h-px"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const isNavOpen = ref(false);
const router = useRouter();

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value;
};

const darkModeEnabled = ref(false);
const darkModeText = ref('Dark');

const toggleDarkMode = () => {
  darkModeEnabled.value = !darkModeEnabled.value;
  document.documentElement.classList.toggle('dark', darkModeEnabled.value);
  darkModeText.value = darkModeEnabled.value ? 'Dark' : 'Light';
};

const navigate = (path) => {
  router.push(path);
};
</script>

<style>
  /* Add custom styles here */
  .h-px {
    height: 1px; /* Set the height of the separator line */
  }
</style>