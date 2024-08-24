import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { initializeStores, authStore } from './store/stores';
import 'tailwindcss/tailwind.css';
import './style/style.css';
import 'quill/dist/quill.snow.css';
import './firebase';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
initializeStores();

// Mount the app immediately
app.mount('#app');

// Initialize auth store after mounting
authStore.initialize();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}

function loadGoogleAPI() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

loadGoogleAPI().catch((error) => {
  console.error('Failed to load Google API:', error);
});