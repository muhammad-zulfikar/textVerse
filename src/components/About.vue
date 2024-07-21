<!-- Home.vue -->

<template>
  <Navbar />
  <main class="mx-auto grid max-w-2xl grid-cols-6 gap-6 px-6 pt-24 select-none">
    <div
      class="flex flex-col col-span-6 md:col-span-4 h-52 overflow-hidden rounded-lg p-5 md:p-6 custom-card"
    >
      <a
        href="https://github.com/muhammad-zulfikar/vue-notes"
        target="_blank"
        class="flex w-fit space-x-1.5 text-sm font-serif rounded-lg px-2 py-1 border-[1px] md:border-2 border-black dark:border-white hover:shadow-lg"
      >
        <span>GitHub</span>
        <span>&rarr;</span>
      </a>
      <p class="text-sm font-serif mt-4">
        This is a basic note-taking application developed using Vue, Vite, and
        TypeScript. This website was created as the final project for the
        <a
          href="https://cs50.harvard.edu/x/2024/"
          target="_blank"
          class="underline"
        >
          CS50x
        </a>
        course. Please avoid typing sensitive information, as it is stored
        locally on your browser's cache. The source code is available on GitHub.
      </p>
    </div>
    <div class="hidden md:grid md:col-span-2">
      <div
        class="p-4 justify-center rounded-lg dark:text-white md:h-52 custom-card"
      >
        <p class="text-sm font-serif">TODO:</p>
        <ul class="list-disc pl-4 mt-2">
          <li class="text-sm font-serif">Fix unpin sort</li>
        </ul>
      </div>
    </div>
    <div class="col-span-6">
      <div class="p-4 justify-center rounded-lg dark:text-white custom-card">
        <p class="text-sm font-serif">Features:</p>
        <ul class="list-disc pl-4 mt-2">
          <li class="text-sm font-serif">
            Create, edit, pin, search, and delete notes
          </li>
          <li class="text-sm font-serif">Download notes as .txt</li>
          <li class="text-sm font-serif">Dark theme</li>
          <li class="text-sm font-serif">Folder support</li>
          <li class="text-sm font-serif">Context menu</li>
        </ul>
      </div>
    </div>
  </main>
</template>

<script setup>
  import Navbar from './Navbar/Navbar.vue';
</script>

<style scoped>
  .custom-card {
    border: 1px solid black;
  }

  .dark .custom-card {
    border-color: white;
  }
</style>
