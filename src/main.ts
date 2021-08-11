import { createApp } from 'vue';
import App from './App.vue';

import router from './router/index';
import store from './store/index';
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import { create, NPopover } from 'naive-ui';

const naive = create({
	components: [NPopover]
});

const app = createApp(App);
app.use(router).use(store).use(ElementPlus).use(naive).mount('#app');
