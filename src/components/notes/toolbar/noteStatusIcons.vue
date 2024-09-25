<!-- NoteStatusIcons.vue -->
<template>
  <div class="flex">
    <Button
      v-if="isPinned"
      class="ml-2 md:ml-4"
      @mouseenter="hoverPin = true"
      @mouseleave="hoverPin = false"
      @click="$emit('togglePin')"
    >
      <PhPushPin v-if="!hoverPin" :size="20" class="size-5" />
      <PhPushPinSlash v-else :size="20" class="size-5" />
    </Button>
    <Button
      v-if="isPublic"
      class="ml-2 md:ml-4"
      @mouseenter="hoverPublic = true"
      @mouseleave="hoverPublic = false"
      @click="$emit('togglePublic')"
    >
      <PhGlobe v-if="!hoverPublic" :size="20" class="size-5" />
      <PhGlobeX v-else :size="20" class="size-5" />
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import {
    PhPushPin,
    PhPushPinSlash,
    PhGlobe,
    PhGlobeX,
    PhSpinnerGap,
    PhCalendarCheck,
    PhTrash,
  } from '@phosphor-icons/vue';
  import Button from '@/components/ui/button.vue';
  import { localeDate } from '@/store/notesStore/helpers';

  defineProps<{
    isPinned: boolean;
    isPublic: boolean;
    isSaving: boolean;
    isTrash: boolean;
  }>();

  defineEmits<{
    (e: 'togglePin'): void;
    (e: 'togglePublic'): void;
  }>();

  const hoverPin = ref(false);
  const hoverPublic = ref(false);
</script>
