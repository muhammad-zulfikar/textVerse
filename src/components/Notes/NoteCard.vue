<template>
  <Toast v-if="store.showToast" :message="store.toastMessage" />
  <li
    class="bg-cream dark:bg-gray-800 note-card break-inside-avoid h-min border-2 border-black dark:border-white mb-6 md:mb-8 shadow-xl hover:shadow-2xl rounded-lg p-2 flex flex-col overflow-x-auto relative group"
    @contextmenu.prevent="showContextMenu($event)">
    <div class="flex justify-between items-start">
      <h1 class="font-bold text-sl font-serif cursor-pointer dark:text-white" @click="store.openNote(index)">
        {{ note.title }}
      </h1>
      <div class="relative flex items-center">
        <button class="flex-shrink-0 w-4 h-4 option-icon" @click="showContextMenu">
          <img :src="menuIcon" class="w-full h-full icon" alt="Menu" />
        </button>
      </div>
    </div>
    <div>
      <div v-if="!showOption" class="font-serif text-sm mt-2 dark:text-white" v-html="linkifiedContent"></div>
      <div v-if="!showOption" class="flex pt-3 mt-auto">
        <p class="font-serif text-gray-500 text-xs mt-auto ml-auto">{{ note.timeCreated }}</p>
      </div>
    </div>
  </li>
  <ContextMenu :visible="showMenu" :position="menuPosition" :noteIndex="index" @hideMenu="showMenu = false"
    @edit="store.openNote" @delete="store.removeNote" @download="store.downloadNote(note)" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useNotesStore, Note } from '@/stores/ProductStore';
import Toast from '../Toast/Toast.vue';
import ContextMenu from '../ContextMenu/ContextMenu.vue';

import menuIcon from '@/assets/icons/option.svg';

const store = useNotesStore();

const props = defineProps({
  note: {
    type: Object as () => Note,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const showOption = ref(false);
const showMenu = ref(false);
const menuPosition = ref({ x: 0, y: 0 });

const linkifiedContent = computed(() => store.linkify(props.note.content));

const showContextMenu = (event: MouseEvent) => {
  const isMobile = window.innerWidth <= 767;
  const x = isMobile ? event.clientX - 100 : event.clientX;
  const y = event.clientY;
  menuPosition.value = { x, y };
  showMenu.value = true;
};
</script>

<style scoped>
.icon {
  transition: filter 0.3s ease;
}

.dark .icon {
  filter: invert(1) brightness(2);
}

@media (min-width: 768px) {
  .option-icon {
    display: none;
  }

  .group:hover .option-icon {
    display: block;
  }
}

@media (max-width: 767px) {
  .option-icon {
    display: block;
  }
}
</style>