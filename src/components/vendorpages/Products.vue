<template>
    <div class="section" id="restaurant-products">
        <div v-for="p in products" :key="p.productId" class="product">
            <img :src="getImageUrl(p.picUrl)" alt="商品圖片" class="product-img" />
            <p>{{ p.productName }}</p>
            <p>原價： $ {{ p.unitPrice }}</p>
            <p id="special-price" v-if="p.specialPrice">限時特價 $ {{ p.specialPrice }}</p>
            <input type="number" v-model.number="p.quantity" min="1" max="99" placeholder="數量" />
            <br>
            <button class="btn btn-primary" @click="addToCart(p)">加入購物車</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'

const products = ref([]) // 存放商品清單
// const picUrl =  // 還沒有圖片
import { useRoute } from 'vue-router'

const route = useRoute()
const vendorId = ref(route.params.vendorId)

onMounted(() => {
    getProducts()
})

async function getProducts() {
    try {
        const response = await axios.get(`http://localhost:8082/vProduct/${vendorId.value}`)
        // 加入 quantity
        products.value = response.data.map(p => ({ ...p, quantity: 1 }))

        // 前端排序：specialPrice 正序，null 放最後
        products.value.sort((a, b) => {
            if (a.specialPrice === null) return 1
            if (b.specialPrice === null) return -1
            return a.specialPrice - b.specialPrice
        })
    } catch (error) {
        console.error(error)
        Swal.fire('讀取商品失敗', '', 'error')
    }
}

function getImageUrl(picName) {
    return `http://localhost:8082/Product_Pic/${picName}`
}

async function addToCart(product) {
    // 註解：驗證 quantity 是否有效（大於 0），避免無效請求
    if (!product.quantity || product.quantity <= 0) {
        Swal.fire('請輸入有效數量（至少 1）', '', 'warning')
        return // 註解：無效則中斷執行
    }

    try {
        // 註解：準備請求體，CartDTO 格式：{ productId, adId: null (vendor 產品無廣告), quantity }
        const cartData = {
            productId: product.productId, // 註解：從產品物件取出 productId
            adId: null, // 註解：vendor 產品無 adId，設為 null
            quantity: product.quantity // 註解：使用輸入框綁定的 quantity
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
            text: `已加入購物車：${product.productName} x ${product.quantity}`,
            icon: 'success',
            confirmButtonText: '確定'
        }).then(() => {
            // 註解：可選：加入後重置 quantity 為 1，或保持使用者輸入
            product.quantity = 1
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
</script>


<style scoped>
#restaurant-products {
    display: flex;
    gap: 15px;
    overflow-x: auto;
    /* 水平滾動 */
    padding-bottom: 10px;
    scroll-behavior: smooth;
}

.product {
    flex: 0 0 265px;
    /* 固定寬度，允許橫向排列 */
    background: #ffffff;
    border: 1px solid #ded5c9;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

.product-img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 10px;
}

button {
    margin-top: 20px;
}

#special-price {
    color: red;
    font-weight: bold;
    font-size: larger;
}
</style>