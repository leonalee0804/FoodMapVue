<template>
  <div class="order-result-page">
    <div v-if="isLoading || orderResult.status === 'pending'" class="loading">
            <div class="spinner"></div>
            <p>正在查詢訂單狀態，請稍候...</p>
      <p style="font-size: 0.9em; color: #666; margin-top: 15px;">
        (此狀態通常表示正在等待外部支付網關回傳結果)
      </p>
         
    </div>

    <div v-else-if="orderResult.status === 'success'" class="result success">
      <div class="icon">✅</div>
      <h2>支付成功！</h2>

      <div class="order-summary">
        <p><strong>訂單編號：</strong>{{ orderResult.orderNo }}</p>
        <p><strong>交易序號:</strong> {{ orderResult.tradeNo }}</p>
        <p><strong>交易方式:</strong>信用卡一次付清</p>
        <p><strong>付款時間：</strong> {{ orderResult.paymentDate }}</p>
        <p><strong>總金額：</strong>NT$ {{ orderResult.totalAmount?.toLocaleString() }}</p>
      </div>

      <button class="btn btn-secondary" @click="showDetails = !showDetails">
        {{ showDetails ? '隱藏訂單明細' : '顯示訂單明細' }}
      </button>

      <div class="order-details" v-if="showDetails">
        <h3>訂單明細</h3>
        <table>
          <thead>
            <tr>
              <th>商品</th>
              <th>數量</th>
              <th>單價</th>
              <th>小計</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in orderResult.details" :key="item.orderDetailId">
              <td>{{ item.productName || item.planName }}</td>
              <td>{{ item.quantity }}</td>
              <td>NT$ {{ item.unitPrice?.toLocaleString() }}</td>
              <td>NT$ {{ (item.unitPrice * item.quantity)?.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
        <div class="order-total">
          總計：<strong>NT$ {{ computeTotal()?.toLocaleString() }}</strong>
        </div>
      </div>

      <div class="actions">
        <router-link to="/" class="btn btn-primary">返回首頁</router-link>
      </div>
    </div>

    <div v-else class="result error">
      <div class="icon">❌</div>
      <h2>支付失敗</h2>
      <p>訂單編號：{{ orderResult.orderNo || '查詢失敗' }}</p>
      <p>{{ orderResult.message || '訂單處理出現問題，請稍後重試或聯繫客服' }}</p>
      <div class="actions">
        <router-link to="/cart" class="btn btn-secondary">返回購物車重新結帳</router-link>
        <router-link to="/" class="btn btn-primary">返回首頁</router-link>
      </div>
    </div>
    <div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Comments from '@/components/orderdetails/Comments.vue'

// *** 修正點 2: 宣告 router 實例 ***
const route = useRoute()
const router = useRouter()
const isLoading = ref(true)
const orderResult = ref({})
const showDetails = ref(false)
const API_BASE = 'http://localhost:8082'
let intervalId = null

console.log('--- OrderResultPage 啟動 ---');

const fetchOrderResult = async (orderNo) => {
  console.log(`[Polling] 正在查詢訂單狀態... OrderNo: ${orderNo}`);

  try {
    const response = await axios.get(`${API_BASE}/api/order/result`, {
      params: { orderNo },
      withCredentials: true
    })
    orderResult.value = response.data

    // 輸出後端回傳的完整結果
    console.log('[API Success] 後端回傳數據:', orderResult.value);

    const status = orderResult.value.status;
    const finalStatuses = ['success', 'error'];

    if (finalStatuses.includes(status)) {
      clearInterval(intervalId)
      console.log(`[Status Change] 訂單狀態確認為最終狀態: ${status}，輪詢停止。`);
    } else {
      console.log(`[Status Change] 訂單狀態為處理中: ${status}，繼續輪詢...`);
    }
  } catch (error) {
    console.error('[API Error] 查詢訂單狀態失敗:', error)

    // 檢查錯誤狀態碼
    const status = error.response ? error.response.status : null;

    // *** 修正點：處理 401 和 403 錯誤 (權限/未登入) ***
    if (status === 401 || status === 403) {
      console.log(`[Navigation] 收到 HTTP ${status} 錯誤，導向登入頁面。`);

      // 導向登入頁面，並帶上當前完整路徑作為回跳 (redirect) 參數
      router.push({
        path: '/login',
        query: { redirect: route.fullPath }
      });

      clearInterval(intervalId); // 停止輪詢
      return; // 終止函數執行
    }

    // 如果是 400 或其他伺服器錯誤 (5xx)
    orderResult.value = { status: 'error', orderNo }
    clearInterval(intervalId)
    console.log('[Polling Stop] 發生 API 錯誤，輪詢停止。');

  } finally {
    isLoading.value = false
    console.log('[Loading] isLoading 設為 false。');
  }
}

const computeTotal = () => {
  if (!orderResult.value.details) return 0
  return orderResult.value.details
    .reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0), 0)
}

onMounted(() => {
  const orderNo = route.query.orderNo
  console.log('--- onMounted 啟動 ---');
  console.log('路由中取得的 OrderNo:', orderNo);

  if (!orderNo) {
    isLoading.value = false;
    orderResult.value = { status: 'error', message: '缺少訂單編號參數' };
    console.error('[Fatal Error] 路由中缺少 OrderNo，無法查詢。');
    return;
  }

  // 第一次立即查詢
  fetchOrderResult(orderNo)
  // 開始輪詢
  intervalId = setInterval(() => fetchOrderResult(orderNo), 3000)
  console.log('輪詢啟動，Interval ID:', intervalId);
})

onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId)
    console.log(`--- onBeforeUnmount --- 輪詢 ID ${intervalId} 已清除。`);
  }
})
</script>

<style scoped>
/* -------------------------------------- */
/* 顏色變數設定 */
/* -------------------------------------- */
:root {
  --primary-color: #8b4513;
  /* 深棕色 (主題色) */
  --secondary-color: #f4a460;
  /* 橘色 (輔助色) */
  --success-color: #28a745;
  /* 綠色 */
  --error-color: #dc3545;
  /* 紅色 */
  --bg-light: #f7f3ed;
  /* 淺米色背景 */
  --text-dark: #3a2a1a;
}

/* -------------------------------------- */

.order-result-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 主題背景：淺米色系 */
  background-color: var(--bg-light);
  padding: 20px;
  flex-direction: column;
  font-family: 'Microsoft JhengHei', sans-serif;
}

/* 載入中 */
.loading {
  background: white;
  padding: 50px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  /* 主題色旋轉 */
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg)
  }

  100% {
    transform: rotate(360deg)
  }
}


/* 結果卡片 (Success/Error) */
.result {
  background: white;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.2);
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.result h2 {
  color: var(--text-dark);
  margin-bottom: 20px;
}

.success {
  border-top: 8px solid var(--success-color);
}

.error {
  border-top: 8px solid var(--error-color);
}


/* 訂單摘要/明細 */
.order-summary,
.order-details {
  background: #fffdf8;
  /* 淺色背景 */
  border: 1px solid #e0d6c9;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  text-align: left;
  overflow-x: auto;
}

.order-summary p {
  margin: 5px 0;
}

.order-summary strong {
  color: var(--primary-color);
}


/* 明細表格 */
.order-details h3 {
  color: var(--primary-color);
  margin-bottom: 15px;
  border-bottom: 2px solid var(--secondary-color);
  padding-bottom: 5px;
}

.order-details table {
  width: 100%;
  border-collapse: collapse;
}

.order-details th,
.order-details td {
  padding: 12px;
  border-bottom: 1px dashed #dee2e6;
}

.order-details th {
  text-align: left;
  background: #f7f3ed;
  color: var(--primary-color);
}

.order-details td:last-child {
  text-align: right;
  font-weight: 500;
}

.order-details td:nth-child(3) {
  text-align: right;
}

/* 單價靠右 */
.order-details td:nth-child(2) {
  text-align: center;
}

/* 數量置中 */


.order-total {
  text-align: right;
  font-size: 18px;
  font-weight: bold;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 2px solid var(--primary-color);
}

.order-total strong {
  color: var(--error-color);
}

/* 總計金額標紅 */


/* 按鈕區塊 */
.actions {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.btn {
  padding: 12px 28px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  text-align: center;
  border: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: #6a340f;
}

.btn-secondary {
  background: var(--secondary-color);
  color: var(--text-dark);
  border: 2px solid var(--secondary-color);
}

.btn-secondary:hover {
  background: #d98c3f;
}
</style>