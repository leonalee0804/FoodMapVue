<template>
  <div class="vendor-comments-container">
    <div v-if="!loading" class="comments-card">
      <!-- 評論統計卡片 -->
      <div class="info-section-card">
        <div class="card-header">
          <div class="header-content">
            <i class="bi bi-chat-left-text header-icon"></i>
            <h2 class="header-title">顧客評論管理</h2>
          </div>
          <div class="stats-badge">
            <i class="bi bi-star-fill me-2"></i>
            <span>共 {{ comments.length }} 則評論</span>
          </div>
        </div>

        <div class="card-body">
          <!-- 評價標籤統計 -->
          <div class="tags-section">
            <h3 class="section-subtitle">
              <i class="bi bi-tags me-2"></i>評價標籤統計
            </h3>
            <div class="tags-grid">
              <div class="tag-item">
                <i class="bi bi-heart-fill tag-icon delicious"></i>
                <span class="tag-label">超美味</span>
                <span class="tag-count">{{ tagCounts.delicious }}</span>
              </div>
              <div class="tag-item">
                <i class="bi bi-lightning-fill tag-icon quick"></i>
                <span class="tag-label">超快速</span>
                <span class="tag-count">{{ tagCounts.quick }}</span>
              </div>
              <div class="tag-item">
                <i class="bi bi-emoji-smile-fill tag-icon friendly"></i>
                <span class="tag-label">超友善</span>
                <span class="tag-count">{{ tagCounts.friendly }}</span>
              </div>
              <div class="tag-item">
                <i class="bi bi-camera-fill tag-icon photogenic"></i>
                <span class="tag-label">超上相</span>
                <span class="tag-count">{{ tagCounts.photogenic }}</span>
              </div>
              <div class="tag-item">
                <i class="bi bi-currency-dollar tag-icon topcp"></i>
                <span class="tag-label">高CP值</span>
                <span class="tag-count">{{ tagCounts.topCP }}</span>
              </div>
            </div>
          </div>

          <!-- 評論列表 -->
          <div class="comments-section">
            <h3 class="section-subtitle">
              <i class="bi bi-chat-left-text me-2"></i>評論內容
            </h3>

            <!-- 無評論提示 -->
            <div v-if="comments.length === 0" class="empty-state">
              <i class="bi bi-inbox empty-icon"></i>
              <p class="empty-text">目前還沒有收到任何評論</p>
              <p class="empty-subtext">提供優質服務，獲得顧客好評吧！</p>
            </div>

            <!-- 評論卡片 -->
            <div v-else class="comments-list">
              <div
                v-for="comment in comments"
                :key="comment.commentId"
                class="comment-card"
              >
                <!-- 評論標題列 -->
                <div class="comment-header">
                  <div class="comment-info">
                    <i class="bi bi-person-circle user-icon"></i>
                    <span class="order-label">訂單 #{{ comment.orderId }}</span>
                  </div>
                  <span class="comment-date">{{
                    formatDate(comment.createAt)
                  }}</span>
                </div>

                <!-- 評論內容 -->
                <div class="comment-body">
                  <!-- 左邊：文字和標籤 -->
                  <div class="comment-content">
                    <p class="comment-text">{{ comment.commentContext }}</p>

                    <!-- 評論標籤 -->
                    <div v-if="hasAnyTag(comment)" class="comment-tags">
                      <span
                        v-if="comment.delicious"
                        class="tag-badge delicious"
                      >
                      超美味 !
                      </span>
                      <span v-if="comment.quick" class="tag-badge quick">
                      超快速 !
                      </span>
                      <span v-if="comment.friendly" class="tag-badge friendly">
                      超友善 !
                      </span>
                      <span
                        v-if="comment.photogenic"
                        class="tag-badge photogenic"
                      >
                      超上相 !
                      </span>
                      <span v-if="comment.topCP" class="tag-badge topcp">
                      高CP值 !
                      </span>
                    </div>
                  </div>
                    <!-- 評論圖片 -->
                    <div v-if="hasPhotos(comment)" class="comment-photos">
                      <img
                        v-if="comment.photo1"
                        :src="getPhotoPath(comment.photo1)"
                        alt="評論圖片1"
                        class="photo-thumbnail"
                        @click="openPhotoModal(getPhotoPath(comment.photo1))"
                      />
                      <img
                        v-if="comment.photo2"
                        :src="getPhotoPath(comment.photo2)"
                        alt="評論圖片2"
                        class="photo-thumbnail"
                        @click="openPhotoModal(getPhotoPath(comment.photo2))"
                      />
                      <img
                        v-if="comment.photo3"
                        :src="getPhotoPath(comment.photo3)"
                        alt="評論圖片3"
                        class="photo-thumbnail"
                        @click="openPhotoModal(getPhotoPath(comment.photo3))"
                      />
                    </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-else class="loading-container">
      <div class="spinner"></div>
      <p class="loading-text">載入評論中...</p>
    </div>

    <!-- 圖片預覽 Modal -->
    <div
      v-if="showPhotoModal"
      class="modal-overlay"
      @click.self="showPhotoModal = false"
    >
      <div class="photo-modal-content">
        <button @click="showPhotoModal = false" class="close-button">
          <i class="bi bi-x-lg"></i>
        </button>
        <img :src="selectedPhoto" alt="評論圖片" class="modal-photo" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "@/api/axiosInstance";

const vendor = ref(null);
const comments = ref([]);
const loading = ref(true);
const showPhotoModal = ref(false);
const selectedPhoto = ref("");

// 計算標籤數量
const tagCounts = computed(() => ({
  delicious: comments.value.filter((c) => c.delicious).length,
  quick: comments.value.filter((c) => c.quick).length,
  friendly: comments.value.filter((c) => c.friendly).length,
  photogenic: comments.value.filter((c) => c.photogenic).length,
  topCP: comments.value.filter((c) => c.topCP).length,
}));

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// 檢查是否有任何標籤
const hasAnyTag = (comment) => {
  return (
    comment.delicious ||
    comment.quick ||
    comment.friendly ||
    comment.photogenic ||
    comment.topCP
  );
};

// 檢查是否有圖片
const hasPhotos = (comment) => {
  return comment.photo1 || comment.photo2 || comment.photo3;
};

// 取得圖片路徑
const getPhotoPath = (filename) => {
  if (!filename) return "";
  // 如果已經是完整路徑就直接返回
  if (filename.startsWith("http")) return filename;
  // 否則加上後端路徑
  return `http://localhost:8082${filename}`;
};
// 開啟圖片預覽
const openPhotoModal = (photoUrl) => {
  selectedPhoto.value = photoUrl;
  showPhotoModal.value = true;
};

// 取得評論資料
onMounted(async () => {
  try {
    // 先取得店家自己的資料
    const res = await api.get("/vendor/self");
    vendor.value = res.data;
    console.log("取得的店家資料：", vendor.value);

    // 使用店家後台專用的 API（有 session 驗證）
    const response = await api.get(
      `/comment/commentVendor/${vendor.value.vendorId}`
    );
    comments.value = response.data;

    // 排序：有評論內容的在前，再按時間排序
    if (comments.value && comments.value.length > 0) {
      comments.value.sort((a, b) => {
        // 先判斷是否有評論內容
        const aHasComment = a.commentContext && a.commentContext.trim() !== "";
        const bHasComment = b.commentContext && b.commentContext.trim() !== "";

        // 有評論的排在前面
        if (aHasComment && !bHasComment) return -1;
        if (!aHasComment && bHasComment) return 1;

        // 都有或都沒有的話，按時間排序（最新的在前）
        return new Date(b.createAt) - new Date(a.createAt);
      });
    }

    console.log("取得評論成功，共", comments.value.length, "則");
  } catch (error) {
    console.error("取得資料失敗：", error);

    if (error.response?.status === 401) {
      alert("請先登入");
    } else if (error.response?.status === 403) {
      alert("無權查看評論");
    } else {
      alert("載入失敗，請稍後再試");
    }
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.vendor-comments-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.comments-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ==================== 卡片樣式 ==================== */
.info-section-card {
  background: #faf8f3;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(139, 117, 95, 0.08),
    0 2px 4px rgba(139, 117, 95, 0.05);
  overflow: hidden;
  border: 1px solid #e8dcc8;
}

/* ==================== 卡片標題 ==================== */
.card-header {
  background: linear-gradient(135deg, #d4b896 0%, #c9a882 100%);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
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

.stats-badge {
  display: flex;
  align-items: center;
  padding: 0.6rem 1.25rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

/* ==================== 卡片內容 ==================== */
.card-body {
  padding: 1.5rem;
}

/* ==================== 標籤統計區塊 ==================== */
.tags-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #e8dcc8;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #5a4a3a;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  font-weight: 600;
}

.section-subtitle i {
  color: #c9a882;
}

.tags-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

.tag-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f5f1ea 0%, #ede7dc 100%);
  border-radius: 12px;
  border: 2px solid #e8dcc8;
  transition: all 0.3s ease;
}

.tag-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 117, 95, 0.15);
}

.tag-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.tag-icon.delicious {
  color: #e57373;
}

.tag-icon.quick {
  color: #64b5f6;
}

.tag-icon.friendly {
  color: #81c784;
}

.tag-icon.photogenic {
  color: #ba68c8;
}

.tag-icon.topcp {
  color: #ffb74d;
}
.tag-label {
  font-size: 0.875rem;
  color: #5a4a3a;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.tag-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: #8b755f;
}

/* ==================== 評論列表 ==================== */
.comments-section {
  margin-top: 1.5rem;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-card {
  background: #ffffff;
  border: 2px solid #e8dcc8;
  border-radius: 12px;
  padding: 1.25rem;
  transition: all 0.3s ease;
}

.comment-card:hover {
  box-shadow: 0 4px 12px rgba(139, 117, 95, 0.12);
  border-color: #d4b896;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f5f1ea;
}

.comment-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-icon {
  font-size: 1.5rem;
  color: #c9a882;
}

.order-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #5a4a3a;
}

.comment-date {
  font-size: 0.875rem;
  color: #8b755f;
}

.comment-body {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: flex-start;
}
/* 文字區塊 */
.comment-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* 圖片區塊 */
.comment-photos {
  flex-shrink: 0;
  display: flex;
  flex-direction: column; /* 圖片垂直排列 */
  gap: 0.5rem;
  margin-top: 0; /* 移除原本的 margin-top */
}
.comment-text {
  font-size: 1rem;
  color: #5a4a3a;
  line-height: 1.6;
  margin: 0;
}

/* ==================== 評論標籤 ==================== */
.comment-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ffffff;
}

.tag-badge.delicious {
  background: linear-gradient(135deg, #e57373 0%, #ef5350 100%);
}

.tag-badge.quick {
  background: linear-gradient(135deg, #64b5f6 0%, #42a5f5 100%);
}

.tag-badge.friendly {
  background: linear-gradient(135deg, #81c784 0%, #66bb6a 100%);
}

.tag-badge.photogenic {
  background: linear-gradient(135deg, #ba68c8 0%, #ab47bc 100%);
}

.tag-badge.topcp {
  background: linear-gradient(135deg, #ffb74d 0%, #ffa726 100%);
}

/* ==================== 評論圖片 ==================== */

.photo-thumbnail {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e8dcc8;
  cursor: pointer;
  transition: all 0.3s ease;
}

.photo-thumbnail:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(139, 117, 95, 0.2);
  border-color: #c9a882;
}

/* ==================== 空狀態 ==================== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
  color: #d4b896;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1.125rem;
  color: #5a4a3a;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-subtext {
  font-size: 0.95rem;
  color: #8b755f;
  margin: 0;
}

/* ==================== 載入狀態 ==================== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-text {
  font-size: 1.125rem;
  color: #8b755f;
  margin: 0;
}

.spinner {
  width: 3rem;
  height: 3rem;
  border: 0.3rem solid #f5f1ea;
  border-top-color: #c9a882;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ==================== 圖片預覽 Modal ==================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.photo-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-photo {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.close-button {
  position: absolute;
  top: -3rem;
  right: 0;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  color: #5a4a3a;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 50px;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.close-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

/* ==================== 響應式設計 ==================== */
@media (max-width: 992px) {
  .tags-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .vendor-comments-container {
    padding: 1rem;
  }

  .card-header {
    padding: 1rem 1.5rem;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .stats-badge {
    width: 100%;
    justify-content: center;
  }

  .header-title {
    font-size: 1.25rem;
  }

  .card-body {
    padding: 1rem;
  }

  .tags-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .comment-photos {
    flex-direction: row; /* 小螢幕時圖片水平排列 */
    flex-wrap: wrap;
  }

  .photo-thumbnail {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 576px) {
  .tags-grid {
    grid-template-columns: 1fr;
  }

  .comment-photos {
    gap: 0.5rem;
    flex-direction: row; /* 加這行 */
  }

  .photo-thumbnail {
    width: calc(33.333% - 0.33rem);
    height: auto;
    aspect-ratio: 1;
  }
}
</style>
