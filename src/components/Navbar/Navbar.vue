<template>
  <div>
    <div class="flex justify-between items-center p-4 bg-transparent shadow-lg hover:shadow-xl rounded-lg font-serif">
      <div class="flex items-center">
        <button @click="toggleNav" class="dark:text-gray-200 dark:hover:text-white">
          Menu
        </button>
        <span v-if="isNavOpen" class="ml-2 dark:text-gray-200">|</span>
        <div v-if="isNavOpen" class="flex items-center ml-2">
          <router-link to="/" class="dark:text-gray-200 dark:hover:text-white mr-2 hover:underline" active-class="underline">Home</router-link>
          <span v-if="isNavOpen" class="dark:text-gray-200">|</span>
          <router-link to="/about" class="dark:text-gray-200 dark:hover:text-white ml-2 mr-2 hover:underline" active-class="underline">About</router-link>
          <span v-if="isNavOpen" class="dark:text-gray-200">|</span>
          <a href="https://github.com/muhammad-zulfikar/vue-notes" target="_blank" class="dark:text-gray-200 dark:hover:text-white ml-2 mr-2 hover:underline">
            Source
          </a>
        </div>
      </div>
      <div class="nav-links hidden md:block">
        <router-link to="/" class="dark:text-gray-200 dark:hover:text-white mr-4 hover:underline" active-class="underline">Home</router-link>
        <span class="dark:text-gray-200">|</span>
        <router-link to="/about" class="dark:text-gray-200 dark:hover:text-white ml-4 mr-4 hover:underline" active-class="underline">About</router-link>
      </div>
      <button @click="toggleDarkMode" class="dark:text-gray-200 dark:hover:text-white">
        {{ darkModeText }}
      </button>
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
  .h-px {
    height: 1px;
  }
  .underline {
    text-decoration: underline;
  }
  .nav-links {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
  }
</style>
