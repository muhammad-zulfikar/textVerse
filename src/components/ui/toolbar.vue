<template>
  <div class="flex justify-between my-4 md:my-6 mx-2 md:mx-4 select-none">
    <folderDropdown />
    <div class="ml-auto flex space-x-2 md:space-x-4">
      <sortDropdown />
      <selectButton />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import folderDropdown from '@/components/composable/dropdown/folderDropdown.vue';
  import selectButton from '@/components/composable/button/selectButton.vue';
  import sortDropdown from '@/components/composable/dropdown/sortDropdown.vue';
</script>
