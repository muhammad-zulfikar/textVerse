<template>
  <div v-if="editing" class="fixed inset-0 z-40 bg-black bg-opacity-30" :style="{ backdropFilter: 'blur(2px)' }"></div>
  <form v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center font-serif">
    <div :class="[
    'bg-cream dark:bg-gray-900 p-5 rounded-lg border-2 border-black dark:border-white relative flex flex-col',
    {
      'w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3': !isFullScreen,
      'w-full h-full': isFullScreen,
      'rounded-lg': !isFullScreen,
      'rounded-none': isFullScreen,
    }
  ]">
      <h1 class="text-xl font-bold mb-4 relative mt-2">
        <input v-model="title" @focus="handleFocus('title')" @blur="handleBlur('title')" :placeholder="titlePlaceholder"
          class="text-black dark:text-white w-full p-1 bg-transparent border-0 border-b-2 border-black dark:border-white outline-none placeholder-black dark:placeholder-white placeholder-opacity-50" />
        <span class="flex justify-end font-normal text-sm text-gray-500 mt-1">{{ title.length }} / 30</span>
      </h1>
      <textarea v-model="content" @focus="handleFocus('content')" @blur="handleBlur('content')"
        :placeholder="contentPlaceholder"
        class="text-black dark:text-white w-full p-2 bg-transparent resize-none border-2 border-black dark:border-white rounded focus:outline-none flex-grow placeholder-black dark:placeholder-white placeholder-opacity-50"
        rows="5"></textarea>
      <span class="flex justify-end text-sm text-gray-500">{{ content.length }} / 5000</span>

      <div class="flex justify-between mt-6">
        <button @click.prevent="toggleFullScreen"
          class="text-black dark:text-white hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none cursor-pointer">
          <span class="text-sm">{{ isFullScreen ? 'Collapse' : 'Expand' }}</span>
        </button>
        <div>
          <button @click.prevent="closeForm"
            class="text-black dark:text-white hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none mr-6 cursor-pointer">
            <span class="text-sm">Cancel</span>
          </button>
          <button :disabled="!isValid" @click.prevent="saveNote"
            class="text-black dark:text-white hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none cursor-pointer">
            <span class="text-sm">Save</span>
          </button>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, defineEmits, computed } from 'vue';
import { useNotesStore } from '@/stores/ProductStore';

const notesStore = useNotesStore();

const editing = ref(true);
const title = ref('');
const content = ref('');
const isFullScreen = ref(false);

const titlePlaceholder = ref('Title');
const contentPlaceholder = ref('Content');

const isValid = computed(() => {
  return title.value.trim().length > 0 && title.value.length <= 30 && content.value.length <= 5000;
});

const saveNote = () => {
  if (!isValid.value) {
    return;
  }

  const newNote = {
    title: title.value,
    content: content.value,
    timeCreated: new Date().toLocaleString()
  };
  notesStore.addNote(newNote);
  emit('closeForm');
};

const closeForm = () => {
  editing.value = false;
  title.value = '';
  content.value = '';
  emit('closeForm');
};

const toggleFullScreen = () => {
  isFullScreen.value = !isFullScreen.value;
};

const handleFocus = (field) => {
  if (field === 'title') {
    titlePlaceholder.value = '';
  } else if (field === 'content') {
    contentPlaceholder.value = '';
  }
};

const handleBlur = (field) => {
  if (field === 'title') {
    if (title.value.trim() === '') {
      titlePlaceholder.value = 'Title';
    }
  } else if (field === 'content') {
    if (content.value.trim() === '') {
      contentPlaceholder.value = 'Content';
    }
  }
};

const emit = defineEmits(['closeForm']);
</script>
