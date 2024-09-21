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
      contentWidth="9rem"
      direction="down"
      position="right"
    >
      <template #label>
        <Button :class="['text-sm md:text-base px-4 py-2']">
          <component :is="currentPreferenceIcon" :size="20" class="mr-2" />
          {{ currentPreferenceText }}
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
      <a
        v-for="preference in preferences"
        :key="preference"
        @click="setPreference(preference)"
        class="flex items-center flex-grow flex-shrink mx-1 p-2 hover:bg-cream-200 dark:hover:bg-gray-700 text-sm md:text-base rounded-md cursor-pointer"
        role="menuitem"
      >
        <component :is="preferenceIcon(preference)" :size="20" class="mr-2" />
        {{ preference.charAt(0).toUpperCase() + preference.slice(1) }}
      </a>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { PhCaretDown, PhCardsThree, PhSidebar } from '@phosphor-icons/vue';
  import { uiStore } from '@/store';
  import Button from '@/components/ui/button.vue';
  import Dropdown from '@/components/ui/dropdown.vue';

  const preferences = ['modal', 'sidebar'] as const;

  const currentPreferenceText = computed(
    () =>
      uiStore.noteViewType.charAt(0).toUpperCase() +
      uiStore.noteViewType.slice(1)
  );

  const currentPreferenceIcon = computed(() => {
    return uiStore.noteViewType === 'modal' ? PhCardsThree : PhSidebar;
  });

  const preferenceIcon = (preference: string) => {
    return preference === 'modal' ? PhCardsThree : PhSidebar;
  };

  const setPreference = (preference: 'modal' | 'sidebar') => {
    uiStore.setNoteViewType(preference);
    uiStore.showToastMessage('Note view type updated');
    uiStore.setActiveDropdown(null);
  };
</script>
