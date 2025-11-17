<template>
    <div>
        <!-- 導覽列 -->
        <Header />
        <br>
        <div class="container">
            <div class="card" v-for="v in paginatedVendors" :key="v.vendorId" @click="handleCardClick(v.vendorId)">
                <div class="favorite-btn" @click.stop="toggleFavorite(v)">
                    <i :class="v.isFavorited ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
                </div>
                <img :src="IMAGE_BASE_URL + `${v.logoUrl}`" alt="Logo" />
                <div class="card-content">
                    <h3>{{ v.vendorName }}</h3>
                    <p><i class="bi bi-geo-alt"></i> {{ v.address }}</p>
                    <p><i class="bi bi-telephone"></i> {{ v.contactTel }}</p>
                    <p v-if="v.styleName">
                        <i class="bi bi-shop"></i> {{ v.styleName }}
                    </p>

                    <p v-if="v.openingTime && v.closingTime">
                        <i class="bi bi-clock"></i>
                        營業時間：{{ formatTime(v.openingTime) }} - {{ formatTime(v.closingTime) }}
                    </p>
                    <p v-else>
                        <i class="bi bi-clock"></i>
                        營業時間：暫無資料
                    </p>

                    <p v-if="v.closedDays">
                        <i class="bi bi-calendar-x"></i>
                        公休：{{ v.closedDays }}
                    </p>
                </div>
            </div>

            <!-- 沒結果時顯示 -->
            <p v-if="vendors.length === 0" class="no-result">
                沒有符合的結果
            </p>
        </div>
        <!-- 分頁按鈕 -->
        <div v-if="totalPages > 1" class="pagination">
            <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">
                上一頁
            </button>

            <button v-for="page in totalPages" :key="page" :class="{ active: page === currentPage }"
                @click="changePage(page)">
                {{ page }}
            </button>

            <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">
                下一頁
            </button>
        </div>

        <!-- 回首頁 -->
        <RouterLink to="/" class="back-btn">回首頁</RouterLink>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import axiosapi from "@/plugins/axios";
import { computed } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import { useUserStore } from "@/stores/user";
const route = useRoute();
const router = useRouter();
const vendors = ref([]);
const IMAGE_BASE_URL = "http://localhost:8082/Vendor_Pic/";
// --- 分頁控制 ---
const currentPage = ref(1);
const itemsPerPage = 12;

// function goToVendor(id) {
//     router.push(`/vendor/${id}`);
// }

const paginatedVendors = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return vendors.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(vendors.value.length / itemsPerPage));

function changePage(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        window.scrollTo({ top: 0, behavior: "smooth" }); // 捲回頁首
    }
}

// --- 載入搜尋結果 ---
async function fetchVendors() {
    try {
        const params = {
            keyword: route.query.keyword || null,
            styleId: route.query.styleId || null,
            city: route.query.city || null,
            userMinPrice: route.query.userMinPrice || null,
            userMaxPrice: route.query.userMaxPrice || null,
            timeSlot: route.query.timeSlot || null,
            airConditioner: route.query.airConditioner || null,
            veganFriendly: route.query.veganFriendly || null,
            petFriendly: route.query.petFriendly || null,
        };

        if (params.userMinPrice) params.userMinPrice = Number(params.userMinPrice);
        if (params.userMaxPrice) params.userMaxPrice = Number(params.userMaxPrice);

        const res = await axiosapi.get("/vendors/search", { params });
        console.log("後端回傳資料：", res.data);
        vendors.value = res.data;
        console.log("搜尋結果：", vendors.value);
    } catch (err) {
        console.error("載入搜尋結果失敗：", err);
    }
}

watch(
    () => route.query,
    () => {
        fetchVendors();
    },
    { immediate: true }
);

function formatTime(timeStr) {
    if (!timeStr) return "";
    return timeStr.substring(0, 5);
}

// -------------------------------
// 收藏功能整合 Pinia 版本
// -------------------------------
const userStore = useUserStore();

// 登入狀態與黑名單
const isLoggedIn = computed(() => !!userStore.user);
const isBlacklisted = computed(() => userStore.isBlacklisted);

// 收藏 / 取消收藏
const toggleFavorite = async (vendor) => {
    if (!isLoggedIn.value) {
        Swal.fire("帳號未啟用或未登入，無法收藏", "", "warning");
        return;
    }

    if (!vendor.isFavorited) {
        const result = await Swal.fire({
            title: "確認加入收藏？",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "加入收藏",
            cancelButtonText: "取消",
        });
        if (result.isConfirmed) {
            try {
                const res = await axiosapi.post("/favorites/my", { vendorID: vendor.vendorId });
                vendor.isFavorited = true;
                vendor.favoriteID = res.data.favoriteID;
                Swal.fire("已加入收藏", "", "success");
            } catch (error) {
                const message = error.response?.data?.message || "加入收藏失敗";

                if (message.includes("已收藏過")) {
                    Swal.fire("已收藏過此店家", "", "warning");
                } else if (message.includes("尚未登入")) {
                    Swal.fire("請先登入再收藏", "", "info");
                } else {
                    Swal.fire(message, "", "error");
                }
            }
        }
    } else {
        const result = await Swal.fire({
            title: "確認取消收藏？",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "是，取消收藏",
            cancelButtonText: "取消",
        });
        if (result.isConfirmed) {
            try {
                await axiosapi.delete(`/favorites/my/vendorid/${vendor.vendorId}`);
                vendor.isFavorited = false;
                vendor.favoriteID = null;
                Swal.fire("已取消收藏！", "", "success");
            } catch {
                Swal.fire("取消收藏失敗", "", "error");
            }
        }
    }

};

// 卡片點擊：新增瀏覽紀錄 + 導向店家頁面

const handleCardClick = async (vendorId) => {
    try {
        if (isLoggedIn.value) {

            const res = await axiosapi.post("/lookhistory/add", { vendorId });
            console.log("瀏覽紀錄已新增:");
            console.log(res.data);

        } else {
            console.log("未登入，略過瀏覽紀錄");

        }
    } catch (err) {
        console.error("新增瀏覽紀錄失敗：", err);
    }
    router.push(`/vendor/${vendorId}`);
};
</script>


<style>
@font-face {
    font-family: "Yozai";
    src: url("/fonts/Yozai-Light.ttf") format("truetype");
    font-weight: 300;
    font-style: normal;
}

body {
    margin: 0;
    font-family: "Microsoft JhengHei", sans-serif;
    background: url("/images/durban_06.webp") repeat;
    background-size: 300px 300px;
    color: #333;
    padding-top: 80px;
}

h2 {
    text-align: center;
    margin: 20px;
    color: #333;
}

.container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    padding: 20px;
}

.card {
    background: white;
    border-radius: 10px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
    width: 280px;
    overflow: hidden;
    transition: transform 0.2s;
}

.card:hover {
    transform: translateY(-5px);
}

.card img {
    width: 100%;
    height: 180px;
    object-fit: cover;
}

.card-content {
    padding: 15px;
}

.card-content h3 {
    margin: 0 0 10px;
    font-size: 18px;
    color: #d2691e;
}

.card-content p {
    margin: 5px 0;
    font-size: 14px;
    color: #555;
}

.card {
    cursor: pointer;
    transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}

.no-result {
    text-align: center;
    width: 100%;
    font-size: 16px;
}

.back-btn {
    display: block;
    margin: 20px auto;
    padding: 10px 20px;
    background: #d2691e;
    color: white;
    text-decoration: none;
    border-radius: 20px;
    text-align: center;
    width: 120px;
}

.search-bar-container {
    position: relative;
    margin: 0 auto;
    padding: 10px 0;
    width: 100%;
    background-color: rgba(255, 248, 240, 0.95);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}


.search-bar-container .search-overlay {
    position: static;
    transform: none;
    width: 95%;
    max-width: 1200px;
    margin: 0 auto;
    background: transparent;
    padding: 0;
    box-shadow: none;
}


.search-bar-container form {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    background: #fffaf3;
    border-radius: 40px;
    padding: 8px 15px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
}


.search-bar-container input[type="text"],
.search-bar-container select {
    height: 40px;
    border: none;
    outline: none;
    border-radius: 25px;
    padding: 0 15px;
    font-size: 15px;
    background: transparent;
}

/* 搜尋按鈕 */
.search-bar-container button[type="submit"] {
    background: #d2691e;
    color: white;
    border: none;
    border-radius: 25px;
    padding: 6px 18px;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
}

.search-bar-container button[type="submit"]:hover {
    background: #b55318;
}

.search-bar-container button[type="button"] {
    background: #fff;
    color: #d2691e;
    border: 1px solid #d2691e;
    border-radius: 25px;
    padding: 6px 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
}

.search-bar-container button[type="button"]:hover {
    background: #d2691e;
    color: #fff;
}

/* ============================
      分頁按鈕樣式
============================ */
.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    margin: 20px 0;
    flex-wrap: wrap;
}

.pagination button {
    background-color: #fffaf3;
    border: 1px solid #d2691e;
    color: #d2691e;
    border-radius: 6px;
    padding: 5px 12px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
    background-color: #d2691e;
    color: #fff;
}

.pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination button.active {
    background-color: #d2691e;
    color: white;
    font-weight: bold;
    border-color: #b55318;
}

/* ============================
      收藏按鈕樣式
============================ */
.card {
    position: relative;
}

.favorite-btn {
    position: absolute;
    top: 10px;
    right: 12px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    padding: 6px;
    cursor: pointer;
    transition: all 0.2s;
    z-index: 2;
}

.favorite-btn i {
    font-size: 20px;
    color: #d2691e;
}

.favorite-btn:hover {
    background-color: #ffe7d2;
}

.bi-heart-fill {
    color: #ff4b4b;
}
</style>
