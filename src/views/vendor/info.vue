<template>
  <div class="vendor-info-container" v-if="vendor">
    <!-- 主要資訊卡片 -->
    <div class="info-card">
      <div class="card-header">
        <div class="header-content">
          <i class="bi bi-shop-window header-icon"></i>
          <h2 class="header-title">基本資料</h2>
        </div>
        <span class="status-badge" :class="getStatusClass(vendor.vdStatus)">
          {{ vendor.vdStatus }}
        </span>
      </div>

      <div class="card-body">
        <div class="content-layout">
          <!-- 左側：文字資訊 -->
          <div class="info-section">
            <div class="info-grid">
              <div class="info-item">
                <label class="info-label">
                  <i class="bi bi-shop me-2"></i>店家名稱
                </label>
                <p class="info-value">{{ vendor.vendorName }}</p>
              </div>

              <!-- <div class="info-item">
                <label class="info-label">
                  <i class="bi bi-file-text me-2"></i>統一編號
                </label>
                <p class="info-value">{{ vendor.taxID }}</p>
              </div> -->

              <div class="info-item">
                <label class="info-label">
                  <i class="bi bi-person-badge me-2"></i>負責人
                </label>
                <p class="info-value">{{ vendor.ownerName }}</p>
              </div>

              <div class="info-item">
                <label class="info-label">
                  <i class="bi bi-person me-2"></i>聯絡人
                </label>
                <p class="info-value">{{ vendor.contactName }}</p>
              </div>

              <div class="info-item">
                <label class="info-label">
                  <i class="bi bi-briefcase me-2"></i>職稱
                </label>
                <p class="info-value">{{ vendor.contactTitle }}</p>
              </div>

              <div class="info-item">
                <label class="info-label">
                  <i class="bi bi-telephone me-2"></i>聯絡電話
                </label>
                <p class="info-value">{{ vendor.contactTel }}</p>
              </div>

              <div class="info-item">
                <label class="info-label">
                  <i class="bi bi-envelope me-2"></i>聯絡信箱
                </label>
                <p class="info-value">{{ vendor.contactEmail }}</p>
              </div>

              <div class="info-item full-width">
                <label class="info-label">
                  <i class="bi bi-geo-alt me-2"></i>地址
                </label>
                <p class="info-value">{{ vendor.address }}</p>
              </div>
            </div>
          </div>

          <!-- 右側：Logo -->
          <div class="logo-section" v-if="vendor.logoURL">
            <div class="logo-wrapper">
              <img
                :src="getLogoPath(vendor.logoURL)"
                alt="店家Logo"
                class="vendor-logo"
              />
              <div class="logo-overlay">
                <i class="bi bi-image"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 地圖卡片 -->
    <div class="map-card" v-if="vendor.mapApi">
      <div class="card-header">
        <div class="header-content">
          <i class="bi bi-map header-icon"></i>
          <h2 class="header-title">店家位置</h2>
        </div>
      </div>

      <div class="card-body">
        <div class="map-wrapper">
          <iframe
            :src="'https://www.google.com/maps/embed?pb=' + vendor.mapApi"
            width="100%"
            height="400"
            style="border: 0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
          >
          </iframe>
        </div>
      </div>
    </div>
  </div>

  <!-- 載入狀態 -->
  <div v-else class="loading-container">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">載入中...</span>
    </div>
    <p class="loading-text">載入中...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api/axiosInstance";

const vendor = ref(null);

const getLogoPath = (filename) => {
  return `http://localhost:8082/Vendor_Pic/${filename}`;
};

const getStatusClass = (status) => {
  const statusMap = {
    '營業中': 'status-active',
    '已暫停': 'status-paused',
    '已關閉': 'status-closed',
  };
  return statusMap[status] || 'status-default';
};

onMounted(async () => {
  try {
    const res = await api.get("/vendor/self");
    vendor.value = res.data;
    console.log("取得的資料：", vendor.value);
  } catch (error) {
    console.error("取得廠商資料失敗：", error);
  }
});
</script>

<style scoped>
.vendor-info-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ==================== 卡片樣式 ==================== */
.info-card,
.map-card {
  background: #faf8f3;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(139, 117, 95, 0.08), 0 2px 4px rgba(139, 117, 95, 0.05);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #e8dcc8;
}

.info-card:hover,
.map-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(139, 117, 95, 0.12), 0 4px 8px rgba(139, 117, 95, 0.08);
}

/* ==================== 卡片標題 ==================== */
.card-header {
  background: linear-gradient(135deg, #d4b896 0%, #c9a882 100%);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

/* ==================== 狀態標籤 ==================== */
.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  background-color: rgba(255, 255, 255, 0.9);
}

.status-active {
  color: #6b8e4e;
  border: 2px solid #8db86a;
}

.status-paused {
  color: #c9983e;
  border: 2px solid #d4b078;
}

.status-closed {
  color: #b87171;
  border: 2px solid #c99090;
}

.status-default {
  color: #8b755f;
  border: 2px solid #a89179;
}

/* ==================== 卡片內容 ==================== */
.card-body {
  padding: 2rem;
}

.content-layout {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
}

/* ==================== 資訊區塊 ==================== */
.info-section {
  flex: 1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #8b755f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  margin: 0;
}

.info-label i {
  color: #c9a882;
}

.info-value {
  font-size: 1rem;
  color: #5a4a3a;
  margin: 0;
  padding: 0.75rem;
  background-color: #f5f1ea;
  border-radius: 8px;
  border-left: 3px solid #d4b896;
  transition: background-color 0.2s ease;
}

.info-value:hover {
  background-color: #ede7dc;
}

/* ==================== Logo 區塊 ==================== */
.logo-section {
  flex-shrink: 0;
  width: 300px;
}

.logo-wrapper {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(139, 117, 95, 0.15);
  border: 2px solid #e8dcc8;
}

.vendor-logo {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.logo-wrapper:hover .vendor-logo {
  transform: scale(1.05);
}

.logo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(212, 184, 150, 0.85), rgba(201, 168, 130, 0.85));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.logo-wrapper:hover .logo-overlay {
  opacity: 1;
}

.logo-overlay i {
  font-size: 3rem;
  color: #ffffff;
}

/* ==================== 地圖區塊 ==================== */
.map-wrapper {
  width: 100%;
  height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(139, 117, 95, 0.15);
  border: 2px solid #e8dcc8;
}

.map-wrapper iframe {
  width: 100%;
  height: 100%;
  border: 0;
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

/* ==================== 響應式設計 ==================== */
@media (max-width: 992px) {
  .content-layout {
    flex-direction: column;
  }

  .logo-section {
    width: 100%;
    max-width: 400px;
    margin: 0 auto;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .vendor-info-container {
    padding: 1rem;
  }

  .card-header {
    padding: 1rem 1.5rem;
  }

  .header-title {
    font-size: 1.25rem;
  }

  .card-body {
    padding: 1.5rem;
  }

  .map-wrapper {
    height: 300px;
  }
}
</style>