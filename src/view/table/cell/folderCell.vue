<template>
  <td
    @click="$emit('set-current-folder', folder)"
    class="max-w-[200px] p-3 border-b-[1px] border-r-[1px] border-black dark:border-white cursor-pointer hover:underline"
  >
    <div class="flex items-center truncate">
      <span class="truncate">{{ folder }}</span>
    </div>
  </td>
</template>

<script setup lang="ts">
  defineProps<{
    folder: string;
  }>();

  defineEmits<{
    (e: 'set-current-folder', folder: string): void;
  }>();
</script>
