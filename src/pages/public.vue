<template>
  <div
    v-if="isLoading"
    class="flex items-center justify-center h-screen -mt-10 font-serif"
  >
    <p class="text-md card px-4 py-2">Loading...</p>
  </div>
  <div
    v-else-if="note"
    class="fixed inset-0 flex items-center justify-center font-serif mt-14"
  >
    <div
      :class="['p-5 relative flex flex-col', 'card-fullscreen w-full h-full']"
    >
      <div
        class="flex justify-between text-sm mb-4 select-none items-start md:items-center"
      >
        <h1 class="text-3xl font-bold flex-grow">
          {{ note.title }}
          <span class="text-sm font-normal text-gray-500 ml-2">
            {{ localeDate(note.last_edited || note.time_created) }}
          </span>
        </h1>
        <div class="flex space-x-2 items-start md:items-center">
          <button
            @click="saveNote"
            class="flex items-center px-2 py-1 card hover:bg-cream-200 dark:hover:bg-gray-700"
          >
            <PhFloppyDisk :size="20" class="size-5 md:mr-2" />
            <span class="hidden md:flex">Save as copy</span>
          </button>
          <button
            @click="closeNote"
            class="flex items-center px-2 py-1 card hover:bg-cream-200 dark:hover:bg-gray-700"
          >
            <PhX :size="20" class="size-5 md:mr-2" />
            <span class="hidden md:flex">Close</span>
          </button>
        </div>
      </div>
      <div
        class="bg-black dark:bg-gray-400 h-px transition-all duration-300"
      ></div>
      <div class="w-full pt-4 flex-grow overflow-hidden flex flex-col">
        <TextEditor
          v-model="note.content"
          :showToolbar="false"
          :editable="false"
          class="h-full flex-grow overflow-y-auto"
        />
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex items-center justify-center h-screen pb-20 font-serif"
  >
    <p class="text-md card px-4 py-2">Note not found or not accessible.</p>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick, onUnmounted } from 'vue';
  import { notesStore, uiStore } from '@/utils/stores';
  import { Note, PublicNote } from '@/utils/types';
  import TextEditor from '@/components/textEditor/textEditor.vue';
  import { useRoute, useRouter } from 'vue-router';
  import { PhFloppyDisk, PhX } from '@phosphor-icons/vue';
  import { ref as dbRef, onValue, off } from 'firebase/database';
  import { db } from '@/firebase';
  import { localeDate } from '@/utils/helpers';

  const route = useRoute();
  const router = useRouter();
  const note = ref<Note | null>(null);
  const isLoading = ref(true);
  let noteListener: any = null;

  onMounted(async () => {
    const publicId = route.params.publicId as string;
    setupRealTimeListener(publicId);
  });

  const setupRealTimeListener = async (publicId: string) => {
    const publicRef = dbRef(db, `publicNotes/${publicId}`);
    onValue(publicRef, async (snapshot) => {
      const publicNote = snapshot.val() as PublicNote | null;
      if (publicNote) {
        const noteRef = dbRef(
          db,
          `users/${publicNote.uid}/notes/${publicNote.id}`
        );
        if (noteListener) {
          off(noteRef, 'value', noteListener);
        }
        noteListener = onValue(noteRef, (noteSnapshot) => {
          note.value = noteSnapshot.val() as Note | null;
          isLoading.value = false;
        });
      } else {
        note.value = null;
        isLoading.value = false;
      }
    });
  };

  const saveNote = async () => {
    if (note.value) {
      const newNote: Omit<
        Note,
        'id' | 'time_created' | 'last_edited' | 'pinned'
      > = {
        title: note.value.title,
        content: note.value.content,
        folder: 'No Folder',
      };

      try {
        await notesStore.createNote(newNote);
        uiStore.showToastMessage('Note saved as a new copy.');

        await nextTick();

        const addedNote = notesStore.notes.find(
          (n) => n.title === newNote.title && n.content === newNote.content
        );

        if (addedNote) {
          await router.push('/');
          notesStore.openNote(addedNote.id);
        } else {
          console.error('Failed to find the newly added note');
          uiStore.showToastMessage('Error: Failed to open the new note.');
        }
      } catch (error) {
        console.error('Failed to add new note:', error);
        uiStore.showToastMessage('Error: Failed to save the note.');
      }
    }
  };

  const closeNote = () => {
    router.push('/');
  };

  onUnmounted(() => {
    if (noteListener) {
      const publicId = route.params.publicId as string;
      const publicRef = dbRef(db, `publicNotes/${publicId}`);
      off(publicRef);
    }
  });
</script>
