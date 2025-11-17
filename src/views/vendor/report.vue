<template>
  <div class="vendor-report">
    <!-- 標題卡片 -->
    <div class="title-card">
      <div class="card-header">
        <div class="header-content">
          <i class="bi bi-graph-up header-icon"></i>
          <h2 class="header-title">營運報表</h2>
        </div>
      </div>
    </div>

    <!-- 收藏 & 瀏覽 & 營收統計卡片 -->
    <div class="stats">
      <!-- 總營收卡片 -->
      <div class="stat-card">
        <h3>
          <i class="bi bi-cash-coin me-2"></i>總營收
        </h3>
        <p class="revenue-count">NT$ {{ totalRevenue.toLocaleString() }}</p>
      </div>

      <div class="stat-card">
        <h3>
          <i class="bi bi-heart-fill me-2"></i>店家被收藏次數
        </h3>
        <p class="favorite-count">{{ favoriteCount }}</p>
      </div>

      <div class="stat-card">
        <h3>
          <i class="bi bi-eye-fill me-2"></i>店家瀏覽次數
        </h3>
        <p class="view-count">{{ viewCount }}</p>
      </div>
    </div>

    <!-- 圖表容器 -->
    <div class="charts">
      <div v-for="(chart, index) in charts" :key="index" class="chart-item">
        <h3>{{ chart.title }}</h3>
        <apexchart
          width="100%"
          height="300"
          :type="chart.type"
          :options="chart.options"
          :series="chart.series"
        ></apexchart>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import VueApexCharts from "vue3-apexcharts";
import api from "@/api/axiosInstance";

const apexchart = VueApexCharts;

// 統計數字
const totalRevenue = ref(0);
const favoriteCount = ref(0);
const viewCount = ref(0);

// 初始化圖表
const charts = reactive([
  {
    title: "本月每日訂單數",
    type: "bar",
    series: [{ name: "訂單數", data: [] }],
    options: {
      chart: { id: "orders", toolbar: { show: false } },
      xaxis: {
        categories: [],
        title: {
          text: "日期（號）",
          style: {
            color: "#8b755f",
            fontSize: "12px",
            fontWeight: 600,
          },
        },
        labels: {
          style: {
            colors: "#8b755f",
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        title: {
          text: "訂單數",
          style: {
            color: "#8b755f",
            fontSize: "12px",
            fontWeight: 600,
          },
        },
        labels: {
          style: {
            colors: "#8b755f",
            fontSize: "12px",
          },
        },
      },
      colors: ["#d4b896"],
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: "60%",
        },
      },
      dataLabels: { enabled: false },
      grid: { borderColor: "#e8dcc8" },
      tooltip: {
        theme: "light",
        x: { 
          show: true,
          formatter: (val) => `${val} 號`,
        },
        y: {
          formatter: (val) => `${val} 筆訂單`,
        },
      },
    },
  },
  {
    title: "本月每日瀏覽數",
    type: "bar",
    series: [{ name: "瀏覽數", data: [] }],
    options: {
      chart: { id: "daily-views", toolbar: { show: false } },
      xaxis: {
        categories: [],
        title: {
          text: "日期（號）",
          style: {
            color: "#8b755f",
            fontSize: "12px",
            fontWeight: 600,
          },
        },
        labels: {
          style: {
            colors: "#8b755f",
            fontSize: "12px",
          },
        },
      },
      yaxis: {
        title: {
          text: "瀏覽數",
          style: {
            color: "#8b755f",
            fontSize: "12px",
            fontWeight: 600,
          },
        },
        labels: {
          style: {
            colors: "#8b755f",
            fontSize: "12px",
          },
        },
      },
      colors: ["#c9a882"],
      plotOptions: {
        bar: {
          borderRadius: 8,
          columnWidth: "60%",
        },
      },
      dataLabels: { enabled: false },
      grid: { borderColor: "#e8dcc8" },
      tooltip: {
        theme: "light",
        x: { 
          show: true,
          formatter: (val) => `${val} 號`,
        },
        y: {
          formatter: (val) => `${val} 次瀏覽`,
        },
      },
    },
  },
]);

// 抓總營收
const fetchTotalRevenue = async () => {
  try {
    const res = await api.get("/api/order/vendor/revenue");
    totalRevenue.value = res.data;
    console.log("✅ 總營收：", totalRevenue.value);
  } catch (err) {
    console.error("❌ 取得總營收失敗", err);
  }
};

// 抓收藏數
const fetchFavoriteCount = async () => {
  try {
    const res = await api.get("/api/charts/favorites", { withCredentials: true });
    favoriteCount.value = res.data;
  } catch (err) {
    console.error("取得收藏數失敗", err);
  }
};

// 抓總瀏覽數
const fetchViewCount = async () => {
  try {
    const res = await api.get("/api/charts/views", { withCredentials: true });
    viewCount.value = res.data;
  } catch (err) {
    console.error("取得瀏覽次數失敗", err);
  }
};

// 生成模擬訂單資料
const generateMockOrderData = (dates) => {
  const baseOrders = 15;
  const mockData = dates.map((date, index) => {
    const wave = Math.sin(index * 0.5) * 8;
    const random = Math.random() * 6 - 3;
    const weekdayBonus = [1, 2, 3, 4, 5].includes(new Date(date).getDay()) ? 5 : 0;
    
    return Math.max(0, Math.round(baseOrders + wave + random + weekdayBonus));
  });
  
  return mockData;
};

// 生成模擬瀏覽資料
const generateMockViewData = (dates) => {
  const baseViews = 25;
  const mockData = dates.map((date, index) => {
    const wave = Math.sin(index * 0.5) * 10;
    const random = Math.random() * 8 - 4;
    const weekdayBonus = [1, 2, 3, 4, 5].includes(new Date(date).getDay()) ? 5 : -3;
    
    return Math.max(5, Math.round(baseViews + wave + random + weekdayBonus));
  });
  
  return mockData;
};

// 抓報表資料（使用模擬資料）
const fetchReportData = async () => {
  try {
    // 生成本月 1 號到今天的日期
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = today.getDate(); // 今天是幾號
    
    const dates = [];
    const dayNumbers = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
      dayNumbers.push(day);
    }
    
    // 生成模擬數據
    const viewCounts = generateMockViewData(dates);
    const orderCounts = generateMockOrderData(dates);
    
    console.log("📊 使用模擬資料");
    console.log("📊 日期範圍：", dates[0], "到", dates[dates.length - 1]);
    console.log("📊 瀏覽數：", viewCounts);
    console.log("📊 訂單數：", orderCounts);
    
    // 更新圖表
    charts.forEach(chart => {
      if (chart.title === "本月每日瀏覽數") {
        chart.series = [{ name: "瀏覽數", data: viewCounts }];
      } else if (chart.title === "本月每日訂單數") {
        chart.series = [{ name: "訂單數", data: orderCounts }];
      }
      chart.options.xaxis.categories = dayNumbers;
    });
    
    console.log("✅ 圖表更新完成");
  } catch (err) {
    console.error("❌ 取得報表資料失敗：", err);
  }
};

// 掛載時抓所有資料
onMounted(() => {
  fetchTotalRevenue();
  fetchFavoriteCount();
  fetchViewCount();
  fetchReportData();
});
</script>

<style scoped>
.vendor-report {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  min-height: 100vh;
}

/* ==================== 標題卡片 ==================== */
.title-card {
  background: #faf8f3;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(139, 117, 95, 0.08), 0 2px 4px rgba(139, 117, 95, 0.05);
  overflow: hidden;
  border: 1px solid #e8dcc8;
  margin-bottom: 2rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.title-card:hover {
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

/* ==================== 統計卡片區 ==================== */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: #faf8f3;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #e8dcc8;
  box-shadow: 0 4px 6px rgba(139, 117, 95, 0.08), 0 2px 4px rgba(139, 117, 95, 0.05);
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(139, 117, 95, 0.15);
  border-color: #d4b896;
}

.stat-card h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #8b755f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.revenue-count {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #d4b896 0%, #c9a882 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

.favorite-count,
.view-count {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(135deg, #d4b896 0%, #c9a882 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
}

/* ==================== 圖表區 ==================== */
.charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.chart-item {
  background: #faf8f3;
  border-radius: 16px;
  padding: 1.5rem;
  border: 2px solid #e8dcc8;
  box-shadow: 0 4px 6px rgba(139, 117, 95, 0.08), 0 2px 4px rgba(139, 117, 95, 0.05);
  transition: all 0.3s ease;
  overflow: hidden;
}

.chart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 117, 95, 0.15);
  border-color: #d4b896;
}

.chart-item h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #5a4a3a;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #e8dcc8;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ==================== 響應式設計 ==================== */
@media (max-width: 768px) {
  .vendor-report {
    padding: 1rem;
  }

  .card-header {
    padding: 1rem 1.5rem;
  }

  .header-title {
    font-size: 1.25rem;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .charts {
    grid-template-columns: 1fr;
  }

  .revenue-count {
    font-size: 2rem;
  }

  .favorite-count,
  .view-count {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: 1.25rem;
  }

  .chart-item {
    padding: 1.25rem;
  }

  .revenue-count {
    font-size: 1.75rem;
  }

  .favorite-count,
  .view-count {
    font-size: 2rem;
  }
}
</style>