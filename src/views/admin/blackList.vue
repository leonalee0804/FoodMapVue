<template>
  <div class="d-flex">
    <!-- 側邊欄 -->
    <nav id="sidebarMenu">
      <div class="bg-light p-3 vh-100" style="width: 220px;">
        <h4 class="mb-2">管理員儀表板</h4>
        <ul class="nav flex-column">
          <li class="nav-item mb-2">
            <RouterLink class="nav-link" to="/admin/adminHome">
              <i class="bi bi-speedometer2 me-2"></i> 儀表板
            </RouterLink>
          </li>
          <li class="nav-item mb-2">
            <RouterLink class="nav-link" to="/admin/adminAccounts">
              <i class="bi bi-person-fill-gear me-2"></i> 帳號管理
            </RouterLink>
          </li>
          <li class="nav-item mb-2">
            <RouterLink class="nav-link" to="/admin/blackList">
              <i class="bi bi-person-fill-slash me-2"></i> 黑名單管理
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
    <div class="flex-grow-1 p-4">
      <h2>黑名單管理</h2>

      <!-- 篩選區 -->
      <div class="d-flex flex-wrap align-items-center gap-3 mb-4">
        <input type="text" v-model="filters.keyword" class="form-control w-auto" placeholder="搜尋帳號或原因"
          @input="filterData" />
      </div>

      <!-- 黑名單表格 -->
      <div class="table-responsive shadow-sm rounded">
        <table class="table table-hover align-middle text-center">
          <thead class="table-danger">
            <tr>
              <th>ID</th>
              <th>帳號</th>
              <th>原因</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in pagedList" :key="item.memberId">
              <td>{{ item.memberId }}</td>
              <td>{{ item.account }}</td>
              <td>{{ item.reason }}</td>
            </tr>

            <tr v-if="filteredList.length === 0">
              <td colspan="3" class="text-center text-muted py-3">
                無黑名單資料
              </td>
            </tr>
          </tbody>
        </table>

      </div>

      <!-- 分頁控制 -->
      <nav class="mt-3">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 0 }" @click="changePage(currentPage - 1)">
            <a class="page-link" href="#">上一頁</a>
          </li>

          <li v-for="n in totalPages" :key="n" class="page-item" :class="{ active: currentPage === n - 1 }"
            @click="changePage(n - 1)">
            <a class="page-link" href="#">{{ n }}</a>
          </li>

          <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }"
            @click="changePage(currentPage + 1)">
            <a class="page-link" href="#">下一頁</a>
          </li>
        </ul>
      </nav>

      <!-- 每頁筆數設定 -->
      <div class="mt-3 text-center">
        <label class="me-2 fw-semibold">每頁筆數：</label>
        <select v-model.number="pageSize" class="form-select d-inline-block w-auto" @change="changePage(0)">
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const blacklist = ref([]);
const filters = ref({ keyword: "" });

const currentPage = ref(0);
const pageSize = ref(5);
const totalPages = ref(1);

// 取得黑名單
const loadData = async () => {
  try {
    const res = await axios.get("/api/blacklist/list");
    blacklist.value = res.data || [];
    currentPage.value = 0;
    computeTotalPages();
  } catch (err) {
    console.error(err);
    Swal.fire("錯誤", "無法取得黑名單資料", "error");
  }
};

// 篩選
const filteredList = computed(() => {
  if (!filters.value.keyword) return blacklist.value;
  const kw = filters.value.keyword.toLowerCase();
  return blacklist.value.filter(
    (item) =>
      item.account?.toLowerCase().includes(kw) ||
      item.reason?.toLowerCase().includes(kw)
  );
});

// 分頁計算
const computeTotalPages = () => {
  totalPages.value = Math.ceil(filteredList.value.length / pageSize.value) || 1;
};

const pagedList = computed(() => {
  const start = currentPage.value * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

// 每頁筆數或搜尋更新
const filterData = () => {
  currentPage.value = 0;
  computeTotalPages();
};

// 換頁
const changePage = (page) => {
  if (page < 0 || page >= totalPages.value) return;
  currentPage.value = page;
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
</style>
