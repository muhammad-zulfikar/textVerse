<template>
    <div v-if="note" class="fixed inset-0 flex items-center justify-center z-50 font-serif bg-black bg-opacity-30" :style="{ backdropFilter: 'blur(2px)' }">
        <div
            :class="['bg-cream dark:bg-gray-900 modal-content p-5 rounded-lg border-2 border-black dark:border-white relative flex flex-col', { 'w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3': !isFullScreen, 'w-full h-full': isFullScreen }]">
            <h1 class="text-xl text-black dark:text-white font-bold mb-4 mt-2">
                <input v-model="note.title"
                    class="w-full p-1 bg-transparent focus:outline-none" />
            </h1>
            <textarea v-model="note.content"
                class="bg-cream dark:bg-gray-900 text-black dark:text-white w-full p-2 border-2 border-black dark:border-white rounded focus:outline-none flex-grow resize-none"
                rows="5"></textarea>
            <div class="flex justify-end mt-2">
                <div>
                    <p class="text-gray-500 text-sm">{{ note.timeCreated }}</p>
                </div>
            </div>
            <div class="flex justify-between mt-6 text-sm">
                <button class="text-black dark:text-white hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none"
                    @click="toggleFullScreen"> {{ isFullScreen ? 'Collapse' : 'Expand' }}
                </button>
                <div>
                    <button class="text-black dark:text-white hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none mr-6"
                        @click="closeNote">Cancel
                    </button>
                    <button class="text-black dark:text-white hover:underline hover:bg-transparent dark:hover:bg-transparent outline-none"
                        @click="saveNote">Save
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { Note } from '@/stores/ProductStore';

const props = defineProps({
    note: {
        type: Object as () => Note,
        required: true
    },
    openNote: Function
});

const emit = defineEmits(['close', 'save']);

const note = ref(props.note);
const isFullScreen = ref(false);

const closeNote = () => {
    emit('close');
};

const saveNote = () => {
    if (note.value) {
        emit('save', note.value);
    }
};

const toggleFullScreen = () => {
    isFullScreen.value = !isFullScreen.value;
};
</script>
