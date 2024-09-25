<!-- NoteTitle.vue -->
<template>
  <div
    class="flex items-center mr-2 md:mr-4 px-2 py-1.5 card"
    :class="{
      'hover:bg-cream-200 dark:hover:bg-gray-600': !isEditingTitle,
    }"
  >
    <PhFile :size="20" class="size-5 flex-shrink-0" />
    <div class="relative ml-2 flex-grow">
      <div v-if="isEditingTitle && !isTrash">
        <input
          ref="titleInputRef"
          v-model="editedTitle"
          @keyup.enter="saveTitle"
          @blur="saveTitle"
          class="bg-transparent outline-none w-full min-w-[50px]"
          :style="{ width: `${titleWidth}px` }"
          @input="updateTitleWidth"
          :class="{
            'border-b border-gray-600': isEditingTitle,
          }"
        />
        <span
          ref="titleMeasure"
          class="invisible absolute top-0 left-0 whitespace-pre"
        >
          {{ editedTitle }}
        </span>
      </div>
      <h1
        v-else-if="!isEditingTitle && !isTrash"
        ref="titleRef"
        class="cursor-text truncate border-b border-transparent hover:border-b hover:border-gray-600"
        @click="editTitle"
      >
        {{ truncatedTitle }}
      </h1>
      <h1
        v-else
        ref="titleRef"
        class="cursor-text truncate border-b border-transparent"
      >
        {{ truncatedTitle }}
      </h1>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch, nextTick } from 'vue';
  import { PhFile } from '@phosphor-icons/vue';

  const props = defineProps<{
    title: string;
    isTrash: boolean;
  }>();

  const emit = defineEmits<{
    (e: 'updateTitle', title: string): void;
  }>();

  const titleRef = ref<HTMLElement | null>(null);
  const titleInputRef = ref<HTMLInputElement | null>(null);
  const titleMeasure = ref<HTMLElement | null>(null);
  const isEditingTitle = ref(false);
  const editedTitle = ref(props.title);
  const titleWidth = ref(0);

  const truncatedTitle = computed(() => {
    const maxLength = 35;
    if (props.title.length <= maxLength) return props.title;
    return props.title.slice(0, maxLength - 3) + '...';
  });

  const updateTitleWidth = () => {
    if (isEditingTitle.value && titleMeasure.value) {
      titleWidth.value = titleMeasure.value.offsetWidth;
    } else if (titleRef.value) {
      titleWidth.value = titleRef.value.offsetWidth;
    }
  };

  const editTitle = () => {
    if (!isEditingTitle.value) {
      isEditingTitle.value = true;
      editedTitle.value = props.title;

      nextTick(() => {
        titleInputRef.value?.focus();
        titleInputRef.value?.select();
      });
    }
  };

  const saveTitle = () => {
    isEditingTitle.value = false;
    if (editedTitle.value !== props.title) {
      emit('updateTitle', editedTitle.value);
    }
  };

  watch(
    () => props.title,
    (newTitle) => {
      editedTitle.value = newTitle;
      nextTick(() => updateTitleWidth());
    }
  );

  watch(
    () => isEditingTitle,
    (newValue) => {
      if (newValue) {
        nextTick(() => {
          updateTitleWidth();
        });
      }
    }
  );
</script>
