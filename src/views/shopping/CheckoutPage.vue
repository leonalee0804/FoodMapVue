<template>
    <div class="checkout-page">
        <h1>結帳與付款</h1>

        <div v-if="isLoading" class="loading">
            <p>正在載入資料或生成訂單，請稍候...</p>
        </div>

        <div v-else>
            <div class="card-section">
                <h2>訂單商品清單</h2>

                <div class="item-row item-header">
                    <div class="item-field name">品項名稱</div>
                    <div class="item-field price">單價</div>
                    <div class="item-field quantity">數量</div>
                    <div class="item-field subtotal">小計</div>
                    <div class="item-field saved">優惠/節省</div>
                </div>

                <div class="item-row" v-for="item in cartItems" :key="item.cartId">
                    <div class="item-field name">
                        {{ item.productName || item.planName || '無效項目' }}
                    </div>

                    <!-- *** 單價顯示邏輯 (根據角色) *** -->
                    <div class="item-field price">

                        <!-- 邏輯 A: 廠商模式 (isVendor = true) -->
                        <template v-if="isVendor">
                            <!-- 廠商只顯示 planPrice，使用黑字 (plan-price) -->
                            <span class="plan-price">
                                ${{ item.planPrice || 0 }}
                            </span>
                        </template>

                        <!-- 邏輯 B: 會員模式 (isVendor = false) -->
                        <template v-else>

                            <!-- 原價 (刪除線黑字): 僅當有 specialPrice 且價格低於 unitPrice 時顯示 -->
                            <span class="original-price" v-if="item.specialPrice && item.specialPrice < item.unitPrice">
                                ${{ item.unitPrice || 0 }}
                            </span>

                            <!-- 實際支付價格 -->
                            <span :class="{
                                'discount-price': item.specialPrice && item.specialPrice < item.unitPrice,
                                'actual-price': !item.specialPrice || item.specialPrice >= item.unitPrice
                            }">
                                <!-- 優先顯示 specialPrice，否則顯示 unitPrice -->
                                ${{ item.specialPrice || item.unitPrice || 0 }}
                            </span>

                        </template>
                    </div>

                    <div class="item-field quantity">{{ item.quantity }}</div>
                    <!-- 小計已修正為確保整數 -->
                    <div class="item-field subtotal">${{ getSubtotal(item) }}</div>

                    <!-- *** 優惠/節省邏輯 (根據角色) *** -->
                    <div class="item-field saved">
                        <template v-if="isVendor">-</template>
                        <template v-else>
                            <span v-if="item.specialPrice && item.specialPrice < item.unitPrice">
                                ${{ ((item.unitPrice - item.specialPrice) * item.quantity).toFixed(0) }}
                            </span>
                            <span v-else>-</span>
                        </template>
                    </div>
                    <!-- *** 優惠/節省邏輯結束 *** -->
                </div>

                <div class="summary-area">
                    <div class="total-row">
                        <span>總金額：</span>
                        <!-- totalAmount 現在保證為整數 -->
                        <strong>${{ totalAmount.toFixed(0) }}</strong>
                    </div>
                    <!-- totalSaved 現在會根據 isVendor 判斷是否顯示 -->
                    <div class="total-row saved" v-if="totalSaved > 0">
                        <span>總共節省：</span>
                        <strong>${{ totalSaved.toFixed(0) }}</strong>
                    </div>
                </div>
            </div>

            <div class="card-section">
                <h2>購買人資訊</h2>
                <div class="info-row">
                    <div><strong>姓名：</strong>{{ userInfo.user.memberUserName || userInfo.user.vendorName || '尚未載入' }}
                    </div>
                    <div><strong>電子郵件：</strong>{{ userInfo.user.email || '尚未載入' }}</div>
                    <div><strong>連絡電話：</strong>{{ userInfo.user.memberPhone || userInfo.user.contactTel || '尚未填寫' }}
                    </div>
                </div>
                <router-link to="/profile" class="btn btn-secondary">編輯個人資料</router-link>
            </div>

            <div class="card-section">
                <h2>選擇付款方式</h2>
                <div class="method-options">
                    <label>
                        <input type="radio" v-model="paymentMethod" value="Credit" checked />
                        信用卡
                    </label>
                    <label>
                        <input type="radio" v-model="paymentMethod" value="ATM" disabled />
                        ATM 轉帳（即將開放）
                    </label>
                    <label>
                        <input type="radio" v-model="paymentMethod" value="LinePay" disabled />
                        Line Pay（即將開放）
                    </label>
                </div>
            </div>

            <div class="actions">
                <router-link to="/cart" class="btn btn-secondary">返回購物車</router-link>
                <!-- totalAmount 現在保證為整數，避免錯誤 -->
                <button @click="createOrder" class="btn btn-success"
                    :disabled="!paymentMethod || totalAmount === 0">前往付款</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const isLoading = ref(true)
const userInfo = ref({ user: {} })
const paymentMethod = ref('Credit')
const cartItems = ref([])
const router = useRouter()
const API_BASE = 'http://localhost:8082'

onMounted(() => {
    loadUserInfo()
    checkCart()
})

// *** 判斷是否為廠商 (Role ID 3) 的計算屬性 ***
const isVendor = computed(() => {
    // 廠商 roleId: 3
    return userInfo.value.user && userInfo.value.user.roleId === 3;
});


// *** 修正點 1: 總金額計算 (依角色選擇價格，並強制四捨五入為整數) ***
const totalAmount = computed(() => {
    const rawTotal = cartItems.value.reduce((sum, item) => {
        let price = 0;

        if (isVendor.value) {
            // 廠商使用 planPrice
            price = item.planPrice || 0;
        } else {
            // 會員/一般使用者使用 specialPrice 或 unitPrice
            price = item.specialPrice || item.unitPrice || 0;
        }

        return sum + (item.quantity * price)
    }, 0);

    // *** 關鍵修正：使用 Math.round() 確保傳遞給金流的總金額是整數 ***
    return Math.round(rawTotal);
})


// *** 總共節省金額計算 (廠商無節省金額) ***
const totalSaved = computed(() => {
    // 廠商模式下，不計算優惠/節省金額，直接返回 0
    if (isVendor.value) {
        return 0;
    }

    // 會員模式下，計算 specialPrice 和 unitPrice 的差額
    return cartItems.value.reduce((sum, item) => {
        if (item.specialPrice && item.specialPrice < item.unitPrice) {
            return sum + (item.unitPrice - item.specialPrice) * item.quantity
        }
        return sum
    }, 0)
})

async function checkCart() {
    try {
        const response = await axios.get(`${API_BASE}/api/cart`, { withCredentials: true })
        cartItems.value = response.data
        console.log("購物車內容載入成功", cartItems.value);
        if (cartItems.value.length === 0) {
            Swal.fire('購物車為空', '請先添加商品', 'warning').then(() => router.push('/cart'))
        }
    } catch (err) {
        console.error(err)
    }
}

async function loadUserInfo() {
    try {
        const response = await axios.get(`${API_BASE}/api/currentUser`, { withCredentials: true })
        // 注意：這裡假設您的 API 回傳結構是 { user: { ... } }
        userInfo.value = response.data
        console.log("使用者資訊載入成功", userInfo.value);
    } catch (err) {
        console.error(err)
        Swal.fire('載入使用者資訊失敗', '請檢查是否登入', 'error')
    } finally {
        isLoading.value = false
    }
}

// *** 修正點 2: 單項小計計算 (依角色選擇價格，並強制四捨五入為整數) ***
function getSubtotal(item) {
    let price = 0;

    if (isVendor.value) {
        // 廠商使用 planPrice
        price = item.planPrice || 0;
    } else {
        // 會員/一般使用者使用 specialPrice 或 unitPrice
        price = item.specialPrice || item.unitPrice || 0;
    }

    // *** 關鍵修正：使用 Math.round() 確保小計也是整數顯示 ***
    return Math.round(price * item.quantity).toFixed(0)
}

async function createOrder() {
    if (!paymentMethod.value) {
        Swal.fire('請選擇付款方式', '', 'warning')
        return
    }
    if (totalAmount.value === 0) {
        Swal.fire('訂單金額為零', '無法建立空訂單', 'warning')
        return
    }

    isLoading.value = true
    try {
        // totalAmount.value 在這裡被使用，現在它保證是整數
        const response = await axios.post(`${API_BASE}/api/order/create`, {}, { withCredentials: true })
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = response.data
        const formEl = tempDiv.querySelector('form')
        if (!formEl) throw new Error('無效的支付表單')

        const orderNoInput = formEl.querySelector('input[name="MerchantTradeNo"]')
        const orderNo = orderNoInput ? orderNoInput.value : null
        if (!orderNo) throw new Error('無法取得訂單編號')

        const ecpayWindow = window.open('', 'ecpayWindow')
        formEl.target = 'ecpayWindow'
        document.body.appendChild(formEl)
        formEl.submit()

        router.push({ path: '/orderresult', query: { orderNo } })
    } catch (err) {
        console.error('訂單生成失敗', err)
        Swal.fire('訂單生成失敗', '', 'error')
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
/* -------------------------------------- */
/* 結帳頁面基本樣式 */
/* -------------------------------------- */
.checkout-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Microsoft JhengHei', sans-serif;
    color: #3a2a1a;
}

h1 {
    text-align: center;
    margin-bottom: 30px;
    color: #8b4513;
}

.loading {
    text-align: center;
    padding: 50px;
    font-size: 18px;
    color: #8b4513;
}

/* 區塊卡片樣式 */
.card-section {
    background-color: #fffdf8;
    border: 1px solid #e0d6c9;
    border-radius: 12px;
    padding: 25px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
    margin-bottom: 30px;
}

.card-section h2 {
    font-size: 1.3em;
    color: #8b4513;
    margin-bottom: 20px;
    border-bottom: 3px solid #f4a460;
    padding-bottom: 10px;
    font-weight: 600;
}

/* -------------------------------------- */
/* 訂單商品清單排版修正 (Item List - Grid) */
/* -------------------------------------- */
.item-row {
    display: grid;
    /* 產品名(3), 價格(1.5), 數量(1), 小計(1.5), 節省金額(1) */
    grid-template-columns: 3fr 1.5fr 1fr 1.5fr 1fr;
    gap: 10px;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px dashed #e0d6c9;
    /* 項目之間的虛線 */
    font-size: 0.95em;
}

/* 讓列表頂部有一條線作為分隔 */
.card-section:first-of-type .item-row:first-of-type {
    border-top: 1px dashed #e0d6c9;
}

.item-row:last-of-type {
    border-bottom: none;
}

/* 標題列樣式 */
.item-row.item-header {
    font-weight: 600;
    color: #8b4513;
    background-color: #f7f3ed;
    border-bottom: 2px solid #e0d6c9;
    /* 標題底線使用實線 */
    border-top: none;
    padding: 15px 0;
}

.item-field {
    text-align: right;
    padding: 0 5px;
}

.item-field.name {
    text-align: left;
    font-weight: 500;
    color: #3a2a1a;
}

.item-field.price {
    white-space: nowrap;
}

.item-field.quantity {
    text-align: center;
}

/* 價格樣式：已修正以符合角色邏輯 */
/* 1. 會員：原價 (刪除線灰字) */
.original-price {
    text-decoration: line-through;
    color: #999;
    margin-right: 5px;
    font-size: 0.9em;
}

/* 2. 會員：折扣價 (紅字) */
.discount-price {
    color: #dc3545;
    font-weight: bold;
    font-size: 1.05em;
    /* 稍微放大 */
}

/* 3. 會員：實際價格 (無折扣時，黑字) & 4. 廠商：方案價格 (黑字) */
.actual-price,
.plan-price {
    color: #3a2a1a;
    /* 黑字 */
    font-weight: bold;
    font-size: 1.05em;
}

/* -------------------------------------- */
/* 總計排版 (Total Summary) */
/* -------------------------------------- */
.summary-area {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    /* 將整個總結區塊靠右 */
    width: 100%;
}

.total-row {
    display: flex;
    justify-content: flex-end;
    width: 300px;
    /* 限制總結區塊寬度 */
    font-weight: bold;
    font-size: 1.2em;
    padding: 15px 0 0;
    margin-top: 15px;
    border-top: 2px solid #8b4513;
    /* 頂部實線 */
}

.total-row span {
    margin-right: 15px;
    color: #3a2a1a;
}

.total-row strong {
    color: #d9534f;
}

.total-row.saved {
    font-size: 1em;
    font-weight: normal;
    border-top: none;
    margin-top: 5px;
}

.total-row.saved span,
.total-row.saved strong {
    color: #28a745;
}

/* -------------------------------------- */
/* 購買人資訊 (Info) */
/* -------------------------------------- */
.info-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
}

.info-row div {
    padding: 5px 0;
    border-bottom: 1px dotted #ccc;
}

/* -------------------------------------- */
/* 付款方式 (Payment) */
/* -------------------------------------- */
.method-options {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.method-options label {
    display: block;
    cursor: pointer;
    font-size: 1.05em;
    padding: 8px 10px;
    transition: background-color 0.2s;
    border-left: 5px solid transparent;
    border-radius: 4px;
}

.method-options label:hover {
    background-color: #fff8f0;
}

.method-options label:has(input[type="radio"]:checked) {
    border-left-color: #f4a460;
}

.method-options input[type="radio"] {
    margin-right: 8px;
}

/* -------------------------------------- */
/* 按鈕樣式 */
/* -------------------------------------- */
.actions {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 30px;
}

.btn {
    padding: 10px 25px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s, background-color 0.2s;
}

/* 主題按鈕：前往付款 */
.btn-success {
    background-color: #8b4513;
    color: #fff;
}

.btn-success:hover:not(:disabled) {
    background-color: #6a340f;
}

/* 次要按鈕：返回購物車/編輯 */
.btn-secondary,
.btn-primary {
    background-color: #f4a460;
    color: #3a2a1a;
}

.btn-secondary:hover:not(:disabled),
.btn-primary:hover:not(:disabled) {
    background-color: #d98c3f;
}

.btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>
