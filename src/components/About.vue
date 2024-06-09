<template>
  <Navbar />
  <div class="flex justify-center items-center mt-32 md:mt-24 mb-24">
    <div class="flex flex-col items-center w-full max-w-md">

      <div class="bg-cream dark:bg-gray-800 dark:text-white p-8 mb-8 rounded-lg shadow-lg border-black dark:border-white border-2 w-full hover:shadow-2xl">
        <p class="text-sm font-serif">This is a basic note-taking application developed using Vue, Vite, and TypeScript. This website was created as the final project for the <a href="https://cs50.harvard.edu/x/2024/" target="_blank" class="underline text-sm">CS50x</a> course. Please avoid typing sensitive information, as it is stored locally on your browser's cache. The <a class="text-sm underline" href="https://github.com/muhammad-zulfikar/vue-notes" target="_blank">source code</a> is available.</p>
      </div>

      <div class="flex items-center flex-row space-x-8 space-y-0 w-full justify-center">
        <div class="bg-cream dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg border-black dark:border-white border-2 flex-1 max-w-xs hover:shadow-2xl">
          <p class="text-sm font-serif">Features:</p>
          <ul class="list-disc pl-4">
            <li class="text-sm font-serif">Create, edit, search, and delete notes</li>
            <li class="text-sm font-serif">Download notes as .txt</li>
            <li class="text-sm font-serif">Dark theme</li>
          </ul>
        </div>

        <div class="bg-cream dark:bg-gray-800 dark:text-white p-4 rounded-lg shadow-lg border-black dark:border-white border-2 flex-1 max-w-xs hover:shadow-2xl">
          <p class="text-sm font-serif">TODO:</p>
          <ul class="list-disc pl-4">
            <li class="text-sm font-serif line-through">Edit notes</li>
            <li class="text-sm font-serif line-through">Download notes as .txt</li>
            <li class="text-sm font-serif line-through">Dark theme</li>
            <li class="text-sm font-serif">Drag notes</li>
            <li class="text-sm font-serif">Fix toast</li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import Navbar from './Navbar/Navbar.vue';
</script>

<style scoped>
.max-w-xs {
  width: 300px;
  height: 9rem;
}

.max-w-md {
  width: 600px;
}

@media (max-width: 768px) {
  .max-w-xs {
    height: 11rem;
  }
  .max-w-md {
    width: 20rem;
  }
}
</style>
