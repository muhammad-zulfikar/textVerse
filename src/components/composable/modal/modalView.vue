<template>
  <AlertModal />
  <InputModal />
  <SignInModal />
  <Sidebar />
  <ImageViewerModal />
  <ImagePickerModal />
</template>

<script lang="ts" setup>
  import { defineAsyncComponent } from 'vue';

  const AlertModal = defineAsyncComponent(
    () => import('@/components/composable/modal/alertModal.vue')
  );

  const InputModal = defineAsyncComponent(
    () => import('@/components/composable/modal/inputModal.vue')
  );

  const SignInModal = defineAsyncComponent(
    () => import('@/components/composable/modal/signInModal.vue')
  );

  const Sidebar = defineAsyncComponent(
    () => import('@/components/composable/modal/sidebar.vue')
  );

  const ImageViewerModal = defineAsyncComponent(
    () => import('@/components/composable/modal/imageViewerModal.vue')
  );

  const ImagePickerModal = defineAsyncComponent(
    () => import('@/components/composable/modal/imagePickerModal.vue')
  );
</script>
