<template>
  <Modal :modelValue="isOpen" :id="id">
    <div
      class="card w-11/12 md:w-[500px] h-[440px] md:h-[480px] font-serif px-10 py-8 relative flex flex-col mx-auto"
    >
      <transition :name="transitionName" mode="out-in">
        <div
          :key="currentView"
          :class="{
            'flex flex-col items-center justify-center':
              currentView === 'forgotPassword',
          }"
        >
          <h2 class="text-2xl font-bold mb-6 md:mb-8 flex justify-center">
            {{ viewTitle }}
          </h2>
          <form
            @submit.prevent="handleSubmit"
            :class="{ 'w-full': currentView === 'forgotPassword' }"
          >
            <div
              :class="{
                'flex justify-center mt-[5rem]':
                  currentView === 'forgotPassword',
              }"
            >
              <div
                :class="{ 'w-full md:w-3/4': currentView === 'forgotPassword' }"
              >
                <label for="email" class="block">Email</label>
                <input
                  type="email"
                  id="email"
                  v-model="email"
                  required
                  class="flex w-full bg-transparent p-1 border-0 border-b-[1px] border-black dark:border-gray-400 outline-none mb-4"
                />
              </div>
            </div>
            <div v-if="currentView !== 'forgotPassword'">
              <label for="password" class="block mb-1">Password</label>
              <input
                type="password"
                id="password"
                v-model="password"
                required
                class="w-full bg-transparent p-1 border-0 border-b-[1px] border-black dark:border-gray-400 outline-none mb-4"
              />
            </div>
            <div v-if="currentView === 'signup'">
              <label for="confirmPassword" class="block mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                v-model="confirmPassword"
                required
                class="w-full mb-4 bg-transparent p-1 border-0 border-b-[1px] border-black dark:border-white outline-none"
              />
            </div>
            <div class="flex justify-center space-x-4">
              <button
                v-if="currentView === 'forgotPassword' && !fromUserSettings"
                type="button"
                @click="goBack"
                class="px-4 py-2 mt-4 card"
              >
                Back
              </button>
              <button
                type="submit"
                class="flex w-fit items-center justify-center px-4 py-2 mt-4 card"
                :disabled="isLoading"
              >
                <template v-if="!isLoading">
                  {{ submitButtonText }}
                </template>
                <div v-else class="loading-dots py-2 px-4">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </button>
            </div>
          </form>
          <p v-if="currentView === 'signin'" class="text-center my-2">or</p>
          <div v-if="currentView === 'signin'">
            <button
              @click="signInWithGoogle"
              class="w-fit card text-gray-700 dark:text-white py-2 px-4 rounded flex items-center justify-center mb-6 mx-auto"
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
          <p
            v-if="!fromUserSettings"
            class="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm"
          >
            <button
              v-if="currentView === 'signin'"
              class="hover:underline font-bold text-[13px]"
              @click="toggleView('forgotPassword')"
            >
              Forgot Password?
            </button>
            <br v-if="currentView !== 'forgotPassword'" />
            {{
              currentView === 'signin'
                ? "Don't have an account?"
                : currentView === 'signup'
                  ? 'Already have an account?'
                  : ''
            }}
            <button
              v-if="currentView !== 'forgotPassword'"
              class="hover:underline font-bold text-[13px]"
              @click="
                toggleView(currentView === 'signin' ? 'signup' : 'signin')
              "
            >
              {{ currentView === 'signin' ? 'Sign up' : 'Sign in' }}
            </button>
          </p>
        </div>
      </transition>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { authStore, uiStore } from '@/store';
  import Modal from '@/components/ui/modal.vue';

  const props = defineProps<{
    id: string;
    fromUserSettings?: boolean;
  }>();

  const isOpen = computed(() => uiStore.activeModal === props.id);

  const router = useRouter();
  const email = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const currentView = ref(props.fromUserSettings ? 'forgotPassword' : 'signin');
  const slideDirection = ref('right');
  const transitionName = computed(() => `slide-${slideDirection.value}`);
  const error = ref('');

  const isLoading = ref(false);
  const isGoogleLoading = ref(false);

  const viewTitle = computed(() => {
    switch (currentView.value) {
      case 'signin':
        return 'Sign in';
      case 'signup':
        return 'Sign up';
      case 'forgotPassword':
        return 'Reset Password';
      default:
        return '';
    }
  });

  const submitButtonText = computed(() => {
    switch (currentView.value) {
      case 'signin':
        return 'Sign in';
      case 'signup':
        return 'Sign up';
      case 'forgotPassword':
        return 'Send Reset Email';
      default:
        return '';
    }
  });

  const handleSubmit = async () => {
    isLoading.value = true;
    try {
      switch (currentView.value) {
        case 'signin':
          await authStore.login(email.value, password.value);
          router.push('/');
          break;
        case 'signup':
          if (password.value !== confirmPassword.value) {
            uiStore.showToastMessage('Passwords do not match');
            return;
          }
          await authStore.signUp(email.value, password.value);
          router.push('/');
          break;
        case 'forgotPassword':
          await authStore.resetPassword(email.value);
          uiStore.showToastMessage(
            'Password reset email sent. Please check your inbox.'
          );
          if (!props.fromUserSettings) {
            toggleView('signin');
          }
          break;
      }
    } catch (err) {
      if (err instanceof Error) {
        uiStore.showToastMessage(err.message);
      } else {
        uiStore.showToastMessage('An error occurred');
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

  const toggleView = (newView: string) => {
    slideDirection.value = newView === 'signin' ? 'right' : 'left';
    currentView.value = newView;
    error.value = '';
  };

  const goBack = () => {
    toggleView('signin');
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
