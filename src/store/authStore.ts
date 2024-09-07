// authStore

import { defineStore } from 'pinia';
import {
  ref as storageRef,
  uploadString,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { auth, storage } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  onAuthStateChanged,
  User,
  updateProfile,
  deleteUser,
  signInWithPopup,
} from 'firebase/auth';
import { uiStore, notesStore, folderStore } from '@/store/stores';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    avatarUrl: '' as string,
    isLoading: true,
    isInitialized: false,
  }),
  actions: {
    async initializeAuth() {
      return new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          this.user = user;
          this.avatarUrl = user?.photoURL || '/avatar.png';

          this.isInitialized = true;
          unsubscribe();
          resolve();
        });
        this.isLoading = false;
      });
    },

    async login(email: string, password: string) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        this.user = userCredential.user;
        this.avatarUrl = this.user.photoURL || '';
        uiStore.showToastMessage('Signed in successfully');
      } catch (error) {
        uiStore.showToastMessage(
          'Sign in failed. Please check your credentials.'
        );
        throw error;
      } finally {
        this.isLoading = false;
      }
      await folderStore.loadFolders();
      await uiStore.loadSettings();
      await notesStore.loadNotes();
    },

    async signUp(email: string, password: string) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        this.user = userCredential.user;
        this.avatarUrl = this.user.photoURL || '';
        uiStore.showToastMessage('Account successfully created');
      } catch (error) {
        uiStore.showToastMessage('Sign up failed. Please try again.');
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      try {
        folderStore.clearFolderListener();
        uiStore.clearSettingsListener();
        uiStore.clearLocalSettings();

        await signOut(auth);

        this.user = null;
        this.avatarUrl = '';

        await folderStore.loadFoldersFromLocalStorage();

        uiStore.showToastMessage('Signed out successfully');
      } catch (error) {
        uiStore.showToastMessage('Sign out failed. Please try again.');
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      this.user = userCredential.user;
      this.avatarUrl = this.user.photoURL || '';
    },

    async signInWithGitHub() {
      const provider = new GithubAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      this.user = userCredential.user;
      this.avatarUrl = this.user.photoURL || '';
    },

    async updateAvatar(newAvatarUrl: string) {
      if (this.user) {
        try {
          const imageRef = storageRef(
            storage,
            `users/${this.user.uid}/avatars`
          );

          if (newAvatarUrl === '/icons/avatar.png') {
            try {
              await deleteObject(imageRef);
            } catch (error) {}

            await updateProfile(this.user, { photoURL: null });
            this.avatarUrl = '/icons/avatar.png';
          } else {
            await uploadString(imageRef, newAvatarUrl, 'data_url');
            const downloadURL = await getDownloadURL(imageRef);
            await updateProfile(this.user, { photoURL: downloadURL });
            this.avatarUrl = downloadURL;
          }
        } catch (error) {
          throw error;
        }
      }
    },

    async updateName(newName: string) {
      if (this.user) {
        try {
          await updateProfile(this.user, { displayName: newName });
        } catch (error) {
          throw error;
        }
      }
    },

    async deleteAccount() {
      if (this.user) {
        try {
          await deleteUser(this.user);
          this.user = null;
          this.avatarUrl = '';
        } catch (error) {
          throw error;
        }
      }
    },
  },
  getters: {
    isLoggedIn: (state) => !!state.user,
  },
});
