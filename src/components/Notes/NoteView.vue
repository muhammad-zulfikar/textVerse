<template>
    <div v-if="note" class="modal fixed inset-0 flex items-center justify-center z-50" @click.self="saveNote">
        <div :style="{ backgroundColor: note.color }"
            class="modal-content w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/3 p-5 rounded-lg border-2 border-black relative">
            <div class="flex justify-end">
                <button class="flex-shrink-0 w-6 h-6 cursor-pointer" @click="closeNote">
                    <img src="@/assets/icons/close.svg" class="w-full h-full" alt="Close" />
                </button>
            </div>
            <h1 class="text-xl font-bold mb-4">
                <input v-model="note.title"
                    class="w-full p-1 bg-transparent border-0 border-b-2 border-black focus:outline-none" />
            </h1>
            <textarea v-model="note.content"
                class="w-full p-2 bg-white border-2 border-black rounded focus:outline-none" rows="5"
                :style="{ backgroundColor: note.color }"></textarea>
            <div class="flex justify-end mt-2">
                <div>
                    <p class="text-gray-500 text-sm">{{ note.timeCreated }}</p>
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

const closeNote = () => {
    emit('close');
};

const saveNote = () => {
    if (note.value) {
        emit('save', note.value);
    }
};
</script>

<style scoped>
.modal {
    background-color: rgba(0, 0, 0, 0.5);
}
</style>