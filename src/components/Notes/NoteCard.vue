<template>
    <li :style="{ backgroundColor: props.note.color }"
        class="note-card break-inside-avoid h-min border-2 border-black mb-8 hover:shadow-2xl rounded-lg p-2 flex flex-col overflow-x-auto relative">
        <div class="flex justify-between items-start">
            <h1 class="font-bold text-xl font-mono mt-1 cursor-pointer" @click="handleOpenNote">{{ props.note.title }}
            </h1>
            <div class="relative flex items-center">
                <button class="menu-icon flex-shrink-0 w-4 h-4 ml-2 cursor-pointer">
                    <img src="@/assets/open-notes.svg" class="w-full h-full"
                        @click="handleOpenNote" alt="Open" />
                </button>
                <button @click="toggleMenu" class="menu-icon flex-shrink-0 w-4 h-4 ml-2">
                    <img src="@/assets/three-dots-icon.svg" class="w-full h-full" alt="Menu" />
                </button>
                <div v-if="showMenu" class="menu bg-white border rounded shadow-lg absolute right-0 mt-2 w-24 pointer">
                    <ul>
                        <li @click="editNote" class="px-4 py-2 hover:bg-gray-200 cursor-pointer">Edit</li>
                        <li @click="onRemove" class="px-4 py-2 hover:bg-gray-200 cursor-pointer">Delete</li>
                    </ul>
                </div>
            </div>
        </div>
        <p v-html="linkifiedContent" class="font-serif text-sm mt-2"></p>
        <div class="flex pt-3 mt-auto">
            <p class="text-gray-500 text-xs mt-auto ml-auto">{{ props.note.timeCreated }}</p>
        </div>
    </li>
</template>

<script setup lang="ts">
import { defineProps, computed, ref } from 'vue';
import { Note } from '@/stores/ProductStore';

const props = defineProps({
    note: {
        type: Object as () => Note,
        required: true
    },
    index: Number,
    removeNote: Function,
    editNote: Function,
    openNote: Function
});

const showMenu = ref(false);

const linkify = (text: string) => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig;
    return text.replace(urlRegex, function (url) {
        return `<a href="${url}" target="_blank" class="hover:underline">${url}</a>`;
    });
};

const linkifiedContent = computed(() => linkify(props.note.content));

const toggleMenu = () => {
    showMenu.value = !showMenu.value;
};

const onRemove = () => {
    if (props.removeNote) {
        props.removeNote(props.index);
        showMenu.value = false;
    }
};

const editNote = () => {
    if (props.editNote) {
        props.editNote(props.index);
        showMenu.value = false;
    }
};

const handleOpenNote = () => {
    if (props.openNote) {
        props.openNote(props.index);
    }
};
</script>
