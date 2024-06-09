<template>
  <Toast v-if="showToast" :message="toastMessage" />
  <li :style="{ backgroundColor: props.note.color }"
    class="note-card break-inside-avoid h-min border-2 border-black dark:border-white mb-6 md:mb-8 hover:shadow-2xl rounded-lg p-2 flex flex-col overflow-x-auto relative"
    @mouseover="showMenu = isDesktop" @mouseleave="handleMouseLeave">
    <div class="flex justify-between items-start">
      <h1 class="font-bold text-sl font-serif cursor-pointer" @click="handleOpenNote">{{ props.note.title }}
      </h1>
      <div class="relative flex items-center">
        <button v-if="showMenu || isMobile" class="flex-shrink-0 w-4 h-4 mt-1" @click="handleOpenOption">
          <img :src="showOption ? downIcon : upIcon" class="w-full h-full" alt="Menu" />
        </button>
      </div>
    </div>
    <div>
      <div v-if="!showOption" class="font-serif text-sm mt-2" v-html="linkifiedContent"></div>
      <div v-if="!showOption" class="flex pt-3 mt-auto">
        <p class="font-serif text-gray-500 text-xs mt-auto ml-auto">{{ props.note.timeCreated }}</p>
      </div>
      <ul v-else class="flex justify-center font-serif text-sm p-4 gap-14 md:gap-10">
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
.menu-btn {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-btn:hover {
  opacity: 1;
}
</style>
