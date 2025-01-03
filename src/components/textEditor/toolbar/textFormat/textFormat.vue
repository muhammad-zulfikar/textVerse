<template>
  <div class="flex space-x-1">
    <button
      v-for="format in formats"
      :key="format.command"
      @click="applyStyle(format.command)"
      :class="{ active: isActive(format.command) }"
      :title="format.title"
    >
      <component :is="format.icon" :size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted } from 'vue';
  import {
    PhTextB,
    PhTextItalic,
    PhTextUnderline,
    PhTextStrikethrough,
  } from '@phosphor-icons/vue';

  interface Format {
    command: string;
    title: string;
    icon: any;
    shortcut?: string;
  }

  const formats: Format[] = [
    {
      command: 'bold',
      title: 'Bold',
      icon: PhTextB,
      shortcut: 'b',
    },
    {
      command: 'italic',
      title: 'Italic',
      icon: PhTextItalic,
      shortcut: 'i',
    },
    {
      command: 'underline',
      title: 'Underline',
      icon: PhTextUnderline,
      shortcut: 'u',
    },
    {
      command: 'strikethrough',
      title: 'Strikethrough',
      icon: PhTextStrikethrough,
    },
  ];

  const activeStates = ref<Record<string, boolean>>({});

  const applyStyle = (command: string) => {
    document.execCommand(command, false);
    updateActiveState();
  };

  const isActive = (command: string): boolean => !!activeStates.value[command];

  const updateActiveState = () => {
    formats.forEach((format) => {
      activeStates.value[format.command] = document.queryCommandState(
        format.command
      );
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey) {
      formats.forEach((format) => {
        if (format.shortcut && e.key.toLowerCase() === format.shortcut) {
          e.preventDefault();
          applyStyle(format.command);
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
