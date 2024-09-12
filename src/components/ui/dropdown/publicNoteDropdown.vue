<template>
  <Dropdown
    dropdownId="create"
    contentWidth="6.4rem"
    direction="down"
    position="right"
  >
    <template #label>
      <Button v-if="note">
        <PhFile :size="20" class="mr-2" />
        {{ note.title }}
      </Button>
    </template>
    <div class="w-full text-sm px-1 space-y-1">
      <li
        @click.stop="saveNote"
        class="w-full text-left cursor-pointer p-2 rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
      >
        <PhFloppyDisk :size="20" class="mr-2" />
        Save as copy
      </li>
      <li
        @click.stop="closeNote"
        class="w-full text-left cursor-pointer p-2 rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
      >
        <PhArrowLeft :size="20" class="mr-2" />
        Back to home
      </li>
    </div>
  </Dropdown>
</template>

<script setup lang="ts">
  import { nextTick, PropType } from 'vue';
  import { uiStore, notesStore } from '@/utils/stores';
  import { PhFloppyDisk, PhArrowLeft, PhFile } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import Button from '@/components/ui/button.vue';
  import { useRouter } from 'vue-router';
  import { Note } from '@/utils/types';

  const router = useRouter();

  const props = defineProps({
    note: {
      type: Object as PropType<Note | null>,
      required: true,
    },
  });

  const saveNote = async () => {
    if (props.note) {
      const newNote: Omit<
        Note,
        'id' | 'time_created' | 'last_edited' | 'pinned'
      > = {
        title: props.note.title,
        content: props.note.content,
        folder: 'No Folder',
      };

      try {
        await notesStore.addNote(newNote);
        uiStore.showToastMessage('Note saved as a new copy.');

        await nextTick();

        const addedNote = notesStore.notes.find(
          (n) => n.title === newNote.title && n.content === newNote.content
        );

        if (addedNote) {
          await router.push('/');
          uiStore.openNote(addedNote.id);
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
</script>
