<template>
  <div class="reservation-records-wrapper">
    <!-- 使用獨立的 Sidebar 組件 -->
    <MemberSidebar @logout="logout" />
    
    <div class="reservation-records">
      <div class="container my-4">
        <div class="page-header">
          <h2 class="page-title">
            <i class="bi bi-calendar-check"></i>
            我的訂位紀錄
          </h2>
        </div>

        <div v-if="loading" class="status-card loading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">載入中...</span>
          </div>
          <p>載入中...</p>
        </div>
        
        <div v-else-if="records.length === 0" class="status-card empty">
          <i class="bi bi-inbox"></i>
          <p>目前沒有任何訂位紀錄</p>
        </div>

        <!-- 即將到來的訂位 -->
        <div v-else>
          <div class="section-header">
            <h4 class="section-title">
              <i class="bi bi-hourglass-split"></i>
              即將到來的訂位
            </h4>
            <button 
              v-if="upcomingRecords.length > 0" 
              class="btn-sort" 
              @click="toggleUpcomingSort"
              :title="upcomingSortAsc ? '由近到遠' : '由遠到近'"
            >
              <i :class="upcomingSortAsc ? 'bi bi-sort-down' : 'bi bi-sort-up'"></i>
              {{ upcomingSortAsc ? '由近到遠' : '由遠到近' }}
            </button>
          </div>

          <div v-if="sortedUpcomingRecords.length" class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>餐廳</th>
                  <th>日期</th>
                  <th>時段</th>
                  <th>人數</th>
                  <th>狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in sortedUpcomingRecords" :key="r.reservationID">
                  <td class="restaurant-cell">
                    <i class="bi bi-shop"></i>
                    {{ vendorMap[r.vendorID]?.vendorName || r.vendorID }}
                  </td>
                  <td>{{ r.reservationDate }}</td>
                  <td>{{ r.reservationPeriod }}</td>
                  <td>
                    <span class="guest-badge">
                      <i class="bi bi-people-fill"></i>
                      {{ r.guestCount }}
                    </span>
                  </td>
                  <td>
                    <span v-if="cleanStatus(r.rv_Status) === '已確認'" class="status-badge confirmed">
                      <i class="bi bi-check-circle-fill"></i>
                      已確認
                    </span>
                    <span v-else-if="cleanStatus(r.rv_Status) === '已取消'" class="status-badge cancelled">
                      <i class="bi bi-x-circle-fill"></i>
                      已取消
                    </span>
                    <span v-else class="status-badge pending">
                      <i class="bi bi-clock-fill"></i>
                      處理中
                    </span>
                  </td>
                  <td class="action-cell">
                    <button class="btn-action edit" @click="openEditModal(r)">
                      <i class="bi bi-pencil"></i>
                      修改
                    </button>
                    <button class="btn-action cancel" @click="openCancelModal(r)">
                      <i class="bi bi-trash"></i>
                      取消
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="status-card info">
            <i class="bi bi-info-circle"></i>
            <p>目前沒有即將到來的訂位</p>
          </div>

          <!-- 過去的訂位 -->
          <div class="section-header mt-5">
            <h4 class="section-title">
              <i class="bi bi-archive"></i>
              過去的訂位
            </h4>
            <button 
              v-if="pastRecords.length > 0" 
              class="btn-sort" 
              @click="togglePastSort"
              :title="pastSortAsc ? '由近到遠' : '由遠到近'"
            >
              <i :class="pastSortAsc ? 'bi bi-sort-down' : 'bi bi-sort-up'"></i>
              {{ pastSortAsc ? '由近到遠' : '由遠到近' }}
            </button>
          </div>

          <div v-if="sortedPastRecords.length" class="table-container">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>餐廳</th>
                  <th>日期</th>
                  <th>時段</th>
                  <th>人數</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in sortedPastRecords" :key="r.reservationID" class="past-record">
                  <td class="restaurant-cell">
                    <i class="bi bi-shop"></i>
                    {{ vendorMap[r.vendorID]?.vendorName || r.vendorID }}
                  </td>
                  <td>{{ r.reservationDate }}</td>
                  <td>{{ r.reservationPeriod }}</td>
                  <td>
                    <span class="guest-badge">
                      <i class="bi bi-people-fill"></i>
                      {{ r.guestCount }}
                    </span>
                  </td>
                  <td>
                    <span v-if="cleanStatus(r.rv_Status) === '已確認'" class="status-badge confirmed">
                      <i class="bi bi-check-circle-fill"></i>
                      已確認
                    </span>
                    <span v-else-if="cleanStatus(r.rv_Status) === '已取消'" class="status-badge cancelled">
                      <i class="bi bi-x-circle-fill"></i>
                      已取消
                    </span>
                    <span v-else class="status-badge pending">
                      <i class="bi bi-clock-fill"></i>
                      處理中
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="status-card info">
            <i class="bi bi-info-circle"></i>
            <p>目前沒有過去的訂位</p>
          </div>
        </div>

        <!-- 修改訂位 Modal -->
        <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content custom-modal">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="bi bi-pencil-square"></i>
                  修改訂位 - {{ vendorMap[editForm.vendorID]?.vendorName || editForm.vendorID }}
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" :disabled="submitting"></button>
              </div>
              <div class="modal-body">
                <div class="restaurant-info-box">
                  <div class="info-row">
                    <i class="bi bi-telephone-fill"></i>
                    <span>{{ vendorMap[editForm.vendorID]?.contactTel || '—' }}</span>
                  </div>
                  <div class="info-row">
                    <i class="bi bi-geo-alt-fill"></i>
                    <span>{{ vendorMap[editForm.vendorID]?.address || '—' }}</span>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="bi bi-calendar-event"></i>
                    日期
                  </label>
                  <Datepicker
                    v-model="editForm.reservationDate"
                    model-type="format"
                    format="yyyy-MM-dd"
                    :enable-time-picker="false"
                    :allowed-dates="availableDates"
                    :auto-apply="true"
                    :min-date="today"   
                    @update:model-value="onDateChange"
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="bi bi-clock"></i>
                    時段
                  </label>
                  <select v-model="editForm.reservationPeriod" class="form-select custom-select">
                    <option
                      v-if="originalReservationPeriod && editForm.reservationDate === originalReservationDate"
                      :value="originalReservationPeriod"
                    >
                      {{ originalReservationPeriod }}（原始訂位）
                    </option>
                    <option
                      v-for="p in sortedModalPeriods"
                      :key="p.period"
                      :value="p.period"
                      :disabled="p.capability === 0"
                    >
                      {{ p.period }}
                      <span v-if="p.capability === 0">（已無可訂位空位）</span>
                    </option>
                  </select>
                  <small v-if="editForm.reservationPeriod && !selectedPeriodAvailable" class="form-hint error">
                    <i class="bi bi-exclamation-circle"></i>
                    已無可訂位空位
                  </small>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="bi bi-people"></i>
                    人數
                  </label>
                  <select v-model.number="editForm.guestCount" class="form-select custom-select" @change="checkGuestCountValidity">
                    <option v-if="editForm.warning" :value="originalGuestCount" disabled>
                      原始人數：{{ originalGuestCount }}（已超過可用座位，最大可訂 {{ editForm.maxAllowed }} 人）
                    </option>
                    <option v-for="n in maxPeople" :key="n" :value="n">{{ n }}</option>
                  </select>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-modal secondary" data-bs-dismiss="modal" :disabled="submitting">取消</button>
                <button
                  class="btn-modal primary"
                  @click="submitEdit"
                  :disabled="submitting || !selectedPeriodAvailable"
                >
                  <i class="bi bi-check-lg"></i>
                  儲存修改
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 取消訂位 Modal -->
        <div class="modal fade" id="cancelModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content custom-modal">
              <div class="modal-header">
                <h5 class="modal-title">
                  <i class="bi bi-exclamation-triangle"></i>
                  取消訂位 - {{ vendorMap[cancelForm.vendorID]?.vendorName || cancelForm.vendorID }}
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div class="restaurant-info-box">
                  <div class="info-row">
                    <i class="bi bi-telephone-fill"></i>
                    <span>{{ vendorMap[cancelForm.vendorID]?.contactTel || '—' }}</span>
                  </div>
                  <div class="info-row">
                    <i class="bi bi-geo-alt-fill"></i>
                    <span>{{ vendorMap[cancelForm.vendorID]?.address || '—' }}</span>
                  </div>
                </div>

                <div class="cancel-summary">
                  <div class="summary-row">
                    <span class="label">日期</span>
                    <span class="value">{{ cancelForm.reservationDate }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="label">時段</span>
                    <span class="value">{{ cancelForm.reservationPeriod }}</span>
                  </div>
                  <div class="summary-row">
                    <span class="label">人數</span>
                    <span class="value">{{ cancelForm.guestCount }} 位</span>
                  </div>
                </div>

                <div class="warning-box">
                  <i class="bi bi-info-circle-fill"></i>
                  <p>確定要取消這筆訂位嗎？</p>
                </div>
              </div>
              <div class="modal-footer">
                <button class="btn-modal secondary" data-bs-dismiss="modal">返回</button>
                <button class="btn-modal danger" @click="confirmCancel">
                  <i class="bi bi-trash"></i>
                  確定取消
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "@/api/axiosInstance";
import axios from "axios";
import Swal from "sweetalert2";
import * as bootstrap from "bootstrap";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";
import MemberSidebar from "@/components/member/memberSidebar.vue";

const router = useRouter();

// 狀態
const records = ref([]);
const loading = ref(true);
const submitting = ref(false);

const vendorMap = ref({});
const editForm = ref({});
const cancelForm = ref({});
const member = ref({ userName: "", phone: "", account: "" });

const capabilitiesDetail = ref({});
const availableDatesMap = ref({});

const originalReservationDate = ref(null);
const originalReservationPeriod = ref(null);
const originalGuestCount = ref(0);

// 排序方向控制
const upcomingSortAsc = ref(true);
const pastSortAsc = ref(false);

// 今天（只取日期，不要時間）
const today = new Date();
today.setHours(0, 0, 0, 0);

// 工具函式
function cleanStatus(s) {
  return String(s || "").trim();
}

// 排序函式：根據日期和時段排序
function sortRecords(recordsList, ascending = true) {
  return [...recordsList].sort((a, b) => {
    // 先比較日期
    const dateA = new Date(a.reservationDate);
    const dateB = new Date(b.reservationDate);
    if (dateA.getTime() !== dateB.getTime()) {
      return ascending ? dateA - dateB : dateB - dateA;
    }
    // 日期相同，比較時段
    const timeA = a.reservationPeriod.split('-')[0].trim();
    const timeB = b.reservationPeriod.split('-')[0].trim();
    return ascending ? timeA.localeCompare(timeB) : timeB.localeCompare(timeA);
  });
}

// 分組：即將到來 / 過去
const upcomingRecords = computed(() =>
  records.value.filter(r => new Date(r.reservationDate) >= today)
);
const pastRecords = computed(() =>
  records.value.filter(r => new Date(r.reservationDate) < today)
);

// 排序後的訂位列表
const sortedUpcomingRecords = computed(() => 
  sortRecords(upcomingRecords.value, upcomingSortAsc.value)
);

const sortedPastRecords = computed(() => 
  sortRecords(pastRecords.value, pastSortAsc.value)
);

// 切換排序方向的函式
function toggleUpcomingSort() {
  upcomingSortAsc.value = !upcomingSortAsc.value;
}

function togglePastSort() {
  pastSortAsc.value = !pastSortAsc.value;
}

// Datepicker 可選日期
const availableDates = computed(() => {
  return availableDatesMap.value[editForm.value?.vendorID] || [];
});

// Modal 中的時段選項也要排序（較早的在上面）
const sortedModalPeriods = computed(() => {
  const periods = capabilitiesDetail.value[editForm.value?.vendorID]?.[editForm.value?.reservationDate] || [];
  return [...periods].sort((a, b) => {
    const timeA = a.period.split('-')[0].trim();
    const timeB = b.period.split('-')[0].trim();
    return timeA.localeCompare(timeB);
  });
});

// 最大人數選項
const maxPeople = computed(() => {
  if (!editForm.value.vendorID || !editForm.value.reservationDate || !editForm.value.reservationPeriod) return [];
  const list = capabilitiesDetail.value[editForm.value.vendorID]?.[editForm.value.reservationDate] || [];
  const found = list.find(p => p.period === editForm.value.reservationPeriod);
  if (!found) return [];

  let limit;
  if (
    editForm.value.reservationDate === originalReservationDate.value &&
    editForm.value.reservationPeriod === originalReservationPeriod.value
  ) {
    // 還在原本的日期+時段 → 原始人數加回去
    const availableSeats = found.capability + originalGuestCount.value;
    limit = Math.min(availableSeats, found.maxGuests);
  } else {
    // 換了日期或時段 → 不加原始人數
    limit = Math.min(found.capability, found.maxGuests);
  }

  return Array.from({ length: limit }, (_, i) => i + 1);
});

// 檢查人數有效性
function checkGuestCountValidity() {
  const v = editForm.value.vendorID;
  const d = editForm.value.reservationDate;
  const p = editForm.value.reservationPeriod;
  const list = capabilitiesDetail.value[v]?.[d] || [];
  const found = list.find(x => x.period === p);
  if (!found) {
    editForm.value.warning = null;
    return;
  }

  let maxAllowed;
  if (
    editForm.value.reservationDate === originalReservationDate.value &&
    editForm.value.reservationPeriod === originalReservationPeriod.value
  ) {
    const availableSeats = found.capability + originalGuestCount.value;
    maxAllowed = Math.min(availableSeats, found.maxGuests);
  } else {
    maxAllowed = Math.min(found.capability, found.maxGuests);
  }

  editForm.value.maxAllowed = maxAllowed;
  editForm.value.warning = originalGuestCount.value > maxAllowed;
}

// 判斷目前選定的時段是否可用
const selectedPeriodAvailable = computed(() => {
  const { vendorID, reservationDate, reservationPeriod } = editForm.value;
  if (!vendorID || !reservationDate || !reservationPeriod) return false;

  if (
    reservationDate === originalReservationDate.value &&
    reservationPeriod === originalReservationPeriod.value
  ) return true;

  const list = capabilitiesDetail.value[vendorID]?.[reservationDate] || [];
  const found = list.find(p => p.period === reservationPeriod);
  if (!found) return false;

  let maxAllowed;
  if (
    reservationDate === originalReservationDate.value &&
    reservationPeriod === originalReservationPeriod.value
  ) {
    const availableSeats = found.capability + originalGuestCount.value;
    maxAllowed = Math.min(availableSeats, found.maxGuests);
  } else {
    maxAllowed = Math.min(found.capability, found.maxGuests);
  }

  return maxAllowed > 0 && editForm.value.guestCount <= maxAllowed;
});

// 撈訂位紀錄
async function loadRecords() {
  try {
    const res = await axios.get("/api/reservations/my");
    records.value = (res.data?.data || []).map(r => ({
      ...r,
      reservationDate: String(r.reservationDate).slice(0, 10)
    }));
  } catch (err) {
    Swal.fire("載入失敗", err.response?.data?.message || err.message, "error");
  }
}

// 撈所有餐廳
async function loadVendorNames() {
  try {
    const res = await api.get("/vendor/all");
    const list = res.data || [];
    vendorMap.value = Object.fromEntries(list.map(v => [v.vendorId, v]));
  } catch (err) {
    console.error("載入店家名稱失敗", err);
  }
}

// 撈會員資訊
async function loadMemberInfo() {
  try {
    const res = await api.get("/api/member/profile");
    member.value = res.data;
  } catch (err) {
    console.error("無法載入會員資訊", err);
  }
}

// 撈 capabilities
async function loadCapabilities(vendorId) {
  const res = await axios.get(`/api/capabilities/vendor/${vendorId}/public`);
  const data = res.data?.data || [];
  const map = {};
  const dates = new Set();

  data.forEach(c => {
    const d = String(c.ReservationDate ?? c.reservationDate).slice(0, 10);
    const p = String(c.ReservationPeriod ?? c.reservationPeriod).trim();
    const cap = parseInt(c.Capability ?? c.capability, 10) || 0;
    const maxG = parseInt(c.MaxGuests ?? c.maxGuests, 10) || 0;

    if (!map[d]) map[d] = [];
    map[d].push({ period: p, capability: cap, maxGuests: maxG });

    if (cap > 0) dates.add(d);
  });

  capabilitiesDetail.value[vendorId] = map;
  availableDatesMap.value[vendorId] = [...dates];
}

// 日期改變時
function onDateChange() {
  const v = editForm.value.vendorID;
  const d = editForm.value.reservationDate;
  const list = capabilitiesDetail.value[v]?.[d] || [];
  const available = list.filter(p => p.capability > 0);

  if (available.length === 1) {
    editForm.value.reservationPeriod = available[0].period;
  } else if (!available.some(p => p.period === editForm.value.reservationPeriod)) {
    editForm.value.reservationPeriod = "";
  }
  checkGuestCountValidity();
}

// 開啟修改 Modal
async function openEditModal(record) {
  editForm.value = {
    ...record,
    reservationDate: String(record.reservationDate).slice(0, 10)
  };
  originalReservationDate.value = editForm.value.reservationDate;
  originalReservationPeriod.value = editForm.value.reservationPeriod;
  originalGuestCount.value = record.guestCount;

  await loadCapabilities(record.vendorID);
  checkGuestCountValidity();

  const modal = new bootstrap.Modal(document.getElementById("editModal"));
  modal.show();
}

// 送出修改
async function submitEdit() {
  // 取得餐廳資訊（用於郵件內容）
  const vendor = vendorMap.value[editForm.value.vendorID];
  const dto = {
    reservationID: editForm.value.reservationID,
    vendorId: editForm.value.vendorID,
    reservationDate: String(editForm.value.reservationDate).slice(0, 10),
    reservationPeriod: String(editForm.value.reservationPeriod).trim(),
    guestCount: Number(editForm.value.guestCount),
    // 餐廳資訊（用於郵件）
    vendorName: vendor?.vendorName || '',
    vendorTel: vendor?.contactTel || '',
    vendorAddress: vendor?.address || '',
    memberName: member.value.userName,
    memberEmail: member.value.account, 
    
    // 原始訂位資訊（用於郵件對比）
    originalReservationDate: originalReservationDate.value,
    originalReservationPeriod: originalReservationPeriod.value,
    originalGuestCount: originalGuestCount.value
  };

  try {
    submitting.value = true;
    const res = await axios.post("/api/reservations/my", dto);

    if (res.data?.success) {
      await Swal.fire("修改成功", "修改確認信已發送至您的信箱", "success");
      await loadRecords();
      bootstrap.Modal.getInstance(document.getElementById("editModal"))?.hide();
    } else {
      const msg = res.data?.message || "";
      if (msg.includes("座位不足") || msg.includes("新時段座位不足")) {
        await Swal.fire("修改失敗", "座位不足，無法修改", "error");
      } else {
        await Swal.fire("修改失敗", msg || "未知錯誤", "error");
      }
    }
  } catch (err) {
    let msg = err.response?.data?.message || err.message || "";
    if (msg.includes("座位不足") || msg.includes("新時段座位不足")) {
      msg = "修改失敗，座位不足";
    } else {
      msg = "修改失敗，請稍後再試";
    }
    await Swal.fire("修改失敗", msg, "error");
  } finally {
    submitting.value = false;
  }
}

// 開啟取消 Modal
function openCancelModal(record) {
  cancelForm.value = {
    ...record,
    reservationDate: String(record.reservationDate).slice(0, 10)
  };
  const modal = new bootstrap.Modal(document.getElementById("cancelModal"));
  modal.show();
}

// 確認取消
async function confirmCancel() {
  try {
    const res = await axios.delete(`/api/reservations/my/${cancelForm.value.reservationID}`);
    if (res.data?.success) {
      Swal.fire("已取消", "", "success");
      await loadRecords();
      bootstrap.Modal.getInstance(document.getElementById("cancelModal"))?.hide();
    } else {
      Swal.fire("取消失敗", res.data?.message || "", "error");
    }
  } catch (err) {
    Swal.fire("取消失敗", err.response?.data?.message || err.message, "error");
  }
}

// 登出函式
function logout() {
  // 清除登入狀態並導向首頁
  localStorage.removeItem('token');
  router.push('/');
}

// 初始化
onMounted(async () => {
  await Promise.all([loadRecords(), loadVendorNames(), loadMemberInfo()]);
  loading.value = false;
});
</script>

<style scoped>
/* 整體容器佈局 */
.reservation-records-wrapper {
  display: flex;
  min-height: 100vh;
}

/* 主內容區域 - 配合 sidebar */
.reservation-records {
  flex: 1;
  margin-right: 250px;  
  min-height: 100vh;
  background: linear-gradient(135deg, var(--milktea-bg) 0%, #f0ebe4 100%);
  padding: 2rem 0;
  transition: margin-left 0.3s ease;
}

/* 響應式調整 */
@media (max-width: 768px) {
  .reservation-records {
    margin-left: 0;
  }
}

/* 奶茶色系配色 */
:root {
  --milktea-primary: #c9a882;
  --milktea-dark: #a08060;
  --milktea-light: #e8d5c0;
  --milktea-bg: #faf7f2;
  --milktea-card: #ffffff;
  --milktea-text: #5c4a3a;
  --milktea-text-light: #8a7966;
  --milktea-border: #e8dcc8;
  --milktea-shadow: rgba(201, 168, 130, 0.15);
  --milktea-success: #8fa67e;
  --milktea-danger: #c98882;
  --milktea-info: #82a0c9;
}

.container {
  max-width: 1200px;
}

/* 頁面標題 */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--milktea-text);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid var(--milktea-primary);
}

.page-title i {
  color: var(--milktea-primary);
}

/* 狀態卡片 */
.status-card {
  background: var(--milktea-card);
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px var(--milktea-shadow);
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.status-card.loading {
  color: var(--milktea-primary);
}

.status-card i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--milktea-light);
}

.status-card.empty i {
  color: var(--milktea-text-light);
}

.status-card.info {
  background: var(--milktea-light);
  color: var(--milktea-text);
}

.status-card.info i {
  color: var(--milktea-primary);
}

.status-card p {
  margin: 0;
  font-size: 1.1rem;
  color: var(--milktea-text-light);
}

/* 區塊標題 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 2rem 0 1.5rem 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--milktea-text);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: linear-gradient(135deg, var(--milktea-light) 0%, #f5ede3 100%);
  border-radius: 12px;
  border-left: 4px solid var(--milktea-primary);
}

.section-title i {
  color: var(--milktea-primary);
  font-size: 1.3rem;
}

/* 排序按鈕樣式 */
.btn-sort {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  color: #495057;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-sort:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.btn-sort i {
  font-size: 1rem;
}

/* 表格容器 */
.table-container {
  background: var(--milktea-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--milktea-shadow);
  animation: fadeIn 0.4s ease-out;
}

/* 自訂表格 */
.custom-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0;
}

.custom-table thead {
  background: linear-gradient(135deg, var(--milktea-primary) 0%, var(--milktea-dark) 100%);
}

.custom-table thead th {
  padding: 1.25rem 1rem;
  text-align: left;
  font-weight: 600;
  color: #5c4a3a !important;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.custom-table tbody tr {
  border-bottom: 1px solid var(--milktea-border);
  transition: all 0.3s ease;
}

.custom-table tbody tr:hover {
  background: var(--milktea-bg);
  transform: translateX(4px);
}

.custom-table tbody tr.past-record {
  opacity: 0.7;
}

.custom-table tbody td {
  padding: 1.25rem 1rem;
  color: var(--milktea-text);
  font-size: 1.05rem;
  font-weight: 500;
  vertical-align: middle;
}

/* 餐廳名稱欄位 */
.restaurant-cell {
  font-weight: 600;
  color: var(--milktea-text);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.restaurant-cell i {
  color: var(--milktea-primary);
  font-size: 1.2rem;
}

/* 人數徽章 */
.guest-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--milktea-light);
  color: var(--milktea-text);
  padding: 0.4rem 0.9rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
}

.guest-badge i {
  font-size: 1.1rem;
}

/* 狀態徽章 */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.95rem;
}

.status-badge i {
  font-size: 1.1rem;
}

.status-badge.confirmed {
  background: rgba(143, 166, 126, 0.2);
  color: var(--milktea-success);
}

.status-badge.cancelled {
  background: rgba(201, 136, 130, 0.2);
  color: var(--milktea-danger);
}

.status-badge.pending {
  background: rgba(130, 160, 201, 0.2);
  color: var(--milktea-info);
}

/* 操作按鈕 */
.action-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.btn-action.edit {
  color: var(--milktea-text) !important;
  border-color: var(--milktea-primary);
  background: white;
}

.btn-action.edit:hover {
  background: var(--milktea-light);
  color: var(--milktea-text) !important;
  border-color: var(--milktea-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 168, 130, 0.3);
}

.btn-action.edit i {
  color: var(--milktea-text) !important;
}

.btn-action.cancel {
  color: var(--milktea-text) !important;
  border-color: var(--milktea-danger);
  background: white;
}

.btn-action.cancel:hover {
  background: rgba(201, 136, 130, 0.15);
  color: var(--milktea-text) !important;
  border-color: var(--milktea-danger);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 136, 130, 0.3);
}

.btn-action.cancel i {
  color: var(--milktea-text) !important;
}

/* Modal 樣式保持不變... */
/* Modal 客製化 */
.custom-modal .modal-header {
  background: linear-gradient(135deg, var(--milktea-primary) 0%, var(--milktea-dark) 100%);
  color: white;
  border-radius: 16px 16px 0 0;
  padding: 1.5rem;
  border: none;
}

.custom-modal .modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

.custom-modal .modal-title i {
  font-size: 1.3rem;
}

.custom-modal .btn-close {
  filter: brightness(0) invert(1);
}

.custom-modal .modal-body {
  padding: 2rem;
  background: var(--milktea-bg);
}

.custom-modal .modal-footer {
  background: var(--milktea-bg);
  border: none;
  padding: 1.5rem 2rem;
  border-radius: 0 0 16px 16px;
}

/* 餐廳資訊框 */
.restaurant-info-box {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--milktea-primary);
  box-shadow: 0 2px 8px var(--milktea-shadow);
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  color: var(--milktea-text);
  font-size: 1.05rem;
  font-weight: 500;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row i {
  color: var(--milktea-primary);
  font-size: 1.2rem;
}

/* 表單群組 */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--milktea-text);
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
}

.form-label i {
  color: var(--milktea-primary);
}

.custom-select {
  border: 2px solid var(--milktea-border);
  border-radius: 8px;
  padding: 0.75rem;
  color: var(--milktea-text);
  background: white;
  transition: all 0.3s ease;
}

.custom-select:focus {
  border-color: var(--milktea-primary);
  box-shadow: 0 0 0 3px rgba(201, 168, 130, 0.1);
  outline: none;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

.form-hint.error {
  color: var(--milktea-danger);
}

.form-hint i {
  font-size: 1rem;
}

/* Modal 按鈕樣式 */
.modal-footer .btn-modal {
  padding: 0.75rem 1.5rem !important;
  border-radius: 8px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  font-size: 0.95rem !important;
}

.modal-footer .btn-modal.secondary {
  background: white !important;
  color: var(--milktea-text) !important;
  border: 2px solid var(--milktea-border) !important;
}

.modal-footer .btn-modal.secondary:hover {
  background: var(--milktea-bg) !important;
  color: var(--milktea-text) !important;
}

.modal-footer .btn-modal.primary {
  background: var(--milktea-light) !important;
  color: var(--milktea-text) !important;
  box-shadow: 0 4px 12px rgba(201, 168, 130, 0.3) !important;
  border: 2px solid var(--milktea-primary) !important;
}

.modal-footer .btn-modal.primary:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(201, 168, 130, 0.4) !important;
  color: var(--milktea-text) !important;
  background: var(--milktea-primary) !important;
}

.modal-footer .btn-modal.primary:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
  transform: none !important;
  background: var(--milktea-light) !important;
  color: var(--milktea-text) !important;
}

.modal-footer .btn-modal.danger {
  background: rgba(201, 136, 130, 0.2) !important;
  color: var(--milktea-text) !important;
  box-shadow: 0 4px 12px rgba(201, 136, 130, 0.3) !important;
  border: 2px solid var(--milktea-danger) !important;
}

.modal-footer .btn-modal.danger:hover {
  background: rgba(201, 136, 130, 0.35) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 16px rgba(201, 136, 130, 0.4) !important;
  color: var(--milktea-text) !important;
}

/* 其他樣式保持不變... */
</style>