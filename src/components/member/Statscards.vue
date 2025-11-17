<template>
  <div class="stats-cards-wrapper">
    <!-- 最常消費 -->
    <div class="custom-block stats-card mb-3">
      <div class="stats-icon coffee">
        <i class="bi bi-cup-hot-fill"></i>
      </div>
      <div class="stats-content">
        <h6>最常消費</h6>
        <p class="stats-value">{{ topCategory }}</p>
        <small class="text-muted">NT$ {{ topCategoryAmount }}</small>
      </div>
    </div>

    <!-- 本月總消費 -->
    <div class="custom-block stats-card mb-3">
      <div class="stats-icon money">
        <i class="bi bi-wallet2"></i>
      </div>
      <div class="stats-content">
        <h6>本月總消費</h6>
        <p class="stats-value">NT$ {{ totalSpending.toLocaleString() }}</p>
        <small class="text-success">
          <i class="bi bi-arrow-up"></i> 較上月增加 12%
        </small>
      </div>
    </div>

    <!-- 本月訂單數 -->
    <div class="custom-block stats-card mb-3">
      <div class="stats-icon order">
        <i class="bi bi-receipt"></i>
      </div>
      <div class="stats-content">
        <h6>本月訂單數</h6>
        <p class="stats-value">{{ totalOrders }} 筆</p>
        <small class="text-muted">平均 NT$ {{ averageOrderValue }}</small>
      </div>
    </div>
  </div>


  
</template>

<script>
export default {
  name: 'StatsCards',
  props: {
    spendingData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 示範數據 - 金額壓在1000元以下
      categoryData: {
        '咖啡廳': 350,
        '吃到飽餐廳': 680,
        '速食店': 320,
        '素食餐廳': 280,
        '小吃店': 450,
        '攤販 / 夜市': 180,
        '高級餐廳': 1800,
        '烘焙坊 / 甜點店': 380,
        '居酒屋 / 酒吧': 750,
        '早午餐廳': 420,
        '家庭式餐廳': 650,
        '外帶 / 外送店': 550
      }
    };
  },
  computed: {
    topCategory() {
      const entries = Object.entries(this.categoryData);
      entries.sort((a, b) => b[1] - a[1]);
      return entries[0][0];
    },
    topCategoryAmount() {
      return Math.max(...Object.values(this.categoryData));
    },
    totalSpending() {
      return Object.values(this.categoryData).reduce((sum, val) => sum + val, 0);
    },
    totalOrders() {
      return 45; // 示範數據
    },
    averageOrderValue() {
      return Math.round(this.totalSpending / this.totalOrders);
    }
  }
};
</script>

<style scoped>
/* 統計卡片樣式 */
.stats-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  transition: all 0.3s;
  cursor: pointer;
  height: 7rem;
}

.stats-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(122, 92, 60, 0.2) !important;
}

.stats-icon {
  width: 55px;
  height: 55px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: white;
  flex-shrink: 0;
}

.stats-icon.coffee {
  background: linear-gradient(135deg, #00D4FF 0%, #0099CC 100%);
}

.stats-icon.money {
  background: linear-gradient(135deg, #00E396 0%, #00A674 100%);
}

.stats-icon.order {
  background: linear-gradient(135deg, #FEB019 0%, #FF8C00 100%);
}

.stats-content {
  flex: 1;
}

.stats-content h6 {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.4rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 0.2rem;
}

.stats-content small {
  font-size: 0.75rem;
}

/* 響應式調整 */
@media (max-width: 992px) {
  .stats-card {
    padding: 1rem;
  }

  .stats-icon {
    width: 50px;
    height: 50px;
    font-size: 1.4rem;
  }

  .stats-value {
    font-size: 1.1rem;
  }
}

@media (max-width: 768px) {
  .stats-cards-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .stats-card {
    margin-bottom: 0 !important;
  }
}
</style>