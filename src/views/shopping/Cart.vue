<template>
  <div class="cart-page">
    <h1>我的購物車</h1>

    <div v-if="!cartItems || cartItems.length === 0" class="empty-cart">
      <p>您的購物車是空的！</p>
      <router-link to="/" class="btn btn-primary">去逛逛商品</router-link>
    </div>

    <div v-else class="cart-items">
      <table class="cart-table">
        <thead>
          <tr>
            <th>產品</th>
            <th>數量</th>
            <th>單價</th>
            <th>小計</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cartItems" :key="item.cartId" class="cart-row">
            <td>
              <div class="product-cell">
                <span class="product-name">{{ item.productName || item.planName || '無效項目' }}</span>
                <span 
                  v-if="item.specialPrice != null && item.unitPrice != null && item.specialPrice < item.unitPrice" 
                  class="discount-tag"
                >
                  已折扣 ${{ item.unitPrice - item.specialPrice }}
                </span>
                <span 
                  v-if="item.specialPrice != null && item.unitPrice != null && item.specialPrice < item.unitPrice" 
                  class="promo-icon" 
                  title="優惠套用中"
                >
                  🏷️
                </span>
              </div>
            </td>
            <td>
              <input 
                type="number" 
                v-model.number="item.quantity" 
                min="1" 
                max="99" 
                @change="updateQuantity(item)"
                class="quantity-input"
              />
            </td>
            <td>
              <template v-if="item.specialPrice != null && item.unitPrice != null && item.specialPrice < item.unitPrice">
                <span class="original-price">${{ item.unitPrice }}</span>
                <span class="discount-price">${{ item.specialPrice }}</span>
              </template>
              <template v-else>
                ${{ item.unitPrice ?? item.planPrice ?? 0 }}
              </template>
            </td>
            <td>${{ getSubtotal(item) }}</td>
            <td><button @click="removeItem(item.cartId)" class="btn btn-danger">刪除</button></td>
          </tr>
        </tbody>
      </table>

      <div class="cart-summary">
        <div class="total-info">
          <p><strong>總計：${{ totalAmount.toFixed(0) }}</strong></p>
          <p v-if="totalDiscount > 0" class="total-discount">您已節省：${{ totalDiscount.toFixed(0) }}</p>
        </div>

        <div class="buttons">
          <router-link to="/" class="btn btn-continue">繼續購物</router-link>
          <button @click="confirmOrder" class="btn btn-checkout" :disabled="totalAmount === 0">確認訂單</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'

const cartItems = ref([])
const router = useRouter()
const API_BASE = 'http://localhost:8082'

const totalAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    const price = item.specialPrice ?? item.unitPrice ?? item.planPrice ?? 0
    const qty = item.quantity ?? 0
    return sum + (price * qty)
  }, 0)
})

const totalDiscount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    if (item.specialPrice != null && item.unitPrice != null && item.specialPrice < item.unitPrice) {
      return sum + (item.unitPrice - item.specialPrice) * (item.quantity ?? 0)
    }
    return sum
  }, 0)
})

onMounted(() => {
  loadCart()
})

async function loadCart() {
  try {
    const response = await axios.get(`${API_BASE}/api/cart`, { withCredentials: true })
    cartItems.value = response.data ?? []
  } catch (error) {
    console.error('載入購物車失敗', error)
    Swal.fire('載入購物車失敗', '', 'error')
  }
}

async function updateQuantity(item) {
  if (!item.quantity || item.quantity <= 0) {
    Swal.fire('數量必須至少為 1', '', 'warning')
    item.quantity = 1
    return
  }
  try {
    await axios.put(`${API_BASE}/api/cart/${item.cartId}`, { quantity: item.quantity }, { withCredentials: true })
  } catch (error) {
    Swal.fire('更新數量失敗', '', 'error')
  }
}

async function removeItem(cartId) {
  const result = await Swal.fire({
    title: '確認刪除？',
    text: '此項目將從購物車移除',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: '確定刪除',
    cancelButtonText: '取消',
    confirmButtonColor: '#dc3545' // 使用您的 btn-danger 顏色
  })
  if (!result.isConfirmed) return

  try {
    await axios.delete(`${API_BASE}/api/cart/${cartId}`, { withCredentials: true })
    Swal.fire('已刪除', '', 'success')
    await loadCart()
  } catch (error) {
    Swal.fire('刪除失敗', '', 'error')
  }
}

function getSubtotal(item) {
  const price = item.specialPrice ?? item.unitPrice ?? item.planPrice ?? 0
  const qty = item.quantity ?? 0
  return (price * qty).toFixed(0)
}

async function confirmOrder() {
    if (totalAmount.value === 0) {
        Swal.fire('購物車為空，無法確認訂單', '', 'warning')
        return
    }

    // 註解：生成訂單詳情 HTML，顯示商品名稱、數量、小計
    const orderDetails = cartItems.value
        .map(item => `
        <li>
            ${item.productName || '廣告項目'}，
            數量：${item.quantity}，
            小計：$${getSubtotal(item)}
        </li>
    `)
        .join('<hr>')

    // 註解：顯示確認訂單彈窗，包含總金額與操作按鈕
    const result = await Swal.fire({
        title: '確認訂單內容',
        html: `
            <div style="max-height: 300px; overflow-y: auto;">
                ${orderDetails}
            </div>
            <div style="font-weight: bold; margin-top: 20px;">
                總金額：$${totalAmount.value}
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: '前往付款',
        cancelButtonText: '返回購物車',
        width: '600px',
        customClass: {
            confirmButton: 'btn btn-success',
            cancelButton: 'btn btn-primary'
        }
    })

    // 註解：若點擊「前往付款」，導向付款頁
    if (result.isConfirmed) {
        router.push('/checkoutpage') // 註解：假設付款頁路由為 /checkout
    }
}
</script>

<style scoped>
/* -------------------------------------- */
/* 購物車頁面基本樣式 */
/* -------------------------------------- */
.cart-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft JhengHei', sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.cart-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px; /* 卡片間距 */
  font-size: 16px;
}

.cart-table th {
  background-color: #fffaf2;
  font-weight: 600;
  padding: 12px;
  border-bottom: 2px solid #e0d6c9;
}

.cart-table td {
  background-color: #fffdf8;
  border-radius: 10px;
  padding: 12px;
  vertical-align: middle;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.cart-row:hover td {
  transform: translateY(-2px);
  transition: 0.2s;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.product-name {
  font-weight: 500;
}

.discount-tag {
  display: inline-block;
  background-color: #ff4500;
  color: #fff;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
}

.promo-icon {
  font-size: 14px;
}

.quantity-input {
  width: 60px;
  padding: 4px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  margin-right: 6px;
}

.discount-price {
  color: #ff4500;
  font-weight: bold;
}

.cart-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 20px;
}

.total-info {
  font-size: 18px;
  margin-bottom: 10px;
  text-align: right;
}

.total-discount {
  color: #28a745;
  font-weight: bold;
}

.buttons {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s ease;
}

.btn:hover {
  opacity: 0.85;
}

/* 主題色按鈕 */
.btn-checkout {
  background-color: #8b4513;
  color: #fff;
}

.btn-continue {
  background-color: #f4a460;
  color: #3a2a1a;
}

.btn-danger {
  background-color: #dc3545;
  color: #fff;
}

.empty-cart {
  text-align: center;
  padding: 50px 20px;
  font-size: 18px;
}

/* -------------------------------------- */
/* SweetAlert2 (Swal) 客製化樣式 */
/* -------------------------------------- */

/* 全域樣式：字體與背景 */
.swal2-popup {
  font-family: 'Microsoft JhengHei', sans-serif !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
}

/* 標題與內文 */
.swal2-title {
  color: #8b4513 !important;
  font-weight: 600 !important;
  font-size: 24px !important;
}

.swal2-content {
  color: #3a2a1a !important;
  font-size: 16px !important;
}

/* 確認訂單內容列表樣式 - 修正版 (解決項目符號問題) */
.swal2-html-container ul {
  list-style: none !important;
  padding: 0 !important;
  margin: 15px 0;
  text-align: center;
  border-top: 1px dashed #e0d6c9;
  padding-top: 15px;
}

.swal2-html-container li {
  list-style: none !important;
  padding: 5px 0;
  color: #3a2a1a;
  text-align: center;
}

/* 總計文字樣式 */
.swal2-html-container strong {
    font-size: 18px;
    color: #8b4513;
    display: block;
    margin-top: 10px;
}

/* 優惠金額文字樣式 (class="total-discount") */
.swal2-html-container .total-discount {
  color: #28a745 !important;
  font-weight: bold !important;
  font-size: 16px !important;
  margin-top: 5px;
}

/* 按鈕容器 */
.swal2-actions {
  gap: 12px !important;
  margin-top: 20px !important;
}

/* 主按鈕 (確認/前往付款) 樣式 */
.swal2-confirm.btn-checkout,
.swal2-styled.swal2-confirm {
  background-color: #8b4513 !important;
  color: #fff !important;
  padding: 10px 20px !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  border: none !important;
  box-shadow: none !important;
  transition: all 0.2s ease !important;
}

.swal2-confirm.btn-checkout:focus,
.swal2-styled.swal2-confirm:focus {
    box-shadow: 0 0 0 3px rgba(139, 69, 19, 0.5) !important;
}

/* 副按鈕 (取消/返回購物車) 樣式 */
.swal2-cancel.btn-continue,
.swal2-styled.swal2-cancel {
  background-color: #f4a460 !important;
  color: #3a2a1a !important;
  padding: 10px 20px !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  border: none !important;
  box-shadow: none !important;
  transition: all 0.2s ease !important;
}

.swal2-cancel.btn-continue:focus,
.swal2-styled.swal2-cancel:focus {
    box-shadow: 0 0 0 3px rgba(244, 164, 96, 0.5) !important;
}

.swal2-icon.swal2-warning {
    border-color: #ffc107 !important;
    color: #ffc107 !important;
}

.swal2-icon.swal2-success [class^="swal2-success-line"] {
    background-color: #28a745 !important;
}
</style>