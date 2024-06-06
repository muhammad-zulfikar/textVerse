<template>
    <div class="flex justify-center items-center mt-32 ml-4 mr-4">
      <div :style="{ backgroundColor: randomColor, color: textColor }" class="text-white p-8 rounded-lg shadow-lg border-black border-4 max-w-md">
        <p class="text-lg">This is a basic note-taking application developed using Vue, Vite, and TypeScript. This website was created as the final project for the <a href="https://cs50.harvard.edu/x/2024/" target="_blank" class="underline">CS50x</a> course. Please avoid typing sensitive information, as it is stored locally on your browser's cache. The <a class="text-lg underline" href="https://github.com/muhammad-zulfikar/vue-notes" target="_blank">source code</a> is available.</p>
        <p class="text-lg mt-4">TODO:</p>
        <ul class="list-disc pl-6">
          <li class="text-lg">Edit function</li>
          <li class="text-lg">Dark theme</li>
          <li class="text-lg">Download as .txt</li>
        </ul>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const randomColor = ref('');
  const textColor = ref('');
  
  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  
  const determineTextColor = (bgColor) => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  
    return brightness > 125 ? 'black' : 'white';
  }
  
  randomColor.value = getRandomColor();
  textColor.value = determineTextColor(randomColor.value);
  </script>  