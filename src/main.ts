import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import 'tailwindcss/tailwind.css';
import Toast, { POSITION, PluginOptions } from 'vue-toastification'
// Import the CSS or use your own!
import "vue-toastification/dist/index.css";

const app = createApp(App);
const pinia = createPinia();
const options: PluginOptions = {
    position: POSITION.BOTTOM_RIGHT,
    timeout: 3000,
  };

app.use(pinia);
app.use(router);
app.use(Toast, options)
app.mount('#app');
