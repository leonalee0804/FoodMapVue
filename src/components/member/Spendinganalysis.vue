<template>
  <div class="spending-analysis">

    <div class="row mb-4">
      <!-- 圓餅圖 - 消費類別分布 -->
      <div class="col-lg-6 col-12 mb-4">
        <div class="custom-block bg-white">
          <h5 class="mb-4">
            <i class="bi bi-pie-chart-fill me-2"></i>
            消費類別分布
          </h5>
          <div id="category-pie-chart"></div>
        </div>
      </div>

      <!-- 長條圖 - 月度消費趨勢 -->
      <div class="col-lg-6 col-12 mb-4">
        <div class="custom-block bg-white">
          <h5 class="mb-4">
            <i class="bi bi-bar-chart-fill me-2"></i>
            近期消費趨勢
          </h5>
          <div id="spending-bar-chart"></div>
        </div>
      </div>
    </div>
  </div>


</template>

<script>
import ApexCharts from 'apexcharts';

export default {
  name: 'SpendingAnalysis',
  props: {
    spendingData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      pieChart: null,
      barChart: null,
  
      categoryData: {
        '咖啡廳': 850,
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
      },
      monthlyData: {
        categories: ['6月', '7月', '8月', '9月', '10月', '11月'],
        series: [
          { name: '餐廳消費', data: [650, 720, 680, 1800, 750, 820] },
          { name: '咖啡飲品', data: [200, 180, 50, 80, 100, 150] },
          { name: '外送訂單', data: [180, 220, 150, 280, 320, 490] }
        ]
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
  },
  mounted() {
    this.initPieChart();
    this.initBarChart();
  },
  beforeUnmount() {
    if (this.pieChart) this.pieChart.destroy();
    if (this.barChart) this.barChart.destroy();
  },
  methods: {
    initPieChart() {
      const categories = Object.keys(this.categoryData);
      const values = Object.values(this.categoryData);

      const options = {
        series: values,
        chart: {
          width: '100%',
          height: 400,
          type: 'pie',
          fontFamily: 'Unbounded, sans-serif'
        },
        labels: categories,
        // 使用 ApexCharts 預設配色
        legend: {
          position: 'bottom',
          fontSize: '13px',
          fontWeight: 500
        },
        dataLabels: {
          enabled: true,
          formatter: function(val) {
            return val.toFixed(1) + '%';
          },
          style: {
            fontSize: '12px',
            fontWeight: 'bold'
          }
        },
        tooltip: {
          y: {
            formatter: function(val) {
              return 'NT$ ' + val.toLocaleString();
            }
          }
        },
        responsive: [{
          breakpoint: 768,
          options: {
            chart: {
              height: 300
            },
            legend: {
              position: 'bottom',
              fontSize: '11px'
            }
          }
        }]
      };

      this.pieChart = new ApexCharts(
        document.querySelector("#category-pie-chart"),
        options
      );
      this.pieChart.render();
    },

    initBarChart() {
      const options = {
        series: this.monthlyData.series,
        chart: {
          type: 'bar',
          height: 350,
          fontFamily: 'Unbounded, sans-serif',
          toolbar: {
            show: true
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '60%',
            endingShape: 'rounded',
            borderRadius: 4
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent']
        },
        xaxis: {
          categories: this.monthlyData.categories,
          labels: {
            style: {
              fontSize: '13px',
              fontWeight: 500
            }
          }
        },
        yaxis: {
          title: {
            text: 'NT$ (元)',
            style: {
              fontSize: '13px',
              fontWeight: 600
            }
          },
          labels: {
            formatter: function(val) {
              return 'NT$ ' + val;
            }
          }
        },
        fill: {
          opacity: 1
        },
        tooltip: {
          y: {
            formatter: function(val) {
              return 'NT$ ' + val.toLocaleString();
            }
          }
        },
        legend: {
          position: 'top',
          horizontalAlign: 'left',
          fontSize: '13px',
          fontWeight: 500
        },
        responsive: [{
          breakpoint: 768,
          options: {
            chart: {
              height: 300
            },
            plotOptions: {
              bar: {
                columnWidth: '80%'
              }
            }
          }
        }]
      };

      this.barChart = new ApexCharts(
        document.querySelector("#spending-bar-chart"),
        options
      );
      this.barChart.render();
    }
  }
};
</script>

<style scoped>
.spending-analysis {
  margin-top: 2rem;
}

/* 圖表標題樣式 */
.custom-block h5 i {
  color: #8B6F47;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .spending-analysis {
    margin-top: 1rem;
  }
}
</style>