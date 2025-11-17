<template>
    <div class="vendor-page">
        <!-- 宣傳圖片與基本資訊區塊 -->
        <div class="banner-container">
            <img :src="`http://localhost:8082/Vendor_Pic/${Vendor.logoURL}`" alt="餐廳宣傳圖片" class="banner-img" />
            <div class="banner-dark"></div>
            <div class="banner-overlay">
                <h1 class="vendor-name">{{ Vendor.name }}</h1>
                <button class="reserve-btn" @click="goToReservation">
                    <span>立刻訂位</span>
                </button>
            </div>
        </div>

        <!-- 主要內容區 -->
        <div class="main-content">

            <!-- 餐廳描述 -->
            <div class="section description-section">
                <p class="description-text">{{ Vendor.description }}</p>
            </div>

            <!-- 基本資訊與特性（並排） -->
            <div class="info-features-row">
                <!-- 基本資訊卡片 -->
                <div class="info-card">
                    <h2 class="section-title">基本資訊</h2>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-icon">📍</span>
                            <div>
                                <div class="info-label">地址</div>
                                <div class="info-value" @click="scrollToMap" style="cursor:pointer;color:#0d6efd;">{{
                                    Vendor.address }}</div>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">📞</span>
                            <div>
                                <div class="info-label">電話</div>
                                <div class="info-value">{{ Vendor.phone }}</div>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🍽️</span>
                            <div>
                                <div class="info-label">風格</div>
                                <div class="info-value">{{ Vendor.styleName }} | {{ Vendor.category }}</div>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">💰</span>
                            <div>
                                <div class="info-label">價位</div>
                                <div class="info-value">{{ Vendor.priceMin }}～{{ Vendor.priceMax }}元</div>
                            </div>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🪑</span>
                            <div>
                                <div class="info-label">座位 / 服務費</div>
                                <div class="info-value">{{ Vendor.seatsNumber }}位 / {{ Vendor.ServiceCharge }}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 餐廳特性卡片 -->
                <div class="features-card">
                    <h2 class="section-title">餐廳特性</h2>
                    <div class="features-grid">
                        <div v-for="(value, key) in Vendor.features" :key="key"
                            :class="['feature-tag', value ? 'available' : 'unavailable']">
                            <span class="feature-icon">{{ value ? '✓' : '✗' }}</span>
                            <span>{{ key }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 評價統計 -->
            <div class="section rating-section">
                <h2 class="section-title">顧客回饋</h2>
                <div class="rating-tags">
                    <div v-for="rating in Vendor.ratings" :key="rating.label" class="rating-item">
                        <span :class="['rating-badge', rating.class]">
                            {{ rating.label }}
                            <span class="rating-number">{{ rating.count }}</span>
                        </span>
                    </div>
                </div>
            </div>

            <!-- 店內菜單（獨立區塊） -->
            <div class="section menu-section-full">
                <h2 class="section-title">店內菜單</h2>
                <div class="menu-wrapper">
                    <MenuList />
                </div>
            </div>

            <!-- 優惠券與購物車（獨立區塊） -->
            <div class="section products-section-full">
                <h2 class="section-title">優惠餐券</h2>
                <div class="products-wrapper">
                    <Products />
                </div>
                <div class="cart-btn-container">
                    <a class="cart-btn" href="/cart">
                        <span>🛒</span>
                        前往購物車
                    </a>
                </div>
            </div>

            <!-- 營業時間與地圖（並排） -->
            <div class="hours-map-row">
                <div class="hours-card">
                    <h2 class="section-title">營業時間</h2>
                    <div class="hours-list">
                        <div v-for="item in openingHours" :key="item.vdOpeningHourId" class="hours-item">
                            <span class="day-name">{{ getDayName(item.dayOfWeek) }}</span>
                            <span class="hours-time">
                                <span v-if="item.openingTime && item.closingTime">
                                    {{ item.openingTime }} - {{ item.closingTime }}
                                </span>
                                <span v-else class="closed-tag">本日公休</span>
                            </span>
                        </div>
                    </div>
                </div>

                <div class="map-card">
                    <h2 class="section-title" ref="mapSection">地圖</h2>
                    <div class="map-container">
                        <iframe width="100%" height="100%" style="border:0; border-radius:8px;" loading="lazy"
                            allowfullscreen referrerpolicy="no-referrer-when-downgrade"
                            :src="'https://www.google.com/maps/embed?pb=' + Vendor.mapApi">
                        </iframe>
                    </div>
                </div>
            </div>

            <!-- 評論區 -->
            <div class="section comments-section">
                <h2 class="section-title">顧客評論</h2>

                <div class="comments-container">
                    <div class="comment-card" v-for="(comment, index) in Vendor.comments" :key="index">
                        <div class="comment-header">
                            <span class="comment-user">👤 {{ comment.user }}</span>
                        </div>
                        <p class="comment-text">{{ comment.text }}</p>
                        <div v-if="comment.images && comment.images.length" class="comment-images">
                            <img v-for="(img, i) in comment.images.slice(0, 3)" :key="i" :src="img" alt="評論圖片"
                                class="comment-img" @click="showImage(img)" />
                        </div>
                    </div>
                </div>

                <!-- 放大圖片遮罩 -->
                <div v-if="activeImage" class="image-overlay" @click="activeImage = null">
                    <img :src="activeImage" alt="Full Image" class="full-image" />
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import Products from '@/components/vendorpages/Products.vue'
import MenuList from '@/components/vendorpages/MenuList.vue'
import axios from 'axios';
import { useRoute } from 'vue-router'
import { useRouter } from 'vue-router'

const route = useRoute()
const vendorId = ref(route.params.vendorId)
const router = useRouter()

// 訂位
async function goToReservation() {
    try {
        // 先打後端 /r/{vendorId} 確認店家存在
        const res = await axios.get(`http://localhost:8082/vendor/r/${vendorId.value}`)
        if (res.status === 200) {
            router.push(`/reservation/${vendorId.value}`)
        }
    } catch (err) {
        console.error("無法取得店家資訊", err)
        alert("錯誤，請聯繫客服")
    }
}


const Vendor = reactive({
    features: {},
})


onMounted(() => {
    getVendorData()
    getOpeningHours()
    getRatingSummary()
    getComments()
})

// 取得廠商資料
async function getVendorData() {
    // Only Vendor
    const response1 = await axios.get(`http://localhost:8082/vendor/${vendorId.value}`);
    // console.log("店家資料:" + response1.data)
    Vendor.logoURL = response1.data.logoURL;
    Vendor.name = response1.data.vendorName;
    Vendor.address = response1.data.address;
    Vendor.phone = response1.data.contactTel;
    Vendor.mapApi = response1.data.mapApi;

    // Vendor Detail
    const response2 = await axios.get(`http://localhost:8082/vendor/details/${vendorId.value}`);
    // console.log(response2.data)
    Vendor.description = response2.data.description
    Vendor.style = response2.data.style
    Vendor.priceMin = response2.data.priceMin
    Vendor.priceMax = response2.data.priceMax
    Vendor.ServiceCharge = response2.data.serviceCharge
    Vendor.seatsNumber = response2.data.seatsNumber
    // Vendor features
    Vendor.features.冷氣 = response2.data.airConditioner
    Vendor.features.停車場 = response2.data.park
    Vendor.features.嬰幼兒座位 = response2.data.babyFriendly
    Vendor.features.寵物入店 = response2.data.petFriendly
    Vendor.features.素食餐點 = response2.data.veganFriendly
    Vendor.features.清真餐點 = response2.data.halalFriendly

    // Vendor join Category
    const response3 = await axios.get(`http://localhost:8082/vendor/more/${vendorId.value}`);
    Vendor.description = response3.data.description;
    Vendor.category = response3.data.categoryName

    // Vendor join Style
    const response4 = await axios.get(`http://localhost:8082/vendor/style/${vendorId.value}`);
    Vendor.styleName = response4.data.styleName;

}

const openingHours = ref([]);
// 取得營業時間
async function getOpeningHours() {
    const response = await axios(`http://localhost:8082/vendor/openingHours/${vendorId.value}`);
    // console.log(response.data)
    openingHours.value = response.data;
}

// 取得星期名稱
function getDayName(day) {
    const days = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日']
    return days[day - 1]
}


// 取得評價統計 連動訂單後要再確認
async function getRatingSummary() {
    const [delicious, quick, friendly, photogenic, topCP] = await Promise.all([
        axios.get(`http://localhost:8082/comment/delicious/${vendorId.value}`),
        axios.get(`http://localhost:8082/comment/quick/${vendorId.value}`),
        axios.get(`http://localhost:8082/comment/friendly/${vendorId.value}`),
        axios.get(`http://localhost:8082/comment/photogenic/${vendorId.value}`),
        axios.get(`http://localhost:8082/comment/topcp/${vendorId.value}`)
    ]);

    Vendor.ratings = [
        { label: '超美味！', count: delicious.data, class: 'rating-taste' },
        { label: '超迅速！', count: quick.data, class: 'rating-speed' },
        { label: '超友善！', count: friendly.data, class: 'rating-friendliness' },
        { label: '超上相！', count: photogenic.data, class: 'rating-photo' },
        { label: '高CP值！', count: topCP.data, class: 'rating-value' },
    ];
}

// 取得評論
async function getComments() {
    const response = await axios.get(`http://localhost:8082/comment/byvendor/${vendorId.value}`);
    console.log("評論資料:" + response.data)
    const BASE_URL = "http://localhost:8082"; // 後端路徑根目錄

    Vendor.comments = response.data.map(c => ({
        user: c.userName,
        text: c.commentContext,
        images: [c.photo1, c.photo2, c.photo3]
            .filter(p => p) // 過濾掉 null / 空字串
            .map(p => `${BASE_URL}${p.startsWith('/') ? p : '/' + p}`) // 補上完整URL
    }));
}

// 監聽 route 變化，當 vendorId 改變時重新取得資料
import { watch } from 'vue'

watch(
    () => route.params.vendorId,
    (id) => {
        if (id) {
            vendorId.value = id
            getVendorData()
            getOpeningHours()
            getRatingSummary()
        }
    },
    { immediate: true }
)

// 點擊跳轉到地圖
function scrollToMap() {
    mapSection.value.scrollIntoView({ behavior: "smooth" })
}

const mapSection = ref(null)

// 評論區點及圖片放大


const activeImage = ref(null)

function showImage(imgUrl) {
    activeImage.value = imgUrl
}




</script>

<style scoped>
/* 全局樣式 */
.vendor-page {
    background: #fafafa;
    min-height: 100vh;
}

/* Hero 區塊 */
.hero-section {
    width: 100%;
    margin: 0 auto 10px;
    /* 加大底部距離，與主要內容區分開 */
    display: flex;
    justify-content: center;
    /* 讓內部內容水平置中 */
}

.banner-container {
    position: relative;
    width: 95%;
    /* 圖片不貼滿螢幕邊緣 */
    max-width: 1400px;
    height: 400px;
    overflow: hidden;
    border-radius: 12px;
    margin: 0 auto;
    /* 保證置中 */

}

.banner-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 12px;

}

.banner-dark {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.25);
    /* 輕度暗化 */
    z-index: 1;
}

.banner-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2;
    /* 確保文字在遮罩上方 */
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
    padding: 40px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.vendor-name {
    color: white;
    letter-spacing: 5px;
    font-size: 3.5rem;
    font-weight: bold;
    margin: 0;
    padding: 10px 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    background: rgba(247, 246, 246, 0.35);
    /* 淡霧面背景 */
    border-radius: 12px;
    /* 圓角 */
    backdrop-filter: blur(4px);
    /* 毛玻璃質感 */
}

.reserve-btn {
    background: linear-gradient(135deg, #6bcf8a, #4fb06e);
    color: white;
    border: none;
    padding: 15px 40px;
    border-radius: 50px;
    font-size: 1.2rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
    transition: all 0.3s ease;
}

.reserve-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 107, 107, 0.6);
}

/* 主要內容區 */
.main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px 40px;
}

.section {
    margin-bottom: 30px;
}

.section-title {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 3px solid #ff6b6b;
    display: inline-block;
}

/* 描述區 */
.description-section {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.description-text {
    font-size: 1.2rem;
    line-height: 1.8;
    color: #555;
    margin: 0;
}

/* 資訊與特性並排 */
.info-features-row {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 20px;
    margin-bottom: 30px;
}

.info-card,
.features-card {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-grid {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.info-item {
    display: flex;
    align-items: flex-start;
    gap: 15px;
}

.info-icon {
    font-size: 1.5rem;
    flex-shrink: 0;
}

.info-label {
    font-size: 0.85rem;
    color: #888;
    margin-bottom: 4px;
}

.info-value {
    font-size: 1rem;
    color: #333;
    font-weight: 500;
}

/* 特性標籤 */
.features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.feature-tag {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 15px;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.2s;
}

.feature-tag.available {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
}

.feature-tag.unavailable {
    background: #fafafa;
    color: #999;
    border: 1px solid #e0e0e0;
}

.feature-icon {
    font-weight: bold;
    font-size: 1.1rem;
}

/* 評價區 */
.rating-section {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.rating-tags {
    scale: 2em;
    display: flex;
    justify-content: center;
    /* 置中整個區塊 */
    flex-wrap: wrap;
    gap: 50px;
    /* 增加每個 rating-item 的間距 */
}

.rating-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    /* label 與數字間距 */
    border-radius: 20px;
    color: white;
    font-weight: bold;
    font-size: 1.1rem;
    /* 調整文字大小 */
    padding: 10px 20px;
    /* 調整上下左右內距 */
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.rating-taste {
    background: #e57373;
}

.rating-speed {
    background: #64b5f6;
}

.rating-friendliness {
    background: #81c784;
}

.rating-photo {
    background: #ba68c8;
}

.rating-value {
    background: #ffb74d;
}

.rating-number {
    background: #f5f5f5;
    /* 數字底色 */
    color: #666;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: bold;
    border: 1px solid #e0e0e0;
}

/* 菜單區塊（獨立滿版） */
.menu-section-full {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.menu-wrapper {
    width: 100%;
    overflow-x: auto;
}

/* 重置子組件可能的邊距和寬度問題 */
.menu-wrapper :deep(*) {
    max-width: 100%;
    box-sizing: border-box;
}

/* 優惠券區塊（獨立滿版） */
.products-section-full {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.products-wrapper {
    width: 100%;
    overflow-x: auto;
}

/* 重置子組件可能的邊距和寬度問題 */
.products-wrapper :deep(*) {
    max-width: 100%;
    box-sizing: border-box;
}

/* 針對子組件的 grid/flex 佈局調整 */
.products-wrapper :deep(.product-grid),
.products-wrapper :deep(.products-container) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

.menu-wrapper :deep(.menu-grid),
.menu-wrapper :deep(.menu-container) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
}

.cart-btn-container {
    margin-top: 25px;
    text-align: center;
    padding-top: 20px;
    border-top: 2px dashed #e0e0e0;
}

.cart-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #4caf50, #66bb6a);
    color: white;
    padding: 12px 30px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: bold;
    font-size: 1.05rem;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
    transition: all 0.3s ease;
}

.cart-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(76, 175, 80, 0.4);
}

/* 營業時間與地圖並排 */
.hours-map-row {
    display: grid;
    grid-template-columns: 0.8fr 1.2fr;
    gap: 20px;
    margin-bottom: 30px;
}

.hours-card,
.map-card {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.hours-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.hours-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: #f9f9f9;
    border-radius: 8px;
}

.day-name {
    font-weight: 600;
    color: #333;
}

.hours-time {
    color: #666;
}

.closed-tag {
    color: #999;
    font-style: italic;
}

.map-container {
    width: 100%;
    height: 320px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 評論區 */
.comments-section {
    background: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.comments-container {
    max-height: 500px;
    overflow-y: auto;
    padding-right: 10px;
}

.comments-container::-webkit-scrollbar {
    width: 8px;
}

.comments-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.comments-container::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 10px;
}

.comment-card {
    padding: 20px;
    margin-bottom: 15px;
    background: #fafafa;
    border-radius: 10px;
    border-left: 4px solid #ff6b6b;
}

.comment-card:last-child {
    margin-bottom: 0;
}

.comment-header {
    margin-bottom: 10px;
}

.comment-user {
    font-weight: 600;
    color: #333;
    font-size: 1rem;
}

.comment-text {
    color: #555;
    line-height: 1.6;
    margin: 10px 0;
}

.comment-images {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 12px;
}

.comment-img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid #e0e0e0;
    transition: transform 0.2s;
    cursor: pointer;
}

.comment-img:hover {
    transform: scale(1.05);
}

/* 放大圖片遮罩 */
.image-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.full-image {
    max-width: 90%;
    max-height: 90%;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    object-fit: contain;
}

/* 響應式設計 */
/* 響應式設計 */
@media (max-width: 1024px) {

    /* 評論圖片縮小 */
    .comment-img {
        width: 80px;
        height: 80px;
    }

    /* Info / Map */
    .info-features-row,
    .hours-map-row {
        grid-template-columns: 1fr;
    }

    /* 店名 */
    .vendor-name {
        font-size: 2rem;
    }

    /* Banner 內距 */
    .banner-overlay {
        padding: 20px;
    }

    /* 商品與菜單 */
    .products-wrapper :deep(.product-grid),
    .products-wrapper :deep(.products-container) {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }

    .menu-wrapper :deep(.menu-grid),
    .menu-wrapper :deep(.menu-container) {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
}

@media (max-width: 768px) {

    .banner-container {
        height: 300px;
    }

    .vendor-name {
        font-size: 1.5rem;
    }

    .reserve-btn {
        padding: 12px 25px;
        font-size: 1rem;
    }

    .features-grid {
        grid-template-columns: 1fr;
    }

    .products-wrapper :deep(.product-grid),
    .products-wrapper :deep(.products-container),
    .menu-wrapper :deep(.menu-grid),
    .menu-wrapper :deep(.menu-container) {
        grid-template-columns: 1fr;
    }
}
</style>