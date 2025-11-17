<template>
  <div class="d-flex">
    <!-- 側邊欄 -->
    <nav id="sidebarMenu">
      <div class="bg-light p-3 vh-100" style="width: 220px">
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
              <i class="bi bi-person-fill-gear me-2"></i> 客服案件管理
            </RouterLink>
          </li>
          <li class="nav-item border-top mt-auto pt-2">
            <RouterLink class="nav-link" to="/logout">
              <i class="bi bi-box-arrow-left me-2"></i> Logout
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <!-- 主內容 -->
    <div class="flex-grow-1 p-4">
      <h2>客服案件管理</h2>

      <!-- 查詢區 -->
      <div class="d-flex flex-wrap align-items-center gap-3 mb-4">
        <label for="search">查詢案件：</label>
        <input
          class="form-control w-auto"
          type="text"
          id="search"
          v-model="keyword"
          placeholder="輸入會員信箱、ID或廠商編號查詢"
        />
        <button class="btn btn-outline-secondary" @click="searchData">
          查詢
        </button>
        <button class="btn btn-outline-secondary" @click="loadAll">
          顯示全部
        </button>
        <button class="btn btn-success" @click="searchbyStatus">
          顯示未結案
        </button>
      </div>

      <!-- 案件表格 -->
      <div class="table-responsive shadow-sm rounded">
        <table class="table table-hover align-middle text-center">
          <thead class="table-warning">
            <tr>
              <th></th>
              <th>編號</th>
              <th>會員ID</th>
              <th>主旨</th>
              <th>案件成立時間</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="c in pagedCases" :key="c.customerServiceId">
              <!-- 主列 -->
              <tr class="main-row">
                <td
                  @click="toggleExpand(c.customerServiceId)"
                  class="arrow-cell"
                >
                  <span
                    class="arrow"
                    :class="{ expanded: expandedRow === c.customerServiceId }"
                    >▶</span
                  >
                </td>
                <td @click="toggleExpand(c.customerServiceId)">
                  {{ c.customerServiceId }}
                </td>
                <td @click="toggleExpand(c.customerServiceId)">
                  {{ c.memberId ?? "非會員" }}
                </td>
                <td @click="toggleExpand(c.customerServiceId)">
                  {{ c.subject }}
                </td>
                <td @click="toggleExpand(c.customerServiceId)">
                  {{ formatDate(c.createAt) }}
                </td>
                <td @click="toggleExpand(c.customerServiceId)">
                  {{ c.csStatus }}
                </td>
                <td>
                  <button
                    class="btn btn-outline-success btn-sm"
                    v-if="c.csStatus !== '已回覆'"
                    @click.stop="handleReply(c)"
                  >
                    按此回覆
                  </button>
                </td>
              </tr>

              <!-- 展開列 -->
              <tr v-if="expandedRow === c.customerServiceId" class="expand-row">
                <td colspan="7">
                  <div class="expanded-content">
                    <p><strong>廠商編號：</strong>{{ c.vendorId ?? "無" }}</p>
                    <p><strong>內容：</strong>{{ c.context }}</p>
                    <p><strong>客服回覆：</strong>{{ c.reply ?? "-" }}</p>
                    <p>
                      <strong>回覆時間：</strong>{{ formatDate(c.replyAt) }}
                    </p>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- 分頁控制 -->
      <div class="d-flex justify-content-center align-items-center mt-3 gap-3">
        <button
          class="btn btn-outline-secondary"
          @click="prevPage"
          :disabled="currentPage === 1"
        >
          上一頁
        </button>
        <span>第 {{ currentPage }} / {{ totalPages }} 頁</span>
        <button
          class="btn btn-outline-secondary"
          @click="nextPage"
          :disabled="currentPage === totalPages"
        >
          下一頁
        </button>

        <div class="ms-4">
          <label for="pageSizeSelect" class="me-2">每頁顯示</label>
          <select
            id="pageSizeSelect"
            v-model.number="pageSize"
            class="form-select d-inline-block w-auto"
          >
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          <span class="ms-1">筆</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const customerServiceCases = ref([]);
const keyword = ref("");
const expandedRow = ref(null);

const currentPage = ref(1);
const pageSize = ref(10);

// --- 分頁邏輯 ---
const totalPages = computed(
  () => Math.ceil(customerServiceCases.value.length / pageSize.value) || 1
);

const pagedCases = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return customerServiceCases.value.slice(start, start + pageSize.value);
});

function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}
watch(pageSize, () => (currentPage.value = 1));

// --- API 與功能 ---
async function fetchAllCsCases() {
  const response = await axios.post(
    "http://localhost:8082/customerservice/find"
  );
  customerServiceCases.value = response.data;
}

function toggleExpand(id) {
  expandedRow.value = expandedRow.value === id ? null : id;
}

async function searchData() {
  if (!keyword.value.trim()) {
    Swal.fire("請輸入關鍵字");
    return;
  }
  try {
    const response = await axios.get(
      "http://localhost:8082/customerservice/search",
      {
        params: { keyword: keyword.value },
      }
    );
    customerServiceCases.value = response.data;
    currentPage.value = 1;
    if (response.data.length === 0) Swal.fire("查無資料");
  } catch (error) {
    Swal.fire("查詢失敗");
    console.error(error);
  }
}

function loadAll() {
  keyword.value = "";
  fetchAllCsCases();
}

function searchbyStatus() {
  customerServiceCases.value = customerServiceCases.value.filter(
    (c) => c.csStatus !== "已回覆"
  );
  currentPage.value = 1;
}

async function handleReply(c) {
  const { value: replyText } = await Swal.fire({
    title: `回覆案件 #${c.customerServiceId}`,
    input: "textarea",
    inputPlaceholder: "輸入回覆內容",
    showCancelButton: true,
    confirmButtonText: "送出",
  });
  if (!replyText) return;
  try {
    const payload = {
      ...c,
      reply: replyText,
      replyAt: new Date(),
      csStatus: "已回覆",
    };
    await axios.put(
      `http://localhost:8082/customerservice/${c.customerServiceId}`,
      payload
    );
    Swal.fire("已回覆並結案");
    fetchAllCsCases();
  } catch (error) {
    Swal.fire("回覆失敗");
    console.error(error);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString();
}

onMounted(fetchAllCsCases);
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}

.expanded-content {
  padding: 10px 15px;
  line-height: 1.6;
  text-align: left;
}

.arrow {
  cursor: pointer;
  transition: transform 0.2s;
}

.arrow.expanded {
  transform: rotate(90deg);
}
</style>
