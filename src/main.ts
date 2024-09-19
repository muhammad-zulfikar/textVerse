import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { initializeStores } from './store';
import 'tailwindcss/tailwind.css';
import './style/style.css';
import './style/textEditor.css';
import './firebase';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
initializeStores();

app.mount('#app');

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
