<template>
  <div>
    <main
      class="mx-auto grid max-w-2xl grid-cols-6 gap-6 px-2 select-none my-8 md:my-24"
    >
      <div
        class="flex flex-col col-span-6 md:col-span-4 h-58 md:h-60 overflow-hidden rounded-lg p-5 md:p-6 card"
      >
        <a
          href="https://github.com/muhammad-zulfikar/vue-notes"
          target="_blank"
          class="flex w-fit space-x-1.5 text-sm font-serif rounded-lg px-2 py-1 border-[1px] md:border-2 border-black dark:border-white hover:shadow-lg"
        >
          <span class="flex items-center">
            <PhGithubLogo :size="18" class="mr-2" />
            GitHub
          </span>
          <span>&rarr;</span>
        </a>
        <p class="text-sm font-serif mt-4">
          textVerse is a basic note-taking application developed using Vue,
          Vite, and TypeScript. This website was created as the final project
          for the
          <a
            href="https://cs50.harvard.edu/x/2024/"
            target="_blank"
            class="underline"
          >
            CS50x
          </a>
          course. It uses Firebase Realtime Database for signed in users. If
          you're a guest, please avoid typing sensitive information, as it is
          stored locally on your browser's cache. The source code is available
          on GitHub.
        </p>
      </div>
      <div class="col-span-6 md:col-span-2">
        <div class="p-4 justify-center rounded-lg dark:text-white md:h-60 card">
          <p class="text-sm font-serif font-bold">TODO(S):</p>
          <ul class="list-disc pl-4 mt-2 space-y-1">
            <li class="text-sm font-serif line-through">
              Introduce markdown support
            </li>
            <li class="text-sm font-serif">Implement collaborative editing</li>
          </ul>
        </div>
      </div>
      <div class="col-span-6">
        <div class="p-4 justify-center rounded-lg dark:text-white card">
          <p class="text-sm font-serif font-bold">Features:</p>
          <ul class="list-disc pl-4 mt-2 columns-2 gap-6 md:gap-12 space-y-2">
            <li class="text-sm font-serif">
              Create, edit, pin, search, and organize notes
            </li>
            <li class="text-sm font-serif">Light and dark mode</li>
            <li class="text-sm font-serif">
              Right-click context menu for quick actions
            </li>
            <li class="text-sm font-serif">4 different view types</li>
            <li class="text-sm font-serif">
              Real-time note synchronization across devices
            </li>
            <li class="text-sm font-serif">Markdown support</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
  import { PhGithubLogo } from '@phosphor-icons/vue';
  import Navbar from '@/components/navbar/navbar.vue';
</script>
