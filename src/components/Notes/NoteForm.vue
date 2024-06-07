<template>
  <div v-if="editing" class="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
  <form v-if="editing" class="fixed inset-0 z-50 flex flex-col items-center justify-center">
    <div class="bg-white w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 p-5 rounded-lg border-2 border-black relative"
      :style="{ backgroundColor: selectedColor }">
      <div class="flex justify-end mb-2">
        <button @click.prevent="closeForm" class="flex-shrink-0 w-6 h-6 cursor-pointer">
          <img src="@/assets/close.svg" class="w-full h-full" alt="Close" />
        </button>
      </div>
      <h1 class="text-xl font-bold mb-4 relative">
        <input v-model="title" class="w-full p-1 bg-transparent border-0 border-b-2 border-black outline-none"
          placeholder="Title" autofocus />
        <span class="flex justify-end font-normal text-sm text-gray-500 mt-1">{{ title.length }} / 50</span>
      </h1>
      <textarea v-model="content" class="w-full p-2 bg-transparent border-2 border-black rounded focus:outline-none"
        rows="5" placeholder="Content"></textarea>
      <span class="flex justify-end text-sm text-gray-500">{{ content.length }} / 5000</span>

      <div class="flex align-center justify-center mt-4">
        <div v-for="(colorOption, index) in colorOptions" :key="index" class="mr-2 mb-2">
          <input type="radio" :id="colorOption" v-model="selectedColor" :value="colorOption" class="hidden" />
          <label :for="colorOption" :style="{
            backgroundColor: colorOption,
            borderColor: selectedColor === colorOption ? 'black' : '#d1d5db',
          }" class="inline-block w-6 lg:w-7 xl:w-8 h-6 lg:h-7 xl:h-8 rounded-full cursor-pointer border-2"></label>
        </div>
      </div>

      <div class="flex justify-end">
        <button :disabled="!isValid" @click.prevent="saveNote" class="flex-shrink-0 w-6 h-6 cursor-pointer">
          <img src="@/assets/save.svg" class="w-full h-full" alt="Save" />
        </button>
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
const selectedColor = ref('#FFFFFF');
const colorOptions = ['#FFFFFF', '#FFC0CB', '#FFD700', '#90EE90', '#ADD8E6', '#FFA07A', '#20B2AA', '#87CEFA'];

const isValid = computed(() => {
  return title.value.trim().length > 0 && title.value.length <= 50 && content.value.length <= 5000;
});

const saveNote = () => {
  if (!isValid.value) {
    // Display an error message or alert for invalid input
    return;
  }

  const newNote = {
    title: title.value,
    content: content.value,
    color: selectedColor.value,
    timeCreated: new Date().toLocaleString()
  };
  notesStore.addNote(newNote);
  emit('closeForm');
};

const closeForm = () => {
  editing.value = false;
  title.value = '';
  content.value = '';
  selectedColor.value = '#FFFFFF';
  emit('closeForm');
};

const emit = defineEmits(['closeForm']);

</script>
