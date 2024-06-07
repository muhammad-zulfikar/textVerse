<template>
    <li :style="{ backgroundColor: props.note.color }"
        class="note-card break-inside-avoid h-min border-2 border-black dark:border-white mb-8 hover:shadow-2xl rounded-lg p-2 flex flex-col overflow-x-auto relative">
        <div class="flex justify-between items-start">
            <h1 class="font-bold text-sl font-mono mt-1 cursor-pointer" @click="handleOpenNote">{{ props.note.title }}
            </h1>
            <div class="relative flex items-center">
                <button class="menu-icon flex-shrink-0 w-4 h-4 mt-1" @click="toggleMenu">
                    <img src="@/assets/three-dots-icon.svg" class="w-full h-full" alt="Menu" />
                </button>
                <div v-if="showMenu"
                    class="menu bg-yellow-500 border-2 border-black dark:border-white rounded shadow-lg absolute top-0 right-0 w-24 pointer">
                    <ul class="flex">
                        <li @click="handleOpenNote" class="p-2 hover:bg-yellow-400 cursor-pointer">
                            <img src="@/assets/edit.svg" width="24" height="24" class="mr-2" alt="Edit" />
                        </li>
                        <li @click="downloadNote" class="p-2 hover:bg-yellow-400 cursor-pointer">
                            <img src="@/assets/download.svg" width="24" height="24" class="mr-2" alt="Download" />
                        </li>
                        <li @click="onRemove" class="p-2 hover:bg-yellow-400 cursor-pointer">
                            <img src="@/assets/delete.svg" width="24" height="24" class="mr-2" alt="Delete" />
                        </li>
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
import { defineProps, computed, ref, onMounted, onBeforeUnmount } from 'vue';
import { Note } from '@/stores/ProductStore';

const props = defineProps({
    note: {
        type: Object as () => Note,
        required: true
    },
    index: Number,
    removeNote: Function,
    openNote: Function
});

const showMenu = ref(false);

const onRemove = () => {
    if (props.removeNote) {
        props.removeNote(props.index);
        showMenu.value = false;
    }
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
};

const handleOpenNote = () => {
    if (props.openNote) {
        props.openNote(props.index);
        showMenu.value = false;
    }
};

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

const handleClickOutside = (event: Event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-icon') && !target.closest('.menu')) {
        showMenu.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});
</script>
