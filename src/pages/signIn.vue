<template>
  <div
    class="fixed inset-0 flex items-center justify-center px-8 md:px-0 md:pt-12"
  >
    <div
      class="font-serif custom-card px-10 py-8 md:p-8 relative flex flex-col mx-auto max-w-md w-full"
    >
      <transition :name="transitionName" mode="out-in">
        <div :key="isSignUp ? 'signup' : 'signin'">
          <h2 class="text-2xl font-bold mb-4 flex justify-center">
            {{ isSignUp ? 'Sign up' : 'Sign in' }}
          </h2>
          <form @submit.prevent="isSignUp ? handleSignUp() : handleLogin()">
            <div>
              <label for="email" class="block">Email</label>
              <input
                type="email"
                id="email"
                v-model="email"
                required
                class="w-full bg-transparent p-1 border-0 border-b-[1px] border-black dark:border-gray-400 outline-none mb-4"
              />
            </div>
            <div>
              <label for="password" class="block mb-1">Password</label>
              <input
                type="password"
                id="password"
                v-model="password"
                required
                class="w-full bg-transparent p-1 border-0 border-b-[1px] border-black dark:border-gray-400 outline-none mb-4"
              />
            </div>
            <div v-if="isSignUp">
              <label for="confirmPassword" class="block mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                required
                class="w-full mb-4 bg-transparent p-1 border-0 border-b-[1px] md:border-b-2 border-black dark:border-white outline-none"
              />
            </div>
            <button
              type="submit"
              class="flex w-full md:w-28 items-center justify-center px-4 py-2 mt-4 mx-auto custom-card"
              :disabled="isLoading"
            >
              <template v-if="!isLoading">
                {{ isSignUp ? 'Sign up' : 'Sign in' }}
              </template>
              <div v-else class="loading-dots py-2 px-4">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </button>
          </form>
          <p v-if="!isSignUp" class="text-center my-2">or</p>
          <div v-if="!isSignUp">
            <button
              @click="signInWithGoogle"
              class="w-full md:w-fit custom-card text-gray-700 dark:text-white py-2 px-4 rounded flex items-center justify-center mb-6 mx-auto"
              :disabled="isGoogleLoading"
            >
              <template v-if="!isGoogleLoading">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google logo"
                  class="w-5 h-5 mr-2"
                />
                Sign in with Google
              </template>
              <div v-else class="loading-dots py-2 px-4">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </button>
          </div>
          <p v-if="error" class="text-red-500 mt-4 text-center">{{ error }}</p>
          <p class="text-center mt-5 text-gray-500 dark:text-gray-400 text-sm">
            {{
              isSignUp ? 'Already have an account?' : "Don't have an account?"
            }}
            <button
              class="hover:underline font-bold text-[13px]"
              @click="toggleForm"
            >
              {{ isSignUp ? 'Sign in' : 'Sign up' }}
            </button>
            <br />
            or&nbsp;
            <button
              class="hover:underline font-bold text-[13px]"
              @click="continueWithoutAccount"
            >
              continue without an account
            </button>
          </p>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { authStore, uiStore } from '@/utils/stores';

  const router = useRouter();

  const email = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const isSignUp = ref(false);
  const slideDirection = ref('right');
  const transitionName = computed(() => `slide-${slideDirection.value}`);
  const error = ref('');

  const isLoading = ref(false);
  const isGoogleLoading = ref(false);

  const handleLogin = async () => {
    isLoading.value = true;
    try {
      await authStore.login(email.value, password.value);
      router.push('/');
    } catch (err) {
      uiStore.showToastMessage('Invalid email or password');
    } finally {
      isLoading.value = false;
    }
  };

  const handleSignUp = async () => {
    if (password.value !== confirmPassword.value) {
      uiStore.showToastMessage('Passwords do not match');
      return;
    }
    isLoading.value = true;
    try {
      await authStore.signUp(email.value, password.value);
      router.push('/');
    } catch (err) {
      if (err instanceof Error) {
        uiStore.showToastMessage(err.message);
      } else {
        uiStore.showToastMessage('Invalid email or password');
      }
    } finally {
      isLoading.value = false;
    }
  };

  const signInWithGoogle = async () => {
    isGoogleLoading.value = true;
    try {
      await authStore.signInWithGoogle();
      if (authStore.isLoggedIn) {
        uiStore.showToastMessage(
          'Google sign-in successful, navigating to home'
        );
        router.push('/');
      }
    } catch (err) {
      uiStore.showToastMessage('Google sign-in failed');
    } finally {
      isGoogleLoading.value = false;
    }
  };

  const continueWithoutAccount = () => {
    router.push('/');
  };

  const toggleForm = () => {
    slideDirection.value = isSignUp.value ? 'right' : 'left';
    isSignUp.value = !isSignUp.value;
    error.value = '';
  };
</script>

<style scoped>
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: all 0.3s ease-out;
  }

  .slide-left-enter-from {
    opacity: 0;
    transform: translateX(15px);
  }

  .slide-left-leave-to {
    opacity: 0;
    transform: translateX(-15px);
  }

  .slide-right-enter-from {
    opacity: 0;
    transform: translateX(-15px);
  }

  .slide-right-leave-to {
    opacity: 0;
    transform: translateX(15px);
  }

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
