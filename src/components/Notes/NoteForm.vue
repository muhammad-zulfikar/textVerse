<!-- NoteForm.vue -->

<template>
  <div
    v-if="store.editing"
    class="fixed inset-0 z-50 flex items-center justify-center"
  >
    <div
      @click="handleOutsideClick"
      class="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-[2px]"
    ></div>
    <form
      @submit.prevent="saveNote"
      @click.stop
      class="z-50 font-serif custom-card-no-transition p-5 relative flex flex-col"
      :class="{
        'w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3': !store.isFullScreen,
        'w-full h-full rounded-none border-none': store.isFullScreen,
      }"
    >
      <div class="absolute top-0 right-1 flex text-sm p-4 select-none">
        <button
          class="hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none mr-6"
          @click.prevent="store.toggleFullScreen"
        >
          {{ store.isFullScreen ? 'Collapse' : 'Expand' }}
        </button>
        <button
          class="hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none"
          @click.prevent="closeForm"
        >
          Close
        </button>
      </div>
      <h1 class="text-xl font-bold mb-4 mt-8">
        <input
          v-model="title"
          placeholder="Title"
          class="w-full bg-transparent p-1 border-0 border-b-[1px] md:border-b-2 border-black dark:border-white outline-none placeholder-black dark:placeholder-white placeholder-opacity-50 dark:placeholder-opacity-30"
        />
        <span
          :class="[
            'flex justify-end font-normal text-gray-500 text-sm mt-1',
            { 'text-red-500': title.length > 30 },
          ]"
        >
          {{ title.length }} / 30
        </span>
      </h1>
      <textarea
        v-model="content"
        placeholder="Content"
        class="w-full p-2 bg-transparent resize-none border-[1px] md:border-2 border-black dark:border-white rounded focus:outline-none flex-grow placeholder-black dark:placeholder-white placeholder-opacity-50 dark:placeholder-opacity-30"
        rows="5"
      ></textarea>
      <span
        :class="[
          'flex justify-end text-gray-500 text-sm mt-1 select-none',
          { 'text-red-500': content.length > 5000 },
        ]"
      >
        {{ content.length }} / 5000
      </span>
      <div class="flex justify-end mt-6 select-none">
        <div>
          <button
            :disabled="!isValid"
            type="submit"
            :class="[
              'dark:hover:bg-transparent outline-none text-sm',
              {
                'hover:underline cursor-pointer': isValid,
                'text-gray-500': !isValid,
              },
            ]"
          >
            <span>Save</span>
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
  import { ref, computed, watch } from 'vue';
  import { useNotesStore } from '@/store/store';

  const store = useNotesStore();

  const title = ref('');
  const content = ref('');

  const isValid = computed(() => {
    return (
      title.value.trim().length > 0 &&
      title.value.length <= 30 &&
      content.value.length <= 5000
    );
  });

  const hasUserInput = computed(() => {
    return title.value.trim().length > 0 || content.value.trim().length > 0;
  });

  const handleOutsideClick = () => {
    if (!hasUserInput.value) {
      closeForm();
    }
  };

  const saveNote = () => {
    if (!isValid.value) {
      return;
    }
    store.addNote({
      title: title.value,
      content: content.value,
    });
    closeForm();
  };

  const closeForm = () => {
    store.setEditing(false);
    title.value = '';
    content.value = '';
  };

  watch(
    () => store.editing,
    (newValue) => {
      if (newValue) {
        document.body.classList.add('modal-open');
      } else {
        document.body.classList.remove('modal-open');
      }
    }
  );
</script>
