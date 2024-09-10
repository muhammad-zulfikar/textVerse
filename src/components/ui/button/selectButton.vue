<template>
  <div class="flex items-center font-serif select-button" @click.stop>
    <Button @click="toggleSelectMode" class="text-sm">
      <template v-if="uiStore.isSelectMode">
        <PhXCircle :size="20" class="size-5" />
        <span class="hidden md:flex ml-2">Cancel</span>
      </template>
      <template v-else>
        <PhCheckCircle :size="20" class="size-5" />
        <span class="hidden md:flex ml-2">Select</span>
      </template>
    </Button>
  </div>
</template>

<script lang="ts" setup>
  import Button from '../button.vue';
  import { PhCheckCircle, PhXCircle } from '@phosphor-icons/vue';
  import { notesStore, uiStore } from '@/utils/stores';

  const toggleSelectMode = (event: Event) => {
    event.stopPropagation();
    uiStore.toggleSelectMode();
    if (!uiStore.isSelectMode) {
      notesStore.clearSelectedNotes();
    }
  };
</script>
