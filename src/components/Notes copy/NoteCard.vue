<template>
  <li :style="{ backgroundColor: props.note.color }"
    class="note-card break-inside-avoid h-min border-2 border-black dark:border-white mb-6 md:mb-8 hover:shadow-2xl rounded-lg p-2 flex flex-col overflow-x-auto relative">
    <div class="flex justify-between items-start">
      <h1 class="font-bold text-sl font-mono mt-1 cursor-pointer" @click="handleOpenNote">{{ props.note.title }}
      </h1>
      <div class="relative flex items-center">
        <button class="flex-shrink-0 w-4 h-4 mt-1" @click="onRemove">
          <img src="@/assets/option.svg" class="w-full h-full" alt="Menu" />
        </button>
      </div>
    </div>
    <p v-html="linkifiedContent" class="font-serif text-sm mt-2"></p>
    <div class="flex pt-3 mt-auto">
      <p class="text-gray-500 text-xs mt-auto ml-auto">{{ props.note.timeCreated }}</p>
    </div>
  </li>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { Note } from '@/stores/ProductStore';

const props = defineProps({
  note: {
    type: Object as () => Note,
    required: true
  },
  index: Number,
  removeNote: Function,
  openNote: Function
});

const handleOpenNote = () => {
  if (props.openNote) {
    props.openNote(props.index);
  }
};

const onRemove = () => {
  if (props.removeNote) {
    props.removeNote(props.index);
  }
};

const linkify = (text: string) => {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
  return text.replace(urlRegex, function (url) {
    return `<a href="${url}" target="_blank" class="hover:underline">${url}</a>`;
  });
};

const linkifiedContent = computed(() => linkify(props.note.content));

</script>
