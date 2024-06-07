<template>
  <div class="flex justify-center items-center mt-32 md:mt-24 mb-24">
    <div class="flex flex-col items-center w-full max-w-md">
      <!-- Description Box -->
      <div :style="{ backgroundColor: randomColor1, color: textColor1 }" class="text-white p-8 mb-8 rounded-lg shadow-lg border-black border-2 w-full hover:shadow-2xl">
        <p class="text-sm font-serif">This is a basic note-taking application developed using Vue, Vite, and TypeScript. This website was created as the final project for the <a href="https://cs50.harvard.edu/x/2024/" target="_blank" class="underline text-sm">CS50x</a> course. Please avoid typing sensitive information, as it is stored locally on your browser's cache. The <a class="text-sm underline" href="https://github.com/muhammad-zulfikar/vue-notes" target="_blank">source code</a> is available.</p>
      </div>
      <!-- Feature and TODO Boxes -->
      <div class="flex items-center flex-row space-x-8 space-y-8 space-y-0 w-full justify-center">
        <div :style="{ backgroundColor: randomColor2, color: textColor2 }" class="text-white p-4 rounded-lg shadow-lg border-black border-2 flex-1 max-w-xs hover:shadow-2xl">
          <p class="text-sm font-serif">Features:</p>
          <ul class="list-disc pl-4">
            <li class="text-sm font-serif">Create and delete notes</li>
            <li class="text-sm font-serif">Search notes</li>
            <li class="text-sm font-serif">Edit notes</li>
            <li class="text-sm font-serif">Download notes as .txt</li>
          </ul>
        </div>
        <div :style="{ backgroundColor: randomColor3, color: textColor3 }" class="text-white p-4 rounded-lg shadow-lg border-black border-2 flex-1 max-w-xs hover:shadow-2xl">
          <p class="text-sm font-serif">TODO:</p>
          <ul class="list-disc pl-4">
            <li class="text-sm font-serif line-through">Edit notes</li>
            <li class="text-sm font-serif line-through">Download notes as .txt</li>
            <li class="text-sm font-serif">Dark theme</li>
            <li class="text-sm font-serif">Draggable notes</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const colorOptions = ['#FFFFFF', '#FFC0CB', '#FFD700', '#90EE90', '#ADD8E6', '#FFA07A', '#20B2AA', '#87CEFA'];

const randomColor1 = ref('');
const textColor1 = ref('');
const randomColor2 = ref('');
const textColor2 = ref('');
const randomColor3 = ref('');
const textColor3 = ref('');

const getRandomColorFromOptions = () => {
  const randomIndex = Math.floor(Math.random() * colorOptions.length);
  return colorOptions[randomIndex];
}

const determineTextColor = (bgColor) => {
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 125 ? 'black' : 'white';
}

randomColor1.value = getRandomColorFromOptions();
textColor1.value = determineTextColor(randomColor1.value);

randomColor2.value = getRandomColorFromOptions();
textColor2.value = determineTextColor(randomColor2.value);

randomColor3.value = getRandomColorFromOptions();
textColor3.value = determineTextColor(randomColor3.value);
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
