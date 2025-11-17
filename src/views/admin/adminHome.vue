<template>
  <div class="d-flex">
    <!-- 側邊欄 -->
    <nav id="sidebarMenu" class="sidebar-fixed">
      <div class="bg-light p-3 vh-100">
        <h4 class="mb-2">管理員儀表板</h4>
        <ul class="nav flex-column">
          <li class="nav-item mb-2">
            <RouterLink class="nav-link" to="/admin/adminHome">
              <i class="bi bi-speedometer2 me-2"></i> 儀表板
            </RouterLink>
          </li>
          <li class="nav-item mb-2">
            <RouterLink class="nav-link" to="/admin/adminAccounts">
              <i class="bi-person-fill-gear me-2"></i>帳號管理
            </RouterLink>
          </li>
          <li class="nav-item mb-2">
            <RouterLink class="nav-link" to="/admin/blackList">
              <i class="bi bi-person-fill-slash me-2"></i>黑名單管理
            </RouterLink>
          </li>
          <li class="nav-item mb-2">
            <RouterLink class="nav-link" to="/admin/adminProductReview">
              <i class="bi-card-checklist me-2"></i> 商品審核
            </RouterLink>
          </li>
          <li class="nav-item mb-2">
            <RouterLink class="nav-link" to="/admin/customerServiceManager">
              <i class="bi-person-fill-gear me-2"></i> 客服案件管理
            </RouterLink>
          </li>
          <li class="nav-item border-top mt-auto pt-2">
            <RouterLink class="nav-link" to="/logout">
              <i class="bi-box-arrow-left me-2"></i> Logout
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- 主要內容區 -->
    <div class="main-content">
      <!-- 統計卡片區 -->
      <div class="row g-3 mb-3">
        <!-- 統計切換選項卡 -->
        <div class="col-12">
          <div class="stats-tabs-container">
            <button 
              class="stats-tab-btn" 
              :class="{ active: activeTab === 'accounts' }"
              @click="activeTab = 'accounts'"
            >
              <i class="bi bi-people-fill me-2"></i>
              帳號統計
            </button>
            <button 
              class="stats-tab-btn" 
              :class="{ active: activeTab === 'customer-service' }"
              @click="activeTab = 'customer-service'"
            >
              <i class="bi bi-headset me-2"></i>
              客服案件
            </button>
            <button 
              class="stats-tab-btn" 
              :class="{ active: activeTab === 'product-review' }"
              @click="activeTab = 'product-review'"
            >
              <i class="bi bi-card-checklist me-2"></i>
              商品審核
            </button>
          </div>
        </div>

        <!-- 統計內容區 -->
        <div class="col-12">
          <transition name="fade" mode="out-in">
            <!-- 帳號統計 -->
            <div v-if="activeTab === 'accounts'" key="accounts" class="stats-content">
              <div class="row g-3">
                <!-- 帳號統計圖表 -->
                <div class="col-12">
                  <div class="card shadow-sm h-100">
                    <div class="card-body">
                      <h5 class="card-title mb-4">
                        <i class="bi bi-bar-chart-fill me-2"></i>帳號總覽
                      </h5>
                      <account-stats-chart :users="users" />
                    </div>
                  </div>
                </div>

                <!-- 帳號統計資訊卡片 -->
               
              </div>
            </div>

            <!-- 客服案件統計 -->
            <div v-else-if="activeTab === 'customer-service'" key="customer-service" class="stats-content">
              <div class="card shadow-sm">
                <div class="card-body">
                  <CustomerServiceStats />
                </div>
              </div>
            </div>

            <!-- 商品審核統計 -->
            <div v-else key="product-review" class="stats-content">
              <div class="card shadow-sm">
                <div class="card-body">
                  <ProductReviewStats />
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- router-view 放置各功能頁面 -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import AccountStatsChart from "@/views/admin/accountStatsChart.vue";
import CustomerServiceStats from "@/views/customerservice/CustomerServiceStats.vue";
import ProductReviewStats from "@/views/admin/ProductReviewStats.vue";

const users = ref([]);
const activeTab = ref('accounts');

// 帳號統計
const accountStats = computed(() => {
  const total = users.value.length;
  const members = users.value.filter(u => u.role === 'member').length;
  const vendors = users.value.filter(u => u.role === 'vendor').length;
  const admins = users.value.filter(u => u.role === 'admin').length;

  return {
    total,
    members,
    vendors,
    admins,
    memberPercentage: total > 0 ? Math.round((members / total) * 100) : 0,
    vendorPercentage: total > 0 ? Math.round((vendors / total) * 100) : 0,
    adminPercentage: total > 0 ? Math.round((admins / total) * 100) : 0
  };
});

// 取得帳號列表 API
const fetchUsers = async () => {
  try {
    const res = await fetch("/api/accounts/list");
    const data = await res.json();
    users.value = data.content || [];
  } catch (err) {
    console.error("取得帳號資料失敗:", err);
  }
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
/* 側邊欄固定寬度 */
#sidebarMenu {
  flex-shrink: 0; /* 防止被壓縮 */
  width: 250px; /* 固定寬度 */
  min-width: 250px; /* 最小寬度 */
}

.sidebar-fixed {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

/* 主要內容區 */
.main-content {
  flex: 1;
  min-width: 0; /* 重要：允許內容縮小 */
  padding: 1.5rem; /* 改為固定的 padding，而不是 p-3 */
  overflow-x: hidden; /* 防止水平溢出 */
}

.card {
  margin: 0;
  padding: 0;
  width: 100%;
  border-radius: 0.8rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid #e8e8e8;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}

/* 調整 card-body 的內距 */
.card-body {
  padding: 1rem;
}

/* 調整卡片標題的間距 */
.card-title {
  margin-bottom: 0.75rem !important;
  font-size: 1.1rem;
}

/* 統計切換選項卡 */
.stats-tabs-container {
  display: flex;
  gap: 0.75rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 0.75rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stats-tab-btn {
  flex: 1;
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-tab-btn:hover {
  background: rgba(255, 255, 255, 0.6);
  color: #333;
  transform: translateY(-2px);
}

.stats-tab-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.stats-tab-btn i {
  font-size: 1.2rem;
}

/* 統計內容區 */
.stats-content {
  animation: fadeIn 0.4s ease;
}

/* 資訊卡片 */
.info-card {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.info-card.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.info-card.members {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  color: white;
}

.info-card.vendors {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
  color: white;
}

.info-card.admins {
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
  color: white;
}

.info-icon {
  font-size: 3rem;
  margin-right: 1.25rem;
  opacity: 0.9;
}

.info-content h3 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.info-content p {
  margin: 0.25rem 0 0 0;
  font-size: 1rem;
  opacity: 0.95;
}

.info-content small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.85rem;
  opacity: 0.85;
}

/* 操作連結卡片 */
.action-link-card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #667eea;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 2px solid #e0e0e0;
}

.action-link-card:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  border-color: #667eea;
}

/* 快速操作 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem 1rem;
  color: white;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.quick-action-btn.accounts {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.quick-action-btn.products {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.quick-action-btn.service {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.quick-action-btn.blacklist {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.quick-action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  color: white;
}

.quick-action-btn i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.quick-action-btn span {
  font-weight: 600;
  font-size: 0.9rem;
}

/* 淡入淡出動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 響應式 */
@media (max-width: 992px) {
  #sidebarMenu {
    width: 200px; /* 中等螢幕縮小側邊欄 */
    min-width: 200px;
  }
  
  .main-content {
    padding: 1rem;
  }

  .stats-tabs-container {
    flex-direction: column;
  }

  .stats-tab-btn {
    justify-content: flex-start;
  }

  .info-card {
    padding: 1rem;
  }

  .info-icon {
    font-size: 2.5rem;
    margin-right: 1rem;
  }

  .info-content h3 {
    font-size: 2rem;
  }
  
  .card-body {
    padding: 0.75rem;
  }
}

@media (max-width: 768px) {
  /* 小螢幕時側邊欄可以隱藏或變成漢堡選單 */
  #sidebarMenu {
    width: 60px; /* 只顯示圖標 */
    min-width: 60px;
  }
  
  #sidebarMenu h4,
  #sidebarMenu .nav-link {
    font-size: 0.75rem;
  }
  
  .main-content {
    padding: 0.75rem;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }

  .quick-action-btn {
    padding: 1.25rem 0.75rem;
  }

  .quick-action-btn i {
    font-size: 1.5rem;
  }

  .stats-tabs-container {
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .stats-tab-btn {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  .card-body {
    padding: 0.5rem;
  }
  
  .card-title {
    margin-bottom: 0.5rem !important;
    font-size: 1rem;
  }
}
</style>