<template>
  <div class="flex justify-center items-center h-full font-serif px-4">
    <div class="card w-11/12 md:w-[500px] px-10 py-8 relative flex flex-col">
      <h2 class="text-2xl font-bold mb-6 md:mb-8 flex justify-center">
        Reset Password
      </h2>
      <form @submit.prevent="handleResetPassword">
        <label for="email" class="block">Email</label>
        <div class="relative mb-4">
          <PhEnvelope
            class="absolute left-2 top-1/2 transform -translate-y-1/2"
          />
          <input
            type="email"
            id="email"
            v-model="email"
            readonly
            class="flex w-full bg-transparent p-1 pl-8 border-b-[1px] border-gray-600 dark:border-gray-400 outline-none opacity-50"
          />
        </div>

        <label for="newPassword" class="block mb-1">New Password</label>
        <div class="relative mb-4">
          <PhKey class="absolute left-2 top-1/2 transform -translate-y-1/2" />
          <input
            :type="showNewPassword ? 'text' : 'password'"
            id="newPassword"
            placeholder="********"
            v-model="newPassword"
            required
            class="w-full bg-transparent p-1 pl-8 pr-10 border-b-[1px] border-gray-600 dark:border-gray-400 placeholder:text-gray-500 outline-none"
          />
          <button
            type="button"
            @click="togglePasswordVisibility('newPassword')"
            class="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <PhEye v-if="showNewPassword" />
            <PhEyeSlash v-else />
          </button>
        </div>

        <label for="confirmPassword" class="block mb-1">Confirm Password</label>
        <div class="relative mb-4">
          <PhKey class="absolute left-2 top-1/2 transform -translate-y-1/2" />
          <input
            :type="showConfirmPassword ? 'text' : 'password'"
            id="confirmPassword"
            placeholder="********"
            v-model="confirmPassword"
            required
            class="w-full bg-transparent p-1 pl-8 pr-10 border-b-[1px] border-gray-600 dark:border-gray-400 placeholder:text-gray-500 outline-none"
          />
          <button
            type="button"
            @click="togglePasswordVisibility('confirmPassword')"
            class="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <PhEye v-if="showConfirmPassword" />
            <PhEyeSlash v-else />
          </button>
        </div>

        <div class="flex justify-center">
          <Button
            type="submit"
            class="flex w-fit items-center justify-center px-4 py-2 mt-4"
            :disabled="isLoading"
          >
            <template v-if="!isLoading">
              <PhKey :size="20" class="mr-2" />
              Reset Password
            </template>
            <div v-else class="loading-dots py-2 px-4">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
  import { auth } from '@/firebase';
  import { uiStore } from '@/store';
  import { PhEnvelope, PhKey, PhEye, PhEyeSlash } from '@phosphor-icons/vue';
  import Button from '@/components/ui/button.vue';

  const route = useRoute();
  const router = useRouter();

  const email = ref('');
  const newPassword = ref('');
  const confirmPassword = ref('');
  const isLoading = ref(false);
  const showNewPassword = ref(false);
  const showConfirmPassword = ref(false);
  const oobCode = ref('');

  onMounted(async () => {
    oobCode.value = (route.query.oobCode as string) || '';

    if (!oobCode.value) {
      uiStore.showToastMessage('Invalid password reset link');
      router.push('/');
      return;
    }

    try {
      const emailFromCode = await verifyPasswordResetCode(auth, oobCode.value);
      email.value = emailFromCode;
    } catch (error) {
      uiStore.showToastMessage('Invalid or expired password reset link');
      router.push('/');
    }
  });

  const handleResetPassword = async () => {
    if (newPassword.value !== confirmPassword.value) {
      uiStore.showToastMessage('Passwords do not match');
      return;
    }

    if (newPassword.value.length < 8) {
      uiStore.showToastMessage('Password must be at least 8 characters');
      return;
    }

    isLoading.value = true;
    try {
      await confirmPasswordReset(auth, oobCode.value, newPassword.value);
      uiStore.showToastMessage('Password reset successful');
      router.push('/');
      uiStore.setActiveModal('signIn');
    } catch (error) {
      if (error instanceof Error) {
        uiStore.showToastMessage(error.message);
      } else {
        uiStore.showToastMessage('Failed to reset password. Please try again.');
      }
    } finally {
      isLoading.value = false;
    }
  };

  const togglePasswordVisibility = (
    field: 'newPassword' | 'confirmPassword'
  ) => {
    if (field === 'newPassword') {
      showNewPassword.value = !showNewPassword.value;
    } else {
      showConfirmPassword.value = !showConfirmPassword.value;
    }
  };
</script>

<style scoped>
  .loading-dots {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .loading-dots div {
    width: 0.5rem;
    height: 0.5rem;
    margin: 0 0.2rem;
    background-color: currentColor;
    border-radius: 50%;
    animation: 0.9s bounce infinite alternate;
  }

  .loading-dots div:nth-child(2) {
    animation-delay: 0.3s;
  }

  .loading-dots div:nth-child(3) {
    animation-delay: 0.6s;
  }

  @keyframes bounce {
    to {
      opacity: 0.3;
      transform: translate3d(0, -0.25rem, 0);
    }
  }
</style>
