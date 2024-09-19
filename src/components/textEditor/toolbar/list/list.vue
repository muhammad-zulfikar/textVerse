<template>
  <div class="flex space-x-1">
    <button
      v-for="list in lists"
      :key="list.command"
      @click="applyStyle(list.command)"
      :class="{ active: isActive(list.command) }"
      :title="list.title"
    >
      <component :is="list.icon" :size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import { PhListNumbers, PhListBullets } from '@phosphor-icons/vue';

  interface List {
    command: string;
    title: string;
    icon: any;
  }

  const lists: List[] = [
    {
      command: 'insertOrderedList',
      title: 'Ordered List',
      icon: PhListNumbers,
    },
    {
      command: 'insertUnorderedList',
      title: 'Unordered List',
      icon: PhListBullets,
    },
  ];

  const activeStates = ref<Record<string, boolean>>({});

  const applyStyle = (command: string) => {
    document.execCommand(command, false);
    updateActiveState();
  };

  const isActive = (command: string): boolean => !!activeStates.value[command];

  const updateActiveState = () => {
    lists.forEach((list) => {
      activeStates.value[list.command] = document.queryCommandState(
        list.command
      );
    });
  };

  onMounted(() => {
    document.addEventListener('selectionchange', updateActiveState);
  });

  onUnmounted(() => {
    document.removeEventListener('selectionchange', updateActiveState);
  });
</script>
