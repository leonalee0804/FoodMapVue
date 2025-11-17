<template>
    <div class="ad-event-page">
        <!-- 活動主圖 -->
        <div class="banner">
            <img src="/images/ADmain.png" alt="冬季特惠主視覺" />
        </div>

        <!-- 活動文案 -->
        <section class="ad-text">
            <h2>冬日暖洋洋限定！餐券優惠限期販售中</h2>
            <p>嚴選人氣餐廳推出冬季特惠，數量有限，快來探索屬於你的暖胃美味。</p>
        </section>

        <!-- 廠商卡片區 -->
        <section class="vendor-list">
            <div v-for="vendor in vendors" :key="vendor.vendorId" @click="goVendorPage(vendor.vendorId)"
                class="vendor-card">
                <!-- 點擊圖片導向對應 vendor 頁面 -->
                <img :src="`http://localhost:8082/Vendor_Pic/${vendor.logoURL}`" alt="vendor image"
                    style="cursor: pointer;" />
                <h3>{{ vendor.vendorName }}</h3>
                <p>{{ vendor.address }}</p>
                <p>{{ vendor.more.description }}</p>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

/* ---- 這裡設定要顯示的六個店家ID ---- */
// axios抓訂單資料
const vendorId1 = 11
const vendorId2 = 15
const vendorId3 = 19
const vendorId4 = 27
const vendorId5 = 29
const vendorId6 = 35
/* -------------------------------------- */

const vendorIds = [vendorId1, vendorId2, vendorId3, vendorId4, vendorId5, vendorId6]
const vendors = ref([])
const router = useRouter()

onMounted(initVendor);

// 一次抓取六筆資料
async function initVendor() {
    try {
        // 取廠商資料
        const promises = vendorIds.map(id =>
            axios.get(`http://localhost:8082/vendor/${id}`)
        )
        const results = await Promise.all(promises)
        console.log(results)

        // 取廠商種類資料
        const promises2 = vendorIds.map(id =>
            axios.get(`http://localhost:8082/vendor/more/${id}`)
        )
        const results2 = await Promise.all(promises2)
        console.log(results2)

        // 合併兩個 API 的資料
        vendors.value = results.map((r, i) => {
            return {
                ...r.data,           // 第一個 API 的資料
                more: results2[i].data // 第二個 API 的資料加到 more 欄位
            }
        })

        console.log(vendors.value)
    } catch (error) {
        console.error(error)
    }
}

function goVendorPage(vendorId) {
    // 導向 vendor 頁面
    router.push(`vendor/${vendorId}`)
}

</script>

<style scoped>
h2 {
    white-space: nowrap;
    /* 禁止換行 */
}

.ad-event-page {
    text-align: center;
}

.banner img {
    margin-top: 20px;
    width: 100%;
    height: 33vh;
    object-fit: cover;
}

.ad-text {
    margin: 20px auto;
    max-width: 700px;
}

/* .vendor-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
    padding: 20px;
} */

.vendor-list {
    display: grid;
    grid-template-columns: repeat(3, 250px);
    /* 固定每個卡片寬度 */
    grid-auto-rows: auto;
    gap: 70px;
    /* 卡片之間間距 */
    justify-content: center;
    /* 整個區塊居中 */
    padding: 20px;
}

.vendor-card {
    width: 300px;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 10px;
    text-align: left;
    background: #fff;
}

.vendor-card img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    margin-bottom: 10px;
}

h3 {
    margin-top: 10px;
}

.vendor-card {
    background-color: #fff;
    /* 預設白底 */
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    /* 加入平滑過渡 */
    cursor: pointer;
}

.vendor-card:hover {
    transform: translateY(-5px);
    /* 輕微向上位移 */
    background-color: #f5f5f5;
    /* 底色變灰 */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    /* 陰影稍微加強 */
}
</style>