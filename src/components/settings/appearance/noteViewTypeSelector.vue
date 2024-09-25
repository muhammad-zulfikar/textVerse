<template>
  <div class="flex items-center justify-between relative md:mb-2">
    <div class="mr-6">
      <label for="noteViewType" class="text-lg font-semibold mb-1">
        Note View Type
      </label>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Choose your preferred note viewing style.
      </p>
    </div>
    <Dropdown
      label="Note View Type"
      dropdownId="noteViewType"
      contentWidth="8.7rem"
      direction="down"
      position="right"
    >
      <template #label>
        <Button class="text-sm md:text-base px-4 py-2">
          <component :is="currentNoteViewTypeIcon" :size="20" class="mr-2" />
          {{ currentNoteViewTypeText }}
          <div
            class="p-1 ml-2 rounded-full hover:bg-cream-300 dark:hover:bg-gray-600 transition-transform duration-200"
            :class="{
              'rotate-180 bg-cream-300 dark:bg-gray-600':
                uiStore.activeDropdown === 'noteViewType',
            }"
          >
            <PhCaretDown class="size-4" />
          </div>
        </Button>
      </template>

      <DropdownItem
        v-for="(option, index) in noteViewOptions"
        :key="index"
        @click="setNoteViewType(option.type)"
        :icon="option.icon"
        :label="option.label"
        :itemType="uiStore.noteViewType === option.type ? 'active' : 'normal'"
        class="text-sm md:text-base"
      />
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { PhCaretDown, PhCardsThree, PhSidebar } from '@phosphor-icons/vue';
  import { uiStore } from '@/store';
  import Button from '@/components/ui/button.vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import type { NoteViewType } from '@/store/uiStore/types';

  interface NoteViewOption {
    label: string;
    icon: any;
    type: NoteViewType;
  }

  const noteViewOptions: NoteViewOption[] = [
    {
      label: 'Modal',
      icon: PhCardsThree,
      type: 'modal',
    },
    {
      label: 'Sidebar',
      icon: PhSidebar,
      type: 'sidebar',
    },
  ];

  const currentNoteViewTypeText = computed(
    () =>
      uiStore.noteViewType.charAt(0).toUpperCase() +
      uiStore.noteViewType.slice(1)
  );

  const currentNoteViewTypeIcon = computed(() => {
    return uiStore.noteViewType === 'modal' ? PhCardsThree : PhSidebar;
  });

  const setNoteViewType = (preference: NoteViewType) => {
    uiStore.setNoteViewType(preference);
    uiStore.showToastMessage('Note view type updated');
    uiStore.setActiveDropdown(null);
  };
</script>
