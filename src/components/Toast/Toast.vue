<template>
  <transition name="fade">
    <div v-if="visible" class="toast">
      {{ message }}
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';

interface Props {
  message: string;
}

const props = defineProps<Props>();

const visible = ref(false);

onMounted(() => {
  visible.value = true;
  setTimeout(() => {
    visible.value = false;
  }, 3000);
});

watch(() => props.message, (newMessage) => {
  if (newMessage) {
    visible.value = true;
    setTimeout(() => {
      visible.value = false;
    }, 3000);
  }
});
</script>

<style scoped>
.toast {
  position: fixed;
  z-index: 51;
  bottom: 1rem;
  right: 1rem;
  background-color: #FFC107;
  border: 2px solid black;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  outline: none;
  font-size: 14px;
  font-family: serif;
}
</style>
