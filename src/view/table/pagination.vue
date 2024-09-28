<template>
  <div
    class="flex justify-between items-center font-serif text-gray-600 dark:text-gray-400 text-sm"
  >
    <div class="flex items-center space-x-2">
      <p>Rows per page:</p>
      <Dropdown dropdownId="rowsPerPage" contentWidth="3.5rem" direction="up">
        <template #label>
          <Button class="py-[3px] pr-[2px]">
            {{ rowsPerPage }}
            <div
              class="p-[2px] ml-2 rounded-full hover:bg-cream-300 dark:hover:bg-gray-600 transition-transform duration-200"
              :class="{
                'rotate-180 bg-cream-300 dark:bg-gray-600':
                  uiStore.activeDropdown === 'rowsPerPage',
              }"
            >
              <PhCaretUp :size="16" />
            </div>
          </Button>
        </template>
        <DropdownItem
          v-for="option in rowsPerPageOptions"
          :key="option"
          :label="option.toString()"
          :itemType="option === rowsPerPage ? 'active' : 'normal'"
          @click="setRowsPerPage(option)"
        />
      </Dropdown>
    </div>
    <div>Page {{ currentPage }} of {{ totalPages }}</div>
    <div class="flex space-x-2">
      <Button
        @click="goToFirstPage"
        :disabled="currentPage === 1"
        class="py-[5px]"
      >
        <PhCaretDoubleLeft :size="16" />
      </Button>
      <Button
        @click="goToPreviousPage"
        :disabled="currentPage === 1"
        class="py-[5px]"
      >
        <PhCaretLeft :size="16" />
      </Button>
      <Button
        @click="goToNextPage"
        :disabled="currentPage === totalPages"
        class="py-[5px]"
      >
        <PhCaretRight :size="16" />
      </Button>
      <Button
        @click="goToLastPage"
        :disabled="currentPage === totalPages"
        class="py-[5px]"
      >
        <PhCaretDoubleRight :size="16" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { uiStore } from '@/store';
  import Dropdown from '@/components/ui/dropdown.vue';
  import DropdownItem from '@/components/ui/dropdownItem.vue';
  import Button from '@/components/ui/button.vue';
  import {
    PhCaretDoubleLeft,
    PhCaretLeft,
    PhCaretRight,
    PhCaretDoubleRight,
    PhCaretUp,
  } from '@phosphor-icons/vue';

  const props = defineProps<{
    currentPage: number;
    totalPages: number;
    rowsPerPage: number;
  }>();

  const emit = defineEmits<{
    (e: 'update:currentPage', value: number): void;
    (e: 'update:rowsPerPage', value: number): void;
  }>();

  const rowsPerPageOptions = [10, 20, 30, 40, 50, 100];

  const setRowsPerPage = (value: number) => {
    emit('update:rowsPerPage', value);
    emit('update:currentPage', 1);
  };

  const goToFirstPage = () => emit('update:currentPage', 1);
  const goToPreviousPage = () =>
    emit('update:currentPage', Math.max(1, props.currentPage - 1));
  const goToNextPage = () =>
    emit(
      'update:currentPage',
      Math.min(props.totalPages, props.currentPage + 1)
    );
  const goToLastPage = () => emit('update:currentPage', props.totalPages);
</script>
