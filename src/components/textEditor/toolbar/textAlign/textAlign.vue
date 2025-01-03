<template>
  <div class="flex space-x-1">
    <button
      v-for="align in alignments"
      :key="align.command"
      @click="applyStyle(align.command)"
      :class="{ active: isActive(align.command) }"
      :title="align.title"
    >
      <component :is="align.icon" :size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import {
    PhTextAlignLeft,
    PhTextAlignCenter,
    PhTextAlignRight,
  } from '@phosphor-icons/vue';

  interface Alignment {
    command: string;
    title: string;
    icon: any;
    shortcut: string;
  }

  const alignments: Alignment[] = [
    {
      command: 'justifyLeft',
      title: 'Align Left',
      icon: PhTextAlignLeft,
      shortcut: 'l',
    },
    {
      command: 'justifyCenter',
      title: 'Align Center',
      icon: PhTextAlignCenter,
      shortcut: 'e',
    },
    {
      command: 'justifyRight',
      title: 'Align Right',
      icon: PhTextAlignRight,
      shortcut: 'r',
    },
  ];

  const activeStates = ref<Record<string, boolean>>({});

  const applyStyle = (command: string) => {
    document.execCommand(command, false);
    updateActiveState();
  };

  const isActive = (command: string): boolean => !!activeStates.value[command];

  const updateActiveState = () => {
    alignments.forEach((align) => {
      activeStates.value[align.command] = document.queryCommandState(
        align.command
      );
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey) {
      alignments.forEach((align) => {
        if (e.key.toLowerCase() === align.shortcut) {
          e.preventDefault();
          applyStyle(align.command);
        }
      });
    }
  };

  onMounted(() => {
    document.addEventListener('selectionchange', updateActiveState);
    document.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    document.removeEventListener('selectionchange', updateActiveState);
    document.removeEventListener('keydown', handleKeyDown);
  });
</script>
