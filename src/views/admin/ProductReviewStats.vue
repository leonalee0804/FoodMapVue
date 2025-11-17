<template>
  <div class="product-review-stats">
    <h5 class="card-title text-center mb-4">
      <i class="bi bi-card-checklist me-2"></i>商品審核統計
    </h5>

    <!-- 審核狀態卡片 -->
    <div class="stats-grid mb-4">
      <div class="status-card pending">
        <div class="status-icon">
          <i class="bi bi-hourglass-split"></i>
        </div>
        <div class="status-info">
          <h3>{{ stats.pending }}</h3>
          <p>審核中</p>
        </div>
      </div>

      <div class="status-card approved">
        <div class="status-icon">
          <i class="bi bi-check-circle-fill"></i>
        </div>
        <div class="status-info">
          <h3>{{ stats.approved }}</h3>
          <p>上架中</p>
        </div>
      </div>

      <div class="status-card rejected">
        <div class="status-icon">
          <i class="bi bi-x-circle-fill"></i>
        </div>
        <div class="status-info">
          <h3>{{ stats.rejected }}</h3>
          <p>未通過</p>
        </div>
      </div>
    </div>

    <!-- 長條圖 -->
    <div class="chart-container mb-4">
      <canvas ref="barChart"></canvas>
    </div>

    <!-- 最近待審核商品 -->
    <div class="recent-products">
      <h6 class="mb-3">最近待審核商品</h6>
      <div class="product-list">
        <div class="product-item" v-for="product in recentPending" :key="product.productId">
          <div class="product-image">
            <img v-if="product.picUrl" :src="getImageUrl(product.picUrl)" alt="商品圖片" />
            <div v-else class="no-image">
              <i class="bi bi-image"></i>
            </div>
          </div>
          <div class="product-info">
            <div class="product-name">{{ product.productName }}</div>
            <div class="product-vendor">{{ product.vendorName }}</div>
          </div>
          <div class="product-status">
            <span class="status-badge pending">{{ product.status }}</span>
          </div>
        </div>
        <div v-if="recentPending.length === 0" class="empty-state">
          <i class="bi bi-inbox"></i>
          <p>目前無待審核商品</p>
        </div>
      </div>
    </div>

    <!-- 通過率圓環 -->
    <div class="approval-rate mt-4">
      <h6 class="text-center mb-3">審核通過率</h6>
      <div class="rate-circle">
        <svg viewBox="0 0 120 120">
          <circle class="rate-bg" cx="60" cy="60" r="50"></circle>
          <circle 
            class="rate-fill" 
            cx="60" 
            cy="60" 
            r="50"
            :style="{ strokeDashoffset: circleOffset }"
          ></circle>
        </svg>
        <div class="rate-text">
          <h2>{{ stats.approvalRate }}%</h2>
          <p>通過率</p>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-action mt-4">
      <RouterLink to="/admin/adminProductReview" class="action-btn">
        <i class="bi bi-arrow-right-circle-fill me-2"></i>
        前往審核商品
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import api from '@/api/axiosInstance';

Chart.register(...registerables);

const barChart = ref(null);
let chartInstance = null;

const products = ref([]);

const stats = ref({
  pending: 0,
  approved: 0,
  rejected: 0,
  offshelf: 0,
  total: 0,
  approvalRate: 0
});

// 最近5個待審核商品
const recentPending = computed(() => {
  return products.value
    .filter(p => p.status === '審核中')
    .slice(0, 5);
});

// 計算圓環偏移量
const circleOffset = computed(() => {
  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (stats.value.approvalRate / 100) * circumference;
  return offset;
});

// 計算統計數據
const calculateStats = () => {
  if (!products.value || products.value.length === 0) {
    stats.value = {
      pending: 0,
      approved: 0,
      rejected: 0,
      offshelf: 0,
      total: 0,
      approvalRate: 0
    };
    return;
  }

  // 根據實際的 status 計算
  stats.value.pending = products.value.filter(p => p.status === '審核中').length;
  stats.value.approved = products.value.filter(p => p.status === '上架中').length;
  stats.value.rejected = products.value.filter(p => p.status === '審核不通過').length;
  stats.value.offshelf = products.value.filter(p => p.status === '已下架').length;
  stats.value.total = products.value.length;

  // 計算通過率（上架中 / (上架中 + 審核不通過)）
  const reviewed = stats.value.approved + stats.value.rejected;
  stats.value.approvalRate = reviewed > 0 
    ? Math.round((stats.value.approved / reviewed) * 100) 
    : 0;
};

// 繪製長條圖
const drawChart = () => {
  if (!barChart.value) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const ctx = barChart.value.getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['審核中', '上架中', '未通過', '已下架'],
      datasets: [{
        label: '商品數量',
        data: [
          stats.value.pending, 
          stats.value.approved, 
          stats.value.rejected,
          stats.value.offshelf
        ],
        backgroundColor: [
          'rgba(255, 193, 7, 0.8)',
          'rgba(76, 175, 80, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(158, 158, 158, 0.8)'
        ],
        borderColor: [
          'rgb(255, 193, 7)',
          'rgb(76, 175, 80)',
          'rgb(244, 67, 54)',
          'rgb(158, 158, 158)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 5
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.parsed.y} 件`;
            }
          }
        }
      }
    }
  });
};

// 獲取商品數據
const fetchProducts = async () => {
  try {
    const res = await api.get('/vProduct/Admin/all', { withCredentials: true });
    products.value = Array.isArray(res.data) ? res.data : [];
    calculateStats();
    drawChart();
  } catch (error) {
    console.error('獲取商品列表失敗:', error);
    products.value = [];
    calculateStats();
    drawChart();
  }
};

// 取得完整圖片 URL
const getImageUrl = (filename) => {
  if (!filename) return '';
  return filename.startsWith('http')
    ? filename
    : `http://localhost:8082/Product_Pic/${filename}`;
};

onMounted(() => {
  fetchProducts();
});
</script>

<style scoped>
.product-review-stats {
  padding: 1rem;
}

/* 狀態卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.status-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.status-card.pending {
  background: linear-gradient(135deg, #FFF9C4 0%, #FFFDE7 100%);
  border-left: 4px solid #FFC107;
}

.status-card.approved {
  background: linear-gradient(135deg, #C8E6C9 0%, #E8F5E9 100%);
  border-left: 4px solid #4CAF50;
}

.status-card.rejected {
  background: linear-gradient(135deg, #FFCDD2 0%, #FFEBEE 100%);
  border-left: 4px solid #F44336;
}

.status-icon {
  font-size: 2rem;
  margin-right: 1rem;
}

.status-card.pending .status-icon {
  color: #FFC107;
}

.status-card.approved .status-icon {
  color: #4CAF50;
}

.status-card.rejected .status-icon {
  color: #F44336;
}

.status-info h3 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
}

.status-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

/* 長條圖 */
.chart-container {
  max-width: 400px;
  margin: 0 auto;
}

/* 商品列表 */
.recent-products h6 {
  color: #333;
  font-weight: 600;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-item {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.product-item:hover {
  background: #e9ecef;
  transform: translateX(5px);
}

.product-image {
  width: 50px;
  height: 50px;
  margin-right: 1rem;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #e8dcc8;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e0e0e0;
  border-radius: 8px;
  color: #999;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-weight: 500;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-vendor {
  font-size: 0.85rem;
  color: #666;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #FFC107;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.empty-state p {
  margin: 0;
}

/* 通過率圓環 */
.approval-rate h6 {
  color: #333;
  font-weight: 600;
}

.rate-circle {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
}

.rate-circle svg {
  transform: rotate(-90deg);
}

.rate-bg {
  fill: none;
  stroke: #e0e0e0;
  stroke-width: 10;
}

.rate-fill {
  fill: none;
  stroke: #4CAF50;
  stroke-width: 10;
  stroke-linecap: round;
  stroke-dasharray: 314;
  transition: stroke-dashoffset 1s ease;
}

.rate-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.rate-text h2 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #4CAF50;
}

.rate-text p {
  margin: 0;
  font-size: 0.8rem;
  color: #666;
}

/* 快速操作按鈕 */
.quick-action {
  margin-top: 1.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  color: white;
}

/* 響應式 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .status-card {
    padding: 0.875rem;
  }

  .status-icon {
    font-size: 1.5rem;
  }

  .status-info h3 {
    font-size: 1.5rem;
  }
}
</style>
