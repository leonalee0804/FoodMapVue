import { createApp, onMounted } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import VueApexCharts from 'vue3-apexcharts';// 報表樣式
import vSelect from "vue-select";
import AOS from 'aos';  // 標籤列動畫
import vue3GoogleLogin from 'vue3-google-login';
import ChatBot from '@/components/ChatBot.vue'




// ----------------------
// Google 登入設定
// ----------------------
const GoogleLoginOptions = {
    clientId: '155562336859-rq8homtfrs5qf9bpr1dljodf9m8o1ka4.apps.googleusercontent.com'
};


// ----------------------
// 全域 CSS
// ----------------------
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "vue-select/dist/vue-select.css";




// import './assets/css/loader.css';
import './assets/css/header.css';
import './assets/css/login.css';
import './assets/css/register.css';
// import './assets/css/main.css';
import './assets/css/member-profile.css';
import './assets/css/tooplate-mini-finance.css';
import './assets/css/footer.css';

// -------標籤列動畫---------------
import 'aos/dist/aos.css';
AOS.init({
    duration: 600,
    easing: 'ease-out',
    once: true
});
// -------------------------------



// // ----------------------
// // 全域 JS
// // ----------------------

// import "bootstrap/dist/js/bootstrap.bundle.min.js";


// // ----------------------
// // SweetAlert2
// // ----------------------
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";




const app = createApp(App);
app.use(createPinia());

app.use(router);
app.use(VueApexCharts);
app.component("v-select", vSelect);
app.use(vue3GoogleLogin, GoogleLoginOptions); // Google 登入插件註冊
app.component('ChatBot', ChatBot)


app.mount('#app');
