<template>
  <div class="container mt-5">
    <h3 class="mb-4">我的訂單歷史</h3>

    <!-- 篩選與每頁筆數 -->
    <div class="row mb-3">
      <div class="col-md-3">
        <select v-model="selectedProduct" class="form-select">
          <option value="">所有商品</option>
          <option v-for="product in productList" :key="product" :value="product">
            {{ product }}
          </option>
        </select>
      </div>

      <div class="col-md-3">
        <input type="date" v-model="startDate" class="form-control" placeholder="開始日期" />
      </div>
      <div class="col-md-3">
        <input type="date" v-model="endDate" class="form-control" placeholder="結束日期" />
      </div>

      <div class="col-md-3 d-flex">
        <button @click="applyFilter" class="btn btn-primary me-2 w-50">篩選</button>
        <button @click="clearDate" class="btn btn-secondary w-50">清除日期</button>
      </div>
    </div>

    <!-- 本頁統計 -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="alert alert-warning">
          <strong>本頁總消費金額：</strong> ${{ pageTotalAmount.toLocaleString() }}
        </div>
      </div>
      <div class="col-md-6">
        <div class="alert alert-info">
          <strong>本頁累積點數：</strong> {{ pageTotalPoints }} 點
        </div>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-responsive">
      <table class="table table-striped table-bordered table-hover">
        <thead class="table-dark text-center">
          <tr>
            <th>商品名稱</th>
            <th>數量</th>
            <th>單價</th>
            <th>訂單日期</th>
            <th>點數</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in paginatedData" :key="index" class="text-center">
            <td>{{ row.productName }}</td>
            <td>{{ row.quantity }}</td>
            <td>{{ row.unitPrice.toLocaleString() }}</td>
            <td>{{ row.orderDate }}</td>
            <td>{{ row.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分頁 -->
    <nav>
      <ul class="pagination justify-content-center">
        <li
          v-for="page in totalPages"
          :key="page"
          class="page-item"
          :class="{ active: currentPage === page }"
        >
          <a href="#" class="page-link" @click.prevent="goToPage(page)">
            {{ page }}
          </a>
        </li>
      </ul>
    </nav>

    <!-- 每頁筆數 -->
    <div class="d-flex justify-content-center align-items-center my-3">
      <label for="pageSize" class="me-2 mb-0">每頁筆數：</label>
      <select v-model.number="pageSize" id="pageSize" class="form-select w-auto">
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

// 假設從登入狀態或路由取得
const userId = 2;

// 狀態變數
const ordersData = ref([]);
const selectedProduct = ref("");
const startDate = ref("");
const endDate = ref("");
const currentPage = ref(1);
const pageSize = ref(5);

// 載入資料
const fetchOrders = async () => {
  try {
    const res = await axios.get(`/api/orders/history/${userId}`);
    // 排序 (最新在前)
    ordersData.value = res.data.sort(
      (a, b) => new Date(b.orderDate) - new Date(a.orderDate)
    );
  } catch (err) {
    console.error("載入訂單歷史失敗", err);
    alert("載入訂單歷史失敗");
  }
};

// 產品下拉選單
const productList = computed(() => {
  const set = new Set();
  ordersData.value.forEach((order) => {
    order.orderDetails.forEach((od) => set.add(od.product.productName));
  });
  return Array.from(set);
});

// 篩選後的資料
const filteredData = computed(() => {
  return ordersData.value.filter((order) => {
    const orderDate = order.orderDate.substring(0, 10);
    let matchDate = true;

    if (startDate.value && endDate.value)
      matchDate = orderDate >= startDate.value && orderDate <= endDate.value;
    else if (startDate.value)
      matchDate = orderDate >= startDate.value;
    else if (endDate.value)
      matchDate = orderDate <= endDate.value;

    const matchProduct = selectedProduct.value
      ? order.orderDetails.some(
          (od) => od.product.productName === selectedProduct.value
        )
      : true;

    return matchDate && matchProduct;
  });
});

// 展平資料 (每筆訂單多筆商品 → 單列)
const flattenedData = computed(() => {
  const rows = [];
  filteredData.value.forEach((order) => {
    order.orderDetails.forEach((od) => {
      rows.push({
        productName: od.product.productName,
        quantity: od.quantity,
        unitPrice: od.unitPrice,
        orderDate: order.orderDate.substring(0, 10),
        points: order.bounsPoint,
      });
    });
  });
  return rows;
});

// 分頁
const totalPages = computed(() =>
  Math.ceil(flattenedData.value.length / pageSize.value)
);
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return flattenedData.value.slice(start, start + pageSize.value);
});

// 本頁統計
const pageTotalAmount = computed(() =>
  paginatedData.value.reduce(
    (sum, row) => sum + row.unitPrice * row.quantity,
    0
  )
);
const pageTotalPoints = computed(() =>
  paginatedData.value.reduce((sum, row) => sum + row.points, 0)
);

// 事件
function applyFilter() {
  currentPage.value = 1;
}
function clearDate() {
  startDate.value = "";
  endDate.value = "";
  currentPage.value = 1;
}
function goToPage(page) {
  currentPage.value = page;
}

onMounted(fetchOrders);
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
</style>
