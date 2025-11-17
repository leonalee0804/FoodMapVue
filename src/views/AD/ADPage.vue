<template>
  <div class="ad-page-container">
    <!-- 標題卡片 -->
    <div class="title-card">
      <div class="card-header">
        <div class="header-content">
          <i class="bi bi-megaphone header-icon"></i>
          <h2 class="header-title">廣告方案</h2>
        </div>
      </div>
      <div class="card-body text-center">
        <p class="subtitle">
          <i class="bi bi-stars me-2"></i>
          讓您的餐廳在美食地圖平台上脫穎而出，吸引更多潛在顧客！
          <i class="bi bi-stars ms-2"></i>
        </p>
      </div>
    </div>

        <!-- 廣告方案卡片 -->
        <div class="row justify-content-center g-4">
            <div v-for="plan in plans" :key="plan.planName" class="col-12 col-md-6 d-flex justify-content-center">
                <div class="card plan-card shadow-sm border-0 w-100">
                    <div class="card-body d-flex flex-column text-center p-5">
                        <h4 class="fw-bold text-primary mb-3">{{ plan.planName }}</h4>
                        <p class="fs-4 text-warning fw-bold mb-2">
                            ${{ plan.planPrice }}
                            <span class="fs-6 text-muted">/ {{ plan.days }} 天</span>
                        </p>
                        <p class="text-secondary flex-grow-1 mb-4">
                            {{ plan.planDescription }}
                        </p>
                        <button class="btn btn-buy fw-semibold" @click="addToCart(plan)">
                            立即購買
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const plans = ref([]);

const loadPlans = async () => {
    try {
        const res = await axios.get("http://localhost:8082/ad/");
        plans.value = res.data;
        console.log("廣告方案載入成功", plans.value);
    } catch (e) {
        console.error("載入廣告方案失敗", e);
    }
};

// const buyPlan = async (plan) => {
//     const result = await Swal.fire({
//         title: `確定購買「${plan.planName}」方案？`,
//         html: `<b>$${plan.planPrice}</b> / ${plan.days} 天<br><br>${plan.planDescription}`,
//         icon: "question",
//         showCancelButton: true,
//         confirmButtonText: "確認購買",
//         cancelButtonText: "取消",
//         confirmButtonColor: "#d97706",
//         cancelButtonColor: "#6b7280",
//     });

//     if (result.isConfirmed) {
//         Swal.fire({
//             title: "購買成功！",
//             text: "系統將導向付款頁面...",
//             icon: "success",
//             confirmButtonColor: "#d97706",
//             timer: 2000,
//             showConfirmButton: false,
//         });

//         setTimeout(() => {
//             window.location.href = `http://localhost:5173/payment/${plan.planName}`;
//         }, 2000);
//     }
// };

async function addToCart(plan) {
    // 註解：驗證 quantity 是否有效（大於 0），避免無效請求
    // if (!product.quantity || product.quantity <= 0) {
    //     Swal.fire('請輸入有效數量（至少 1）', '', 'warning')
    //     return // 註解：無效則中斷執行
    // }

    try {
        // 註解：準備請求體，CartDTO 格式：{ productId, adId: null (vendor 產品無廣告), quantity }
        const cartData = {

            productId: null, // 註解：從產品物件取出 productId
            planId: plan.planId, // 註解：vendor 產品無 adId，設為 null
            quantity: 1 // 註解：使用輸入框綁定的 quantity
        }

        console.log('發送加入購物車請求：', cartData); // 註解：console.log 用於除錯，確認請求資料

        // 註解：發送 POST 請求到 /api/cart/add，對應 CartController 的 addToCart
        // 註解：axios 會自動處理 session cookie（假設後端使用 session-based 登入）
        const response = await axios.post("http://localhost:8082/api/cart/add", cartData, {
            // === 關鍵修正：啟用跨域請求攜帶 Session Cookie ===
            withCredentials: true
        })

        console.log('加入購物車成功：', response.data); // 註解：記錄後端回傳的 Cart 物件

        // 註解：成功後顯示 Swal 確認訊息，並可選擇清空輸入框或重置 quantity
        Swal.fire({
            title: '成功！',
            text: `已加入購物車：${response.data.planName} x ${response.data.quantity}`,
            icon: 'success',
            confirmButtonText: '確定'
        }).then(() => {
            // 註解：可選：加入後重置 quantity 為 1，或保持使用者輸入
            plan.quantity = 1
        })

    } catch (error) {
        console.error('加入購物車失敗：', error) // 註解：記錄錯誤細節

        // 註解：根據後端錯誤處理不同情況（e.g., 未登入、庫存不足）
        let errorMsg = '加入購物車失敗'
        if (error.response?.status === 400) {
            // 註解：400 Bad Request 通常表示未登入或無效參數
            errorMsg = '請先登入會員Or參數錯誤'
        } else if (error.message.includes('stock')) {
            // 註解：假設錯誤訊息包含 'stock'，表示庫存不足（來自 CartService）
            errorMsg = '庫存不足，請調整數量'
        }

        Swal.fire(errorMsg, '', 'error') // 註解：顯示對應錯誤彈窗
    }
}

onMounted(loadPlans);
</script>

<style scoped>
.ad-page-container {
  max-width: 1200px;  /* 👈 與其他頁面一致 */
  margin: 0 auto;
  padding: 1.5rem;
}
/* 標題卡片 */
.title-card {
  
  background: #faf8f3;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(139, 117, 95, 0.08), 0 2px 4px rgba(139, 117, 95, 0.05);
  overflow: hidden;
  border: 1px solid #e8dcc8;
  margin-bottom: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.title-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(139, 117, 95, 0.12), 0 4px 8px rgba(139, 117, 95, 0.08);
}

.card-header {
  background: linear-gradient(135deg, #d4b896 0%, #c9a882 100%);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  font-size: 1.5rem;
  color: #ffffff;
}

.header-title {
  margin: 0;
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.card-body {
  padding: 1rem;
}

.subtitle {
  font-size: 1.125rem;
  color: #8b755f;
  margin: 0;
  line-height: 1.6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.subtitle i {
  color: #d4b896;
}
.plan-card {
    background: linear-gradient(180deg, #fffaf3 0%, #fff 100%);
    border-radius: 18px;
    transition: all 0.25s ease-in-out;
    max-width: 600px;
    min-height: 300px;
}

.plan-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 22px rgba(0, 0, 0, 0.15);
}

.text-primary {
    color: #a0522d !important;
}

.text-warning {
    color: #d97706 !important;
}

.btn-buy {
    background-color: #8b755f;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 12px 20px;
    font-size: 1.05rem;
    transition: all 0.25s ease;
}

.btn-buy:hover {
    background-color: #7b3f1f;
    transform: scale(1.05);
}
</style>