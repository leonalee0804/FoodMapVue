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
              <i class="bi-person-fill-gear me-2"></i> 帳號管理
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
      <h2>Admin Dashboard</h2>

      <!-- 篩選區 -->
      <div class="d-flex flex-wrap align-items-center gap-3 mb-4">
        <input
          type="text"
          v-model="filters.account"
          class="form-control w-auto"
          placeholder="搜尋帳號"
          @input="currentPage = 0"
        />
        <select
          v-model.number="filters.role"
          class="form-select w-auto"
          @change="currentPage = 0"
        >
          <option value="">全部角色</option>
          <option value="1">管理員</option>
          <option value="2">會員</option>
          <option value="3">廠商</option>
        </select>
        <select
          v-model.number="filters.status"
          class="form-select w-auto"
          @change="currentPage = 0"
        >
          <option value="">全部狀態</option>
          <option value="0">測試用</option>
          <option value="1">啟用</option>
          <option value="2">停用</option>
          <option value="3">黑名單</option>
        </select>
        <label class="ms-auto me-2">每頁筆數：</label>
        <select
          v-model.number="pageSize"
          class="form-select w-auto"
          @change="currentPage = 0"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>

      <!-- 使用者表格 -->
      <div class="table-responsive shadow-sm rounded">
        <table class="table table-hover align-middle text-center">
          <thead class="table-primary">
            <tr>
              <th>ID</th>
              <th>角色</th>
              <th>帳號</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in paginatedUsers" :key="user.accountId">
              <td>{{ user.accountId }}</td>
              <td>{{ getRoleName(user.userId?.id) }}</td>
              <td>{{ user.account }}</td>
              <td>
                <span :class="['badge', getStatusBadge(user.status)]">
                  {{ getStatusText(user.status) }}
                </span>
              </td>
              <td>
                <div class="d-flex justify-content-center gap-2">
                  <button
                    class="btn btn-outline-success btn-sm"
                    @click="openStatusChange(user)"
                  >
                    修改狀態
                  </button>
                  <button
                    class="btn btn-outline-danger btn-sm"
                    @click="deleteAccount(user.accountId)"
                  >
                    刪除
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedUsers.length === 0">
              <td colspan="5" class="text-center text-muted py-3">無資料</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 分頁控制 -->
      <nav class="mt-3">
        <ul class="pagination justify-content-center">
          <li
            class="page-item"
            :class="{ disabled: currentPage === 0 }"
            @click="changePage(currentPage - 1)"
          >
            <a class="page-link" href="#">上一頁</a>
          </li>
          <li
            v-for="n in totalPages"
            :key="n"
            class="page-item"
            :class="{ active: currentPage === n - 1 }"
            @click="changePage(n - 1)"
          >
            <a class="page-link" href="#">{{ n }}</a>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages - 1 }"
            @click="changePage(currentPage + 1)"
          >
            <a class="page-link" href="#">下一頁</a>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const users = ref([]);
const filters = reactive({ account: "", role: "", status: "" });
const currentPage = ref(0);
const pageSize = ref(5);

// 前端篩選
const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    const matchAccount =
      !filters.account ||
      u.account?.toLowerCase().includes(filters.account.toLowerCase());
    const matchRole = !filters.role || u.userId?.id === Number(filters.role);
    const matchStatus =
      filters.status === "" || u.status === Number(filters.status);
    return matchAccount && matchRole && matchStatus;
  });
});

// 前端分頁
const paginatedUsers = computed(() => {
  const start = currentPage.value * pageSize.value;
  return filteredUsers.value.slice(start, start + pageSize.value);
});

// 分頁總頁數
const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / pageSize.value)
);

// 換頁
const changePage = (page) => {
  if (page < 0 || page >= totalPages.value) return;
  currentPage.value = page;
};

// 角色名稱
const getRoleName = (roleId) =>
  ["未知", "管理員", "會員", "廠商"][roleId] || "未知";

// 狀態文字與顏色
const getStatusText = (status) =>
  ["測試用", "啟用", "停用", "黑名單"][Number(status)] || "未知";
const getStatusBadge = (status) =>
  ["bg-secondary", "bg-success", "bg-warning text-dark", "bg-danger"][
    Number(status)
  ] || "bg-light text-dark";

// 載入帳號資料
const loadData = async () => {
  try {
    const res = await axios.get("/api/accounts/all");
    users.value = res.data || [];
    currentPage.value = 0; // 重新回到第一頁
  } catch (err) {
    console.error(err);
    Swal.fire("錯誤", "無法取得帳號資料", "error");
  }
};

// 修改狀態
const openStatusChange = async (user) => {
  const originalStatus = user.status;
  const { value: newStatus } = await Swal.fire({
    title: `修改帳號狀態 - ${user.account}`,
    input: "select",
    inputOptions: { 0: "測試用", 1: "啟用", 2: "停用", 3: "黑名單" },
    inputValue: user.status,
    showCancelButton: true,
    confirmButtonText: "確認修改",
    cancelButtonText: "取消",
  });

  if (newStatus === undefined) return;
  const statusNum = parseInt(newStatus);

  // 黑名單流程
  if (statusNum === 3) {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "加入黑名單原因",
      input: "textarea",
      inputPlaceholder: "請輸入原因",
      showCancelButton: true,
      confirmButtonText: "送出",
      cancelButtonText: "取消",
      preConfirm: (v) => (v ? v : Swal.showValidationMessage("請輸入原因！")),
    });

    if (!isConfirmed || !reason) return;

    try {
      // 更新帳號狀態
      await axios.put(`/api/accounts/${user.accountId}/status`, { status: 3 });
      // 呼叫黑名單 Controller
      await axios.post("/api/blacklist", { memberId: user.memberId, reason });
      Swal.fire("成功", "已加入黑名單", "success");
      await loadData();
    } catch (err) {
      console.error(err);
      Swal.fire("錯誤", "加入黑名單失敗", "error");
      // 嘗試恢復原狀態
      try {
        await axios.put(`/api/accounts/${user.accountId}/status`, {
          status: originalStatus,
        });
      } catch (e) {}
      await loadData();
    }
    return;
  }

  // 一般狀態修改
  try {
    await axios.put(`/api/accounts/${user.accountId}/status`, {
      status: statusNum,
    });
    Swal.fire("成功", "帳號狀態已更新", "success");
    await loadData();
  } catch (err) {
    console.error(err);
    Swal.fire("錯誤", "更新狀態失敗", "error");
  }
};

// 刪除帳號
const deleteAccount = async (accountId) => {
  const result = await Swal.fire({
    title: "確認刪除？",
    text: `確定要刪除帳號 ${accountId} 嗎？`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "刪除",
    cancelButtonText: "取消",
  });

  if (!result.isConfirmed) return;

  try {
    await axios.delete(`/api/accounts/${accountId}`);
    Swal.fire("成功", "帳號已刪除", "success");
    await loadData();
  } catch (err) {
    console.error(err);
    Swal.fire("錯誤", "刪除帳號失敗", "error");
  }
};

onMounted(() => loadData());
</script>

<style scoped>
.table td,
.table th {
  vertical-align: middle;
}
.badge {
  font-size: 0.9rem;
  padding: 0.5em 0.75em;
}
</style>
