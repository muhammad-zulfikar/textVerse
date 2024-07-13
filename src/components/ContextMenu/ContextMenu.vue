<template>
  <div v-if="visible" class="fixed inset-0 z-50" @click="hideMenu">
    <div :style="menuStyle"
      class="bg-cream dark:bg-gray-800 dark:text-white shadow-lg hover:shadow-xl border-2 border-black dark:border-white rounded-lg p-4 z-60">
      <ul class="font-serif text-sm">
        <li @click="editNote" class="hover:underline cursor-pointer mb-4">Edit</li>
        <li @click="deleteNote" class="hover:underline cursor-pointer my-4">Delete</li>
        <li @click="downloadNote" class="hover:underline cursor-pointer mt-4">Download</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CSSProperties } from 'vue';

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  noteIndex: {
    type: Number,
    required: true,
  },
  position: {
    type: Object as () => { x: number; y: number },
    required: true,
  },
});

const emit = defineEmits(['hideMenu', 'edit', 'delete', 'download']);

const hideMenu = () => {
  emit('hideMenu');
};

const editNote = () => {
  emit('edit', props.noteIndex);
};

const deleteNote = () => {
  emit('delete', props.noteIndex);
};

const downloadNote = () => {
  emit('download', props.noteIndex);
};

const menuStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
  position: 'absolute',
}) as CSSProperties);

</script>

<style scoped>
.z-50 {
  z-index: 50;
}

.z-60 {
  z-index: 60;
}
</style>