<template>
  <Toast v-if="showToast" :message="toastMessage" />
  <li
    class="bg-cream dark:bg-gray-800 note-card break-inside-avoid h-min border-2 border-black dark:border-white mb-6 md:mb-8 shadow-xl hover:shadow-2xl rounded-lg p-2 flex flex-col overflow-x-auto relative"
    @mouseover="showMenu = isDesktop" @mouseleave="handleMouseLeave">
    <div class="flex justify-between items-start">
      <h1 class="font-bold text-sl font-serif cursor-pointer dark:text-white" @click="handleOpenNote">{{ props.note.title }}
      </h1>
      <div class="relative flex items-center">
        <button v-if="showMenu || isMobile" class="flex-shrink-0 w-3 h-3 mt-1" @click="handleOpenOption">
          <img :src="showOption ? downIcon : upIcon" class="w-full h-full icon" alt="Menu" />
        </button>
      </div>
    </div>
    <div>
      <div v-if="!showOption" class="font-serif text-sm mt-2 dark:text-white" v-html="linkifiedContent"></div>
      <div v-if="!showOption" class="flex pt-3 mt-auto">
        <p class="font-serif text-gray-500 text-xs mt-auto ml-auto">{{ props.note.timeCreated }}</p>
      </div>
      <ul v-else class="flex justify-center font-serif text-sm p-4 gap-14 md:gap-10 dark:text-white">
        <li @click="handleOpenNote" class="hover:underline cursor-pointer">Edit</li>
        <li @click="onRemove" class="hover:underline cursor-pointer">Delete</li>
        <li @click="downloadNote" class="hover:underline cursor-pointer">Download</li>
      </ul>
    </div>
  </li>
</template>

<script setup lang="ts">
import { ref, defineProps, computed } from 'vue';
import { Note } from '@/stores/ProductStore';
import Toast from '../Toast/Toast.vue';

// Import your icons directly using ES module syntax
import upIcon from '@/assets/icons/up.svg';
import downIcon from '@/assets/icons/down.svg';

const showToast = ref(false);
const toastMessage = ref('');

const props = defineProps({
  note: {
    type: Object as () => Note,
    required: true,
  },
  index: Number,
  removeNote: Function,
  openNote: Function,
});

const handleOpenNote = () => {
  if (props.openNote) {
    props.openNote(props.index);
  }
  showOption.value = false; // Hide options after opening note
};

const showOption = ref(false);
const showMenu = ref(false);

const handleOpenOption = () => {
  showOption.value = !showOption.value;
};

const onRemove = () => {
  if (props.removeNote) {
    props.removeNote(props.index);
  }
  showToast.value = true;
  toastMessage.value = 'Note deleted successfully!';
  showOption.value = false; // Hide options after deleting note
};

const downloadNote = () => {
  const { title, content, timeCreated } = props.note;
  const filename = `${title} - ${timeCreated}.txt`;
  const blob = new Blob([`Title: ${title}\nTime Created: ${timeCreated}\n\n${content}`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  showToast.value = true;
  toastMessage.value = 'Note downloaded successfully!';
  showOption.value = false; // Hide options after downloading note
};

const linkify = (text: string) => {
  const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
  return text.replace(urlRegex, function (url) {
    return `<a href="${url}" target="_blank" class="hover:underline">${url}</a>`;
  });
};

const linkifiedContent = computed(() => linkify(props.note.content));

const isMobile = window.innerWidth <= 767;
const isDesktop = !isMobile;

const handleMouseLeave = () => {
  showOption.value = false;
  showMenu.value = false;
};
</script>

<style scoped>
.icon {
  transition: filter 0.3s ease;
}

.dark .icon {
  filter: invert(1) brightness(2);
}
</style>
