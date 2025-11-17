<template>


  <div class="OrderHistory-wrapper">
    <!-- 使用獨立的 Sidebar 組件 -->
    <MemberSidebar @logout="logout" />
    <div class="order-history-page">
        <h2>📦 歷史訂單</h2>
        <hr>

        <!-- 載入中 -->
        <div v-if="isLoading" class="loading-state">
            <div class="spinner-small"></div>
            <p>正在載入您的訂單記錄...</p>
        </div>

        <!-- 沒有訂單 -->
        <div v-else-if="orders.length === 0" class="no-orders">
            <p>您目前沒有任何歷史訂單記錄。</p>
            <router-link to="/" class="btn btn-primary">前往購物</router-link>
        </div>

        <!-- 訂單列表 -->
        <div v-else class="order-list">
            <!-- 使用 OrderListItem 組件顯示每筆訂單 -->
            <OrderListItem v-for="order in orders" :key="order.orderNo" :order="order" />

            <!-- 分頁控制 -->
            <div class="pagination-controls" v-if="totalPages > 1">
                <button @click="changePage(currentPage - 1)" :disabled="currentPage === 0" class="btn-page">
                    上一頁
                </button>

                <span class="page-info">
                    頁碼 {{ currentPage + 1 }} / {{ totalPages }}
                </span>

                <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages - 1"
                    class="btn-page">
                    下一頁
                </button>
            </div>
        </div>
    </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import OrderListItem from '@/components/order/OrderListItem.vue';
import MemberSidebar from "@/components/member/memberSidebar.vue";

const router = useRouter();
const route = useRoute();
const orders = ref([]);
const isLoading = ref(true);
const currentPage = ref(0);
const totalPages = ref(0);
const API_BASE = 'http://localhost:8082';

// 獲取訂單歷史
const fetchOrderHistory = async (page = 0, size = 10) => {
    isLoading.value = true;
    try {
        const response = await axios.get(`${API_BASE}/api/order/history`, {
            params: { page, size },
            withCredentials: true
        });

        orders.value = response.data.content || [];
        currentPage.value = response.data.number || 0;
        totalPages.value = response.data.totalPages || 0;
        console.log('歷史訂單資料:', response.data);
        console.log('當前頁碼:', currentPage.value);
        console.log('總頁數:', totalPages.value);
    } catch (error) {
        console.error('獲取歷史訂單失敗:', error);

        const status = error.response ? error.response.status : null;
        if (status === 401 || status === 403) {
            alert('請先登入以查看歷史訂單！');
            router.push({ path: '/login', query: { redirect: route.fullPath } });
            return;
        }

        orders.value = [];
    } finally {
        isLoading.value = false;
    }
};

// 分頁切換
const changePage = (newPage) => {
    if (newPage >= 0 && newPage < totalPages.value) {
        currentPage.value = newPage;
        fetchOrderHistory(currentPage.value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

onMounted(() => {
    fetchOrderHistory(currentPage.value);
});
</script>

<style scoped>

.OrderHistory-wrapper {
  display: flex;
  min-height: 100vh;
  padding-bottom: 100px; /* 留出 footer 高度空間 */
}

/* 響應式調整 */
@media (max-width: 768px) {
  .OrderHistory {
    margin-left: 0;
  }
}

:root {
    --primary-color: #8b4513;
    --secondary-color: #f4a460;
    --text-dark: #3a2a1a;
}

.order-history-page {
    max-width: 1000px;
   min-height: 300px; /* 保持最小高度 */
   height: auto; /* 讓內容自動撐開 */
    margin: 40px auto; /* auto 讓區塊水平置中 */
    padding: 40px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
    font-family: 'Microsoft JhengHei', sans-serif;
}

.order-history-page h2 {
    color: var(--primary-color, #8b4513);
    margin-bottom: 5px;
}

hr {
    border: none;
    border-top: 3px solid var(--secondary-color, #f4a460);
    margin-bottom: 30px;
}

/* 載入狀態 */
.loading-state,
.no-orders {
    text-align: center;
    padding: 50px;
}

.spinner-small {
    border: 3px solid #f3f3f3;
    border-top: 3px solid var(--primary-color, #8b4513);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg)
    }

    100% {
        transform: rotate(360deg)
    }
}

.btn-primary {
    margin-top: 20px;
    padding: 10px 20px;
    background: var(--primary-color, #8b4513);
    color: white;
    text-decoration: none;
    border-radius: 8px;
    display: inline-block;
}

.btn-primary:hover {
    background: #6d3410;
}

/* 訂單列表 */
.order-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

/* 分頁控制 */
.pagination-controls {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
}

.btn-page {
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid var(--primary-color, #8b4513);
    background: white;
    color: var(--primary-color, #8b4513);
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
}

.btn-page:hover:not(:disabled) {
    background: var(--primary-color, #8b4513);
    color: white;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #ccc;
    color: #999;
}

.page-info {
    font-weight: 600;
    color: var(--text-dark, #3a2a1a);
    min-width: 120px;
    text-align: center;
}
</style>