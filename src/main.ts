import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import 'tailwindcss/tailwind.css';
import './style.css';
import Toast, { PluginOptions } from "vue-toastification";

const options: PluginOptions = {
    closeOnClick: true,
    draggable: true,
    timeout: 5000,
    closeButton: false,
    icon: false,
};

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Toast, options, { timeout: 2000 });
app.mount('#app');