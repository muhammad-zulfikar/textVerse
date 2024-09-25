<template>
  <Modal :modelValue="isOpen" id="signIn">
    <div
      class="card w-11/12 md:w-[500px] h-[500px] font-serif px-10 py-8 relative flex flex-col mx-auto"
    >
      <Transition :name="transitionName" mode="out-in">
        <div :key="currentView">
          <h2 class="text-2xl font-bold mb-6 md:mb-8 flex justify-center">
            {{ viewTitle }}
          </h2>
          <form @submit.prevent="handleSubmit">
            <label for="email" class="block">Email</label>
            <div class="relative mb-4">
              <PhEnvelope
                class="absolute left-2 top-1/2 transform -translate-y-1/2"
              />
              <input
                type="email"
                id="email"
                placeholder="username@example.com"
                v-model="email"
                required
                class="flex w-full bg-transparent p-1 pl-8 border-b-[1px] border-gray-600 dark:border-gray-400 placeholder:text-gray-500 outline-none"
              />
            </div>

            <label for="password" class="block mb-1">Password</label>
            <div class="relative mb-4">
              <PhKey
                class="absolute left-2 top-1/2 transform -translate-y-1/2"
              />
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                placeholder="********"
                v-model="password"
                required
                class="w-full bg-transparent p-1 pl-8 pr-10 border-b-[1px] border-gray-600 dark:border-gray-400 placeholder:text-gray-500 outline-none"
              />
              <button
                type="button"
                @click="togglePasswordVisibility('password')"
                class="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <PhEye v-if="showPassword" />
                <PhEyeSlash v-else />
              </button>
            </div>

            <div v-if="currentView === 'signup'">
              <label for="confirmPassword" class="block mb-1">
                Confirm Password
              </label>
              <div class="relative mb-4">
                <PhKey
                  class="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
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
                  class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  <PhEye v-if="showConfirmPassword" />
                  <PhEyeSlash v-else />
                </button>
              </div>
            </div>

            <div class="flex justify-center">
              <Button
                type="submit"
                class="flex w-fit items-center justify-center px-4 py-2 mt-4"
                :disabled="isLoading"
              >
                <template v-if="!isLoading">
                  <PhSignIn
                    v-if="currentView === 'signin'"
                    :size="20"
                    class="mr-2"
                  />
                  <PhUserCirclePlus v-else :size="20" class="mr-2" />
                  {{ submitButtonText }}
                </template>
                <div v-else class="loading-dots py-2 px-4">
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </Button>
            </div>
          </form>

          <p v-if="currentView === 'signin'" class="text-center my-2">or</p>

          <div v-if="currentView === 'signin'">
            <Button
              @click="signInWithGoogle"
              class="w-fit py-2 px-4 flex items-center justify-center mb-8 md:mb-6 mx-auto"
              :disabled="isGoogleLoading"
            >
              <template v-if="!isGoogleLoading">
                <PhGoogleLogo :size="20" class="mr-2" />
                Sign in with Google
              </template>
              <div v-else class="loading-dots py-2 px-4">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </Button>
          </div>

          <p class="text-center mt-6 text-gray-500 dark:text-gray-400 text-sm">
            <button
              v-if="currentView === 'signin'"
              class="hover:underline font-bold text-[13px] mb-1"
              @click="openForgotPasswordInput"
            >
              Forgot password?
            </button>
            <br />
            {{
              currentView === 'signin'
                ? "Don't have an account?"
                : currentView === 'signup'
                  ? 'Already have an account?'
                  : ''
            }}
            <button
              class="hover:underline font-bold text-[13px]"
              @click="
                toggleView(currentView === 'signin' ? 'signup' : 'signin')
              "
            >
              {{ currentView === 'signin' ? 'Sign up' : 'Sign in' }}
            </button>
          </p>
        </div>
      </Transition>
    </div>
  </Modal>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { authStore, uiStore } from '@/store';
  import {
    PhEnvelope,
    PhKey,
    PhSignIn,
    PhUserCirclePlus,
    PhGoogleLogo,
    PhEye,
    PhEyeSlash,
  } from '@phosphor-icons/vue';
  import Modal from '@/components/ui/modal.vue';
  import Button from '@/components/ui/button.vue';

  const isOpen = computed(() => uiStore.activeModal === 'signIn');

  const router = useRouter();
  const email = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const currentView = ref('signin');
  const slideDirection = ref('right');
  const transitionName = computed(() => `slide-${slideDirection.value}`);
  const error = ref('');

  const isLoading = ref(false);
  const isGoogleLoading = ref(false);
  const showPassword = ref(false);
  const showConfirmPassword = ref(false);

  const viewTitle = computed(() => {
    switch (currentView.value) {
      case 'signin':
        return 'Sign in';
      case 'signup':
        return 'Sign up';
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
      default:
        return '';
    }
  });

  const handleSubmit = async () => {
    isLoading.value = true;
    error.value = '';
    try {
      switch (currentView.value) {
        case 'signin':
          try {
            await authStore.login(email.value, password.value);
            uiStore.setActiveModal(null);
            router.push('/');
          } catch (loginError) {
            if (loginError instanceof Error) {
              if (
                loginError.message.includes('user-not-found') ||
                loginError.message.includes('wrong-password')
              ) {
                error.value = 'Invalid email or password. Please try again.';
              } else {
                error.value = loginError.message;
              }
            } else {
              error.value = 'An error occurred during sign in.';
            }
          }
          break;
        case 'signup':
          if (password.value !== confirmPassword.value) {
            uiStore.showToastMessage('Passwords do not match');
            error.value = 'Passwords do not match';
            return;
          } else if (password.value.length < 8) {
            uiStore.showToastMessage('Password must be at least 8 characters');
            error.value = 'Password must be at least 8 characters';
            return;
          }
          uiStore.showToastMessage('Signing up...');
          await authStore.signUp(email.value, password.value);
          uiStore.setActiveModal(null);
          router.push('/');
          break;
      }
    } catch (err) {
      if (err instanceof Error) {
        error.value = err.message;
        uiStore.showToastMessage(err.message);
      } else {
        error.value = 'An unexpected error occurred';
        uiStore.showToastMessage('An unexpected error occurred');
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

  const openForgotPasswordInput = () => {
    uiStore.openInputModal({
      mode: 'email',
      cancel: () => {
        uiStore.setActiveModal('signIn');
      },
      confirm: async (email: string) => {
        try {
          await authStore.resetPassword(email);
          uiStore.showToastMessage(
            'Password reset email sent. Please check your inbox.'
          );
        } catch (error) {
          uiStore.showToastMessage('Failed to send password reset email');
        }
      },
    });
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      showPassword.value = !showPassword.value;
    } else {
      showConfirmPassword.value = !showConfirmPassword.value;
    }
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
