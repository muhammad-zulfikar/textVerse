<template>
  <div>
    <div
      class="flex justify-between items-center p-4 bg-transparent shadow-lg hover:shadow-xl transition-all duration-300 font-serif text-sm md:text-base select-none"
    >
      <div class="flex items-center">
        <button @click="toggleNav">Menu</button>
        <span v-if="isNavOpen" class="ml-2 cursor-default">|</span>
        <div v-if="isNavOpen" class="flex items-center ml-2">
          <router-link
            to="/"
            class="mr-2 hover:underline"
            active-class="underline"
          >
            Home
          </router-link>
          <span v-if="isNavOpen" class="cursor-default">|</span>
          <router-link
            to="/about"
            class="mx-2 hover:underline"
            active-class="underline"
          >
            About
          </router-link>
          <span v-if="isNavOpen" class="cursor-default">|</span>
          <a
            href="https://github.com/muhammad-zulfikar/vue-notes"
            target="_blank"
            class="mx-2 hover:underline"
          >
            Source
          </a>
        </div>
      </div>
      <div class="nav-links">
        <button v-if="deferredPrompt" @click="showInstallPrompt">
          Install
        </button>
      </div>
      <button @click="toggleDarkMode">
        {{ darkModeText }}
      </button>
    </div>
    <div class="bg-black dark:bg-white h-px transition-all duration-300"></div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue';
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
    darkModeText.value = darkModeEnabled.value ? 'Light' : 'Dark';
  };

  const deferredPrompt = ref(null);

  const showInstallPrompt = () => {
    if (deferredPrompt.value) {
      deferredPrompt.value.prompt();
      deferredPrompt.value.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
        } else {
          console.log('User dismissed the A2HS prompt');
        }
        deferredPrompt.value = null;
      });
    }
  };

  onMounted(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt.value = e;
    });
  });

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
