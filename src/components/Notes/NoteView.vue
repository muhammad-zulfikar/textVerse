<template>
    <div v-if="note" class="modal fixed inset-0 flex items-center justify-center z-50 font-serif">
        <div :style="{ backgroundColor: note.color }"
            :class="['modal-content p-5 rounded-lg border-2 border-black relative flex flex-col', { 'w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3': !isFullScreen, 'w-full h-full': isFullScreen }]">
            <h1 class="text-xl font-bold mb-4 mt-4">
                <input v-model="note.title"
                    class="w-full p-1 bg-transparent border-0 border-b-2 border-black focus:outline-none" />
            </h1>
            <textarea v-model="note.content"
                class="w-full p-2 bg-white border-2 border-black rounded focus:outline-none flex-grow"
                :style="{ backgroundColor: note.color }" rows="5"></textarea>
            <div class="flex justify-end mt-2">
                <div>
                    <p class="text-gray-500 text-sm">{{ note.timeCreated }}</p>
                </div>
            </div>
            <div class="flex justify-between mt-4">
                <button class="flex-shrink-0 p-2 border-2 border-black rounded-lg hover:shadow-xl cursor-pointer"
                    @click="toggleFullScreen">
                    {{ isFullScreen ? 'Collapse' : 'Expand' }}
                </button>
                <div>
                    <button
                        class="text-black p-2 border-2 border-black rounded-lg hover:shadow-xl outline-none cursor-pointer mr-4"
                        @click="closeNote">
                        <span class="text-sm">Cancel</span>
                    </button>
                    <button
                        class="text-black p-2 border-2 border-black rounded-lg hover:shadow-xl outline-none cursor-pointer"
                        @click="saveNote">
                        <span class="text-sm">Save</span>
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

<style scoped>
.modal {
    background-color: rgba(0, 0, 0, 0.5);
}
</style>
