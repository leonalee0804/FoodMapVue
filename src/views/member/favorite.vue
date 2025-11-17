<template>


      <!-- 側邊欄 -->
      <MemberSidebar @logout="logout" />

  <div class="favorites-page">

    <div class="container py-3">

      <!-- 標題 -->
      <div class="favorites-header text-center mb-4">
        <h2 class="section-title">
          <i class="bi bi-heart-fill text-danger me-2"></i> 我的收藏
        </h2>
      </div>

      <!-- 篩選區 -->
      <div class="favorites-filter">

        <!-- 店名搜尋 -->
        <input v-model="searchKeyword" type="text" placeholder="輸入店名關鍵字..." class="filter-input" />

        <!-- 風格下拉選單 -->
        <select v-model="selectedStyle" class="filter-select">
          <option value="">全部風格</option>
          <option v-for="style in styleOptions" :key="style" :value="style">
            {{ style }}
          </option>
        </select>

        <!-- 搜尋按鈕 -->
        <button class="filter-btn" @click="applyFilter">
          <i class="bi bi-search"></i> 搜尋
        </button>
      </div>




      <!-- 無收藏提示 -->
      <div v-if="allFavorites.length === 0" class="no-fav text-center">
        <p>目前還沒有收藏的店家，快去探索美食吧！</p>
      </div>

      <!-- 收藏清單 -->
      <ul v-else class="favorite-list">
        <li v-for="fav in pagedFavorites" :key="fav.favoriteID" class="favorite-item">
          <div class="vendor-info" @click="goToVendor(fav.vendorId)">
            <img :src="IMAGE_BASE_URL + `${fav.logoUrl}`" :alt="fav.vendorName" class="vendor-img" />
            <div>
              <h5 class="vendor-name">{{ fav.vendorName }}</h5>
              <p class="vendor-style">{{ fav.styleName || '無分類' }}</p>
            </div>
          </div>

          <button class="remove-btn" @click="removeFavorite(fav.favoriteID)">
            <i class="bi bi-heart-fill"></i> 取消收藏
          </button>
        </li>
      </ul>

      <!-- 分頁 -->
      <paginate v-if="totalPages > 1" :page-count="totalPages" :click-handler="goPage" :prev-text="'‹'" :next-text="'›'"
        :container-class="'pagination justify-content-center mt-4'" :page-class="'page-item'"
        :page-link-class="'page-link'" :prev-class="'page-item'" :prev-link-class="'page-link'"
        :next-class="'page-item'" :next-link-class="'page-link'" :active-class="'active'"></paginate>

    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from "vue";
import axiosapi from "@/plugins/axios";
import Swal from "sweetalert2";
import Paginate from "vuejs-paginate-next";
import { useRouter } from "vue-router";
import MemberSidebar from "@/components/member/memberSidebar.vue";

const router = useRouter();
const IMAGE_BASE_URL = "http://localhost:8082/Vendor_Pic/";

/* ---------------- 收藏資料與分頁 ---------------- */
const allFavorites = ref([]);
const currentPage = ref(1);
const pageSize = ref(5);

/* ---------------- 搜尋與篩選條件 ---------------- */
const searchKeyword = ref(""); // 店名關鍵字
const selectedStyle = ref(""); // 選擇的風格

// 從收藏資料自動提取風格選項（避免寫死）
const styleOptions = computed(() => {
  const styles = allFavorites.value.map((f) => f.styleName || "未分類");
  return [...new Set(styles)]; // 去重複
});

/* ---------------- 方法 ---------------- */

// 載入收藏資料
const loadFavorites = async () => {
  try {
    const { data } = await axiosapi.get("/favorites/my");
    allFavorites.value = data;
  } catch {
    Swal.fire("取得收藏列表失敗", "", "error");
  }
};

// 套用搜尋條件（目前只用來回到第一頁）
const applyFilter = () => {
  currentPage.value = 1;
};

// 篩選收藏清單（依店名與風格）
const filteredFavorites = computed(() => {
  return allFavorites.value.filter((f) => {
    const matchName =
      !searchKeyword.value ||
      f.vendorName.toLowerCase().includes(searchKeyword.value.toLowerCase());
    const matchStyle =
      !selectedStyle.value ||
      f.styleName === selectedStyle.value ||
      (selectedStyle.value === "未分類" && !f.styleName);
    return matchName && matchStyle;
  });
});

// 分頁
const pagedFavorites = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredFavorites.value.slice(start, start + pageSize.value);
});

const totalPages = computed(() =>
  Math.ceil(filteredFavorites.value.length / pageSize.value)
);

const goPage = (page) => (currentPage.value = page);

/* ---------------- 其他操作 ---------------- */

// 點擊進入店家頁面
const goToVendor = (vendorId) => {
  router.push(`/vendor/${vendorId}`);
};

// 取消收藏
const removeFavorite = async (favoriteID) => {
  const result = await Swal.fire({
    title: "確認取消收藏？",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "是，取消收藏",
    cancelButtonText: "取消",
  });
  if (!result.isConfirmed) return;

  try {
    await axiosapi.delete(`/favorites/my/favoriteid/${favoriteID}`);
    Swal.fire("已取消收藏！", "", "success");
    await loadFavorites();
  } catch {
    Swal.fire("取消收藏失敗", "", "error");
  }
};

// 初次載入
onMounted(loadFavorites);
</script>



<style scoped>
.favorites-page {
  min-height: 100vh;
  padding: 60px 0;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  margin-top: -970px;
  margin-left: 400px;
  
}

/* --- 標題與篩選列 --- */
/* --- 標題區固定居中 --- */
.favorites-header {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  height: 80px;
  /* 給固定高度避免字體載入時晃動 */
  margin-bottom: 3rem;
}

/* --- 標題本體 --- */
.section-title {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  /* icon 與文字間距 */
  font-family: "Yozai", "Microsoft JhengHei", sans-serif;
  color: #d2691e;
  font-weight: bold;
  font-size: 2rem;
  text-align: center;
  line-height: 1;
  transition: none;
  user-select: none;
  transform: translateY(0);
}

/* --- icon 固定高度，避免初載入跳動 --- */
.section-title i {
  width: 1.6rem;
  height: 1.6rem;
  font-size: 1.6rem;
  line-height: 1.6rem;
  display: inline-block;
  text-align: center;
  color: #d2691e;
}

.favorites-header {
  margin-bottom: 0.1rem !important;
  height: auto;
}

.favorites-filter {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 2rem;
  margin: 1rem 40px 2rem;
}

.filter-select {
  border-radius: 8px;
  padding: 6px 12px;
  border: 1px solid #ccc;
  background-color: #fff;
}

/* --- 收藏清單 --- */
.favorite-list {
  list-style: none;
  padding: 0;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 單筆收藏條列 */
.favorite-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fffdf9;
  border-radius: 14px;
  padding: 20px 30px;
  width: 600px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
  margin-left: 230px;
}

.favorite-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  background-color: #fff8f0;
}

/* 店家資訊（圖片+文字） */
.vendor-info {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
  cursor: pointer;
}

.vendor-img {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
}

.vendor-name {
  font-weight: bold;
  font-size: 1.3rem;
  color: #3a2d20;
  margin-bottom: 6px;
}

.vendor-style {
  font-size: 1rem;
  color: #7a7a7a;
}

/* 按鈕靠右對齊 */
.remove-btn {
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 22px;
  font-size: 1rem;
  transition: background 0.2s;
  white-space: nowrap;
}

.remove-btn:hover {
  background-color: #e74c3c;
}

/* --- 無收藏提示 --- */
.no-fav {
  text-align: center;
  margin-top: 80px;
  /* 跟收藏清單距離差不多 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* --- 分頁樣式 --- */
.pagination {
  margin-top: 40px;
}

.pagination .page-link {
  color: #d2691e;
  border: none;
}

.pagination .active .page-link {
  background-color: #d2691e;
  color: white;
  border-radius: 8px;
}


/* ============================
   搜尋篩選區塊樣式
   ============================ */
.favorites-filter {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1rem;
  margin: 1rem 40px 2rem;
  flex-wrap: wrap;
  background: #fffdf9;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

/* 輸入框 */
.filter-input {
  flex: 1;
  min-width: 240px;
  padding: 10px 14px;
  font-size: 1rem;
  color: #3a2d20;
  border: 1.5px solid #e5d2b8;
  border-radius: 8px;
  background-color: #fffdf8;
  transition: all 0.2s ease;
}

.filter-input:focus {
  outline: none;
  border-color: #d2691e;
  box-shadow: 0 0 0 3px rgba(210, 105, 30, 0.15);
}

/* 下拉選單 */
.filter-select {
  padding: 10px 14px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1.5px solid #e5d2b8;
  background-color: #fffdf8;
  color: #3a2d20;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #d2691e;
}

/* 搜尋按鈕 */
.filter-btn {
  background-color: #d2691e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-btn i {
  font-size: 1.1rem;
}

.filter-btn:hover {
  background-color: #b85618;
  transform: translateY(-1px);
}

/* 響應式調整 */
@media (max-width: 768px) {
  .favorites-filter {
    flex-direction: column;
    align-items: stretch;
    margin: 1rem 20px 2rem;
  }

  .filter-input,
  .filter-select,
  .filter-btn {
    width: 100%;
  }
}
</style>