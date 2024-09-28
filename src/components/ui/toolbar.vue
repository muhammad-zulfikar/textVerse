<template>
  <div class="flex justify-between my-4 md:my-6 mx-2 md:mx-4 select-none">
    <div>
      <folderDropdown v-if="!isTrashRoute" />
      <Button
        v-else
        variant="danger"
        @click="$emit('openEmptyTrashAlert')"
        class="text-sm"
      >
        <PhTrash :size="20" class="mr-2" />
        Empty Trash
      </Button>
    </div>
    <div class="ml-auto flex space-x-2 md:space-x-4">
      <sortDropdown />
      <selectButton />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  import folderDropdown from '@/components/composable/dropdown/folderDropdown.vue';
  import selectButton from '@/components/composable/button/selectButton.vue';
  import sortDropdown from '@/components/composable/dropdown/sortDropdown.vue';
  import Button from '@/components/ui/button.vue';
  import { PhTrash } from '@phosphor-icons/vue';

  const route = useRoute();

  const isTrashRoute = computed(() => route.path === '/trash');
</script>
