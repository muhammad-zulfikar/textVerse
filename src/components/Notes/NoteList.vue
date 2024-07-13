<template>
    <ul class="w-11/12 mx-auto mt-6 mb-18 gap-8 columns-1 md:columns-3 lg:columns-4 2xl:w-7/12 relative">
        <template v-if="store.filteredNotes.length > 0" v-for="(note, index) in store.filteredNotes" :key="note.id">
            <NoteCard :note="note" :index="index" />
        </template>
        <template v-else>
            <div class="absolute inset-0 flex justify-center items-center mt-16">
                <div class="font-serif dark:text-white">Not found</div>
            </div>
        </template>
    </ul>
</template>

<script lang="ts" setup>
import { useNotesStore } from '@/stores/ProductStore';
import NoteCard from './NoteCard.vue';

const store = useNotesStore();
</script>