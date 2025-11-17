<template>
    <section v-if="vendors.length" class="guess-section">
        <div class="guess-container">
            <h2>猜你喜歡</h2>
            <div class="vendor-grid">
                <div v-for="v in vendors" :key="v.vendorId" class="vendor-card" @click="goToVendor(v.vendorId)">
                    <img :src="IMAGE_BASE_URL + `${v.logoUrl}`" :alt="v.vendorName" class="vendor-img" />
                    <div class="vendor-info">
                        <h3>{{ v.vendorName }}</h3>
                        <p class="style">{{ v.styleName }}</p>
                        <p class="score">推薦分數：{{ v.score }}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>


<script setup>
import { ref, onMounted } from "vue";
import axiosapi from "@/plugins/axios";
import { useRouter } from "vue-router";

const vendors = ref([]);
const router = useRouter();
const IMAGE_BASE_URL = "http://localhost:8082/Vendor_Pic/";

onMounted(async () => {
    try {
        const res = await axiosapi.get("/recommend/personal", { withCredentials: true });
        console.log("後端回傳資料:", res.data[0]);
        vendors.value = res.data.map(v => ({
            vendorId: v.VendorID,
            vendorName: v.VendorName,
            logoUrl: v.LogoURL,
            styleName: v.StyleName,
            score: v.score
        }));
    } catch (err) {
        console.error("取得推薦資料失敗：", err);
    }
});

const goToVendor = (id) => {
    router.push({ name: 'VendorPage', params: { vendorId: id } });
};
</script>

<style scoped>
.guess-section {
    padding: 2rem 0;
}

.guess-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
}

.guess-section h2 {
    text-align: left;
    margin: 50px 0 25px 40px;
    font-family: "YozaiLight", "Microsoft JhengHei", "Noto Sans TC", sans-serif;
    font-weight: 700;
    font-size: 3.0rem;
    color: #5b4636;
    position: relative;
    display: inline-block;
}

/* 底線樣式 */
.guess-section h2::after {
    content: "";
    display: block;
    width: 400px;
    height: 4px;
    background: linear-gradient(to right, #d2691e, #e8a96b);
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(210, 105, 30, 0.3);
    margin-top: 8px;
}


.vendor-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.8rem;
    padding: 0 2rem;
    align-items: stretch;
    /* 讓每張卡片撐滿等高 */
}

.vendor-card {
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    display: flex;
    flex-direction: column;
    /* 讓圖片與文字垂直排列 */
    height: 100%;
    /* 撐滿格子高度 */
}

.vendor-card:hover {
    transform: translateY(-4px);
}

.vendor-img {
    width: 100%;
    height: 160px;
    /* 統一圖片高度 */
    object-fit: cover;
}

.vendor-info {
    flex-grow: 1;
    padding: 0.8rem 1rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.vendor-info h3 {
    font-size: 1.1rem;
    color: #333;
    margin: 0.3rem 0;
    word-break: keep-all;
}

.style {
    font-size: 0.9rem;
    color: #777;
    margin-bottom: 0.3rem;
}

.score {
    font-size: 0.85rem;
    color: #d2691e;
    font-weight: 500;
}

/* RWD */
@media (max-width: 992px) {
    .vendor-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .vendor-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 480px) {
    .vendor-grid {
        grid-template-columns: 1fr;
    }
}
</style>
