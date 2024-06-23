<template>
    <ul class="w-11/12 mx-auto mt-6 mb-18 gap-8 columns-1 md:columns-3 lg:columns-4 2xl:w-7/12 relative">
        <template v-if="filteredNotes.length > 0" v-for="(note, index) in filteredNotes" :key="note.id">
            <NoteCard :note="note" :index="index" :openNote="openNote" :removeNote="removeNote" />
        </template>
        <template v-else>
            <div class="absolute inset-0 flex justify-center items-center mt-16">
                <div class="font-serif dark:text-white">Not found</div>
            </div>
        </template>
    </ul>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import NoteCard from './NoteCard.vue';
import { Note } from '../../stores/ProductStore';

const props = defineProps<{
    notes: Note[];
    searchQuery: string;
    openNote: (index: number) => void;
    removeNote: (index: number) => void;
}>();

const filteredNotes = computed(() => {
    const query = props.searchQuery.toLowerCase();
    return props.notes.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query)
    );
});
</script>