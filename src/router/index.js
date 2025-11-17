import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import SearchResultView from "@/views/SearchResultView.vue";
import Login from '../views/LoginRegister.vue';
import Register from '../views/Register.vue';
import ProtectedPage from '../views/ProtectedPage.vue';
import { useUserStore } from '../stores/user';

import MemberHome from "@/views/member/memberHome.vue";
import MemberProfile from "@/views/member/profile.vue";
import MemberFavorite from "@/views/member/favorite.vue";
import OrderDetail from "@/views/member/orderHistory.vue";
import ReservationPage from "@/views/member/reservationPage.vue";
import ReservationRecords from '@/views/member/reservationRecords.vue';
import RsCapabilities from "@/views/vendor/rsCapabilities.vue";
import lookHistory from '@/views/member/lookHistory.vue';

import AdminHome from '@/views/admin/adminHome.vue';
import AdminAccounts from '@/views/admin/adminAccounts.vue';
import AccountStatus from '@/views/admin/accountStatsChart.vue';
import BlackList from '@/views/admin/blackList.vue';
import Cart from '@/views/shopping/Cart.vue';
import CheckoutPage from '@/views/shopping/CheckoutPage.vue';
import OrderResult from '@/views/shopping/OrderResult.vue';
import OrderHistory from '@/views/shopping/OrderHistory.vue';



// 客服
import CustomerServices from '@/views/customerservice/CustomerServices.vue';
import CustomerServiceRecord from '@/views/customerservice/CustomerServiceRecord.vue';
import CustomerServiceManager from '@/views/customerservice/CustomerServiceManager.vue';

// 廠商頁面
import VendorPage from '@/views/vendor/VendorPage.vue';

// 會員評論紀錄
import CommentRecord from '@/views/customerservice/CommentRecord.vue';

// 廣告頁面
import ADPage from '@/views/AD/ADPage.vue';
import ADevent from '@/views/AD/ADevent.vue';

// 廠商頁面
import VendorsList from '@/views/vendor/vendorsList.vue';
import vendorHome from '@/views/vendor/vendorHome.vue';
import VendorInfo from '@/views/vendor/info.vue';
import VendorDetails from '@/views/vendor/details.vue';
import VendorMenu from '@/views/vendor/menu.vue';
import VendorReports from '@/views/vendor/report.vue';
import VendorOrders from '@/views/vendor/orders.vue';
import AdminProductReview from '@/views/admin/adminProductReview.vue';
import VendorComment from '@/views/vendor/vendorComment.vue';

const routes = [
    { path: '/cart', component: Cart },
    { path: '/checkoutPage', component: CheckoutPage },
    { path: '/orderresult', component: OrderResult },

    {
        path: '/search',
        name: 'SearchPage',
        component: SearchResultView
    },
    { path: '/', component: Home },
    { path: '/search', name: 'SearchPage', component: SearchResultView },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    // 動態廠商詳細頁面
    { path: '/vendor/:vendorId', name: 'VendorPage', component: VendorPage },

    // 會員頁面
    { path: "/member/memberHome", component: MemberHome, meta: { requiresAuth: true } },
    { path: "/member/profile", component: MemberProfile, meta: { requiresAuth: true } },
    { path: "/member/favorite", component: MemberFavorite, meta: { requiresAuth: true } },
    { path: "/member/lookHistory", component: lookHistory, meta: { requiresAuth: true } },
    { path: "/member/orderHistory", component: OrderHistory, meta: { requiresAuth: true } },
    { path: "/member/commentRecord", component: CommentRecord, meta: { requiresAuth: true } },
    // { path: "/commentRecord", component: CommentRecord },
    // 廠商頁面
    { path: "/vendor/vendorsList", component: VendorsList, meta: { requiresAuth: true } },
    {
        path: '/vendor/vendorHome',
        component: vendorHome,
        meta: { requiresAuth: true },
        children: [
            { path: 'report', component: VendorReports },
            { path: 'info', component: VendorInfo },
            { path: 'details', component: VendorDetails },
            { path: 'menu', component: VendorMenu },
            { path: 'orders', component: VendorOrders },
            { path: 'adpage', component: ADPage },
            {path: 'vendorComment',component: VendorComment},
            { path: '', redirect: '/vendor/vendorHome/report' }
        ]
    },
    { path: '/vendor/vendorPage', component: VendorPage },


    // 訂位系統
    { path: "/vendor/rs-capabilities", component: RsCapabilities },
    { path: "/reservation/:vendorId", component: ReservationPage },
    { path: '/reservationrecords', component: ReservationRecords },

    // 管理員頁面
    { path: "/admin/adminHome", component: AdminHome, meta: { requiresAuth: true } },
    { path: "/admin/adminAccounts", component: AdminAccounts, meta: { requiresAuth: true } },
    { path: "/admin/accountStatsChart", component: AccountStatus, meta: { requiresAuth: true } },
    { path: "/admin/blackList", component: BlackList, meta: { requiresAuth: true } },
    { path: "/admin/customerServiceManager", component: CustomerServiceManager },


    // 客服頁面
    { path: "/customerServices", component: CustomerServices },
    { path: "/customerServiceRecord", component: CustomerServiceRecord, meta: { requiresAuth: true } },

    // 廣告頁面
    { path: '/adevent', component: ADevent },


    { path: "/admin/adminProductReview", component: AdminProductReview, meta: { requiresAuth: true } },
    // 其他受保護頁面
    { path: '/protected', component: ProtectedPage, meta: { requiresAuth: true } },

    // 動態載入頁面
    {
        path: '/verify',
        name: 'VerifyResult',
        component: () => import('@/views/VerifyResult.vue')
    },
    {
        path: "/forgot-password",
        name: "ForgotPassword",
        component: () => import("@/views/ForgotPassword.vue"),
    },
    {
        path: "/reset-password",
        name: "ResetPassword",
        component: () => import("@/views/ResetPassword.vue"),
    },

    {
        path: '/order/history',
        name: 'OrderHistory',
        component: () => import('@/views/shopping/OrderHistory.vue')
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition; // 回上一頁時，保留原滾動位置
        } else {
            return { top: 0, behavior: "smooth" }; // 新頁面自動滑到頂端
        }
    }
});

// 全域路由守衛
import axios from "axios";
router.beforeEach(async (to, from, next) => {
    const userStore = useUserStore();

    if (!userStore.isLoggedIn) {
        try {
            const res = await axios.get("/api/currentUser", { withCredentials: true });
            if (res.data && res.data.user) {
                userStore.user = res.data.user;
                userStore.isLoggedIn = true;

            }
        } catch (err) {

            userStore.user = null;
            userStore.isLoggedIn = false;
        }
    }


    if (to.meta.requiresAuth && !userStore.isLoggedIn) {
        console.log("未登入，導向 /login");
        return next("/login");
    }

    next();
});





export default router;