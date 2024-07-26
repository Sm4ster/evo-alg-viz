import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import _ from 'lodash';
import katex from 'katex';

window.katex = katex

const app = createApp(App)
app.config.globalProperties.$_ = _;
app.config.globalProperties.katex = katex;
app.mount('#app');
