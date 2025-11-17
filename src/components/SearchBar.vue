<template>
    <div class="search-overlay">
        <form @submit.prevent="searchVendors">
            <!-- 關鍵字 -->
            <input type="text" v-model="keyword" placeholder="輸入餐廳或關鍵字..." />

            <!-- 風格單選 -->
            <FilterDropdown title="風格" :options="styleOptions" v-model="selectedStyle" />

            <!-- 地區單選 -->
            <FilterDropdown title="地區" :options="cityOptions" v-model="selectedCity" />

            <!-- 搜尋與進階搜尋按鈕 -->
            <button type="submit">搜尋</button>
            <button type="button" @click="showAdvanced = true">進階搜尋</button>
        </form>
    </div>

    <!-- 進階搜尋 Modal -->
    <AdvancedSearchModal :show="showAdvanced" :modelValue="advancedFilters"
        @update:modelValue="Object.assign(advancedFilters, $event)" @close="showAdvanced = false"
        @apply="applyAdvancedSearch" />
</template>

---

<script setup>
import { ref, onMounted } from "vue";
import axiosapi from "@/plugins/axios";
import { useRouter } from "vue-router";
import AdvancedSearchModal from "@/components/AdvancedSearchModal.vue";
import FilterDropdown from "@/components/FilterDropdown.vue";

const router = useRouter();

// === 基本搜尋條件 ===
const keyword = ref("");
const selectedStyle = ref("");
const selectedCity = ref("");

const styleOptions = ref([]);
const cityOptions = [
    { value: "台北市", label: "台北市" },
    { value: "新北市", label: "新北市" },
    { value: "桃園市", label: "桃園市" },
    { value: "台中市", label: "台中市" },
    { value: "台南市", label: "台南市" },
    { value: "高雄市", label: "高雄市" },
];

// === 進階搜尋條件 ===
const showAdvanced = ref(false);
const advancedFilters = ref({
    priceRange: "",
    timeSlot: "",
    airConditioner: false,
    veganFriendly: false,
    petFriendly: false,
});

// 載入風格下拉
async function fetchStyles() {
    try {
        const res = await axiosapi.get("/vendors/styles");
        styleOptions.value = res.data.map(s => ({
            value: s.styleId,
            label: s.styleName
        }));
    } catch (err) {
        console.error("載入風格失敗：", err);
    }
}

// === 統一搜尋（同時支援基本 + 進階）===
function searchVendors() {
    // 將進階搜尋條件一併打包
    const filters = advancedFilters.value;
    let userMinPrice = null;
    let userMaxPrice = null;

    if (filters.priceRange) {
        const [min, max] = filters.priceRange.split("-").map(v => parseInt(v));
        userMinPrice = isNaN(min) ? 0 : min;
        userMaxPrice = isNaN(max) ? 999999 : max;
    }

    const params = {
        keyword: keyword.value || "",
        city: selectedCity.value || "",
        styleId: selectedStyle.value || "",
        userMinPrice,
        userMaxPrice,
        timeSlot: filters.timeSlot || "",
    };

    // 只加入「true」的條件（不傳 false）
    if (filters.airConditioner) params.airConditioner = true;
    if (filters.veganFriendly) params.veganFriendly = true;
    if (filters.petFriendly) params.petFriendly = true;

    router.push({ path: "/search", query: params });
}

// === 進階搜尋 Modal 套用（會呼叫同一個搜尋函式）===
function applyAdvancedSearch(filters) {
    showAdvanced.value = false;
    Object.assign(advancedFilters.value, filters);
}

onMounted(fetchStyles);
</script>

---

<style scoped>
/* === 搜尋列樣式 === */
.search-overlay {
    position: absolute;
    top: 80%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    background: rgba(255, 250, 245, 0.95);
    border-radius: 50px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
    padding: 14px 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(6px);
    z-index: 50;
}

.search-overlay form {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
}

.search-overlay input[type="text"] {
    flex: 2;
    min-width: 400px;
    height: 48px;
    border: 2px solid #d2691e;
    border-radius: 25px;
    padding: 0 20px;
    font-size: 1.05rem;
    background-color: #fffdf9;
    transition: all 0.25s ease;
}

.search-overlay input[type="text"]:focus {
    outline: none;
    border-color: #b55318;
    box-shadow: 0 0 6px rgba(210, 105, 30, 0.3);
}

/* 篩選按鈕與下拉 */
.search-overlay :deep(.filter-btn) {
    height: 48px;
    border-radius: 25px;
    border: 2px solid #d2691e;
    background-color: #fffaf3;
    color: #d2691e;
    font-weight: 600;
    font-size: 1rem;
    padding: 0 18px;
    transition: all 0.2s ease;
}

.search-overlay :deep(.filter-btn:hover) {
    background-color: #fff3e0;
    box-shadow: 0 2px 6px rgba(210, 105, 30, 0.25);
}

/* 搜尋按鈕 */
.search-overlay button[type="submit"] {
    background-color: #d2691e;
    color: #fff;
    font-weight: 600;
    font-size: 1rem;
    padding: 0 26px;
    height: 48px;
    border: none;
    border-radius: 25px;
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
    box-shadow: 0 3px 8px rgba(210, 105, 30, 0.3);
}

.search-overlay button[type="submit"]:hover {
    background-color: #b55318;
    transform: translateY(-1px);
}

/* 進階搜尋按鈕 */
.search-overlay button[type="button"] {
    background-color: #fffaf3;
    color: #d2691e;
    border: 2px solid #d2691e;
    font-weight: 600;
    font-size: 1rem;
    padding: 0 22px;
    height: 48px;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.25s;
}

.search-overlay button[type="button"]:hover {
    background-color: #fff2e0;
    box-shadow: 0 2px 8px rgba(210, 105, 30, 0.25);
}

/* RWD */
@media (max-width: 992px) {
    .search-overlay {
        width: 95%;
        border-radius: 25px;
        flex-direction: column;
        padding: 18px;
    }

    .search-overlay form {
        flex-direction: column;
        gap: 10px;
    }

    .search-overlay input[type="text"],
    .search-overlay button {
        width: 100%;
    }
}
</style>
