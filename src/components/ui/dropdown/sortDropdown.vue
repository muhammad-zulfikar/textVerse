<template>
  <div class="flex items-center">
    <Dropdown
      dropdownId="sort"
      contentWidth="6.4rem"
      direction="down"
      position="left"
    >
      <template #label>
        <Button class="text-sm">
          <PhFunnel :size="20" />
          <span class="hidden md:flex md:ml-2">Sort</span>
        </Button>
      </template>
      <div class="w-full text-sm px-1 space-y-1">
        <li
          class="w-full text-left cursor-pointer p-2 rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PhTextAa :size="20" class="mr-2" />
          Title
        </li>
        <li
          class="w-full text-left cursor-pointer p-2 rounded-md hover:bg-[#ebdfc0] dark:hover:bg-gray-700 transition-colors duration-200 flex items-center"
        >
          <PhCalendarBlank :size="20" class="mr-2" />
          Date
        </li>
      </div>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
  import { PhFunnel, PhTextAa, PhCalendarBlank } from '@phosphor-icons/vue';
  import Dropdown from '@/components/ui/dropdown.vue';
  import Button from '@/components/ui/button.vue';
</script>
