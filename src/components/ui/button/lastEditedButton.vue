<!-- components/LastEditedButton.vue -->
<template>
  <Dropdown
    dropdownId="lastEditedDropdown"
    direction="down"
    position="right"
    contentWidth="200px"
  >
    <template #label>
      <Button class="flex items-center">
        <PhSpinnerGap v-if="isSaving" :size="20" class="mr-2 animate-spin" />
        <PhCloudCheck v-else :size="20" class="mr-2" />
        {{ formattedLastEdited }}
      </Button>
    </template>
    <div class="p-2">
      <div class="flex items-center text-sm mb-2">
        <PhCalendarDot :size="20" class="mr-2" />
        <span>Last edited: {{ formattedLastEdited }}</span>
      </div>
      <div class="flex items-center text-sm">
        <PhCalendarBlank :size="20" class="mr-2" />
        <span>Created at: {{ formattedCreated }}</span>
      </div>
    </div>
  </Dropdown>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import {
    PhSpinnerGap,
    PhCloudCheck,
    PhCalendarBlank,
    PhCalendarDot,
  } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import Button from '@/components/ui/button.vue';
  import { notesStore } from '@/utils/stores';

  const props = defineProps<{
    lastEdited: string | Date;
    created: string | Date;
    isSaving: boolean;
  }>();

  const formattedLastEdited = computed(() =>
    notesStore.localeDate(props.lastEdited)
  );
  const formattedCreated = computed(() => notesStore.localeDate(props.created));
</script>
