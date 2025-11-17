<template>
  <div class="vendor-management">
    <div class="container mt-4">

      <!-- 標題 -->
      <div class="page-header">
        <h3 class="page-title">
          <i class="bi bi-calendar-check"></i>
          {{ activeTab === 'capabilities' ? '廠商訂位管理' : '收到的訂位紀錄' }}
        </h3>
      </div>

      <!-- 頁籤 -->
      <div class="mb-4">
        <div class="tab-buttons">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'capabilities' }"
            @click="activeTab = 'capabilities'"
          >
            <i class="bi bi-sliders"></i>
            訂位能力管理
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'reservations' }"
            @click="activeTab = 'reservations'"
          >
            <i class="bi bi-list-check"></i>
            收到的訂位紀錄
          </button>
        </div>
      </div>

      <!-- 強制換行/清除 -->
      <div style="width:100%; height:0; clear:both;"></div>

      <!-- 內容區容器 -->
      <div class="tab-content-container">
        <!-- 能力值管理 -->
        <section v-show="activeTab === 'capabilities'">
          <form @submit.prevent="onSubmit" class="capability-form">
            <div class="row gx-2 gy-2 align-items-end">
              <!-- 日期選擇器 + 小滑軌 -->
              <div class="col-12 col-lg-6">
                <label class="form-label">
                  <i class="bi bi-calendar-event"></i>
                  日期選擇
                </label>
                <div class="d-flex align-items-center gap-2">
                  <flat-pickr
                    v-if="closedDaysLoaded"
                    v-model="form.dateRange"
                    :config="dateConfig"
                    class="form-control custom-input"
                    id="dateRange"
                    @on-change="onPickerChange"
                    @on-close="onPickerClose"
                    required
                  />
                  <div v-else class="form-control custom-input loading-state">載入公休日中...</div>

                  <!-- 小小的 iOS-like segmented control -->
                  <div class="segmented-control">
                    <button
                      type="button"
                      :class="{ active: !isRangeMode }"
                      @click="isRangeMode = false"
                    >
                      單日
                    </button>
                    <button
                      type="button"
                      :class="{ active: isRangeMode }"
                      @click="isRangeMode = true"
                    >
                      範圍
                    </button>
                  </div>
                </div>
                <small class="form-hint">
                  <i class="bi bi-info-circle"></i>
                  公休日會自動被禁用
                </small>
              </div>

              <!-- 時段（開始/結束） -->
              <div class="col-12 col-md-6 col-lg-3">
                <div class="row g-2">
                  <div class="col-6">
                    <label class="form-label">
                      <i class="bi bi-clock"></i>
                      開始
                    </label>
                    <input type="time" class="form-control custom-input" v-model="periodStart" required />
                  </div>
                  <div class="col-6">
                    <label class="form-label">
                      <i class="bi bi-clock-fill"></i>
                      結束
                    </label>
                    <input type="time" class="form-control custom-input" v-model="periodEnd" required />
                  </div>
                </div>
                <small class="form-hint">
                  <i class="bi bi-info-circle"></i>
                  請設定時段範圍
                </small>
              </div>
              <div class="w-100"></div>

              <!-- 可容納 / 單筆上限 -->
              <div class="col-6 col-md-3">
                <label class="form-label">
                  <i class="bi bi-people"></i>
                  可容納人數（總）
                </label>
                <input type="number" class="form-control custom-input" v-model.number="form.capability" min="1" required />
              </div>
              <div class="col-6 col-md-3">
                <label class="form-label">
                  <i class="bi bi-person-check"></i>
                  單筆訂位最多
                </label>
                <input type="number" class="form-control custom-input" v-model.number="form.maxGuests" :max="form.capability" min="1" required />
              </div>

              <!-- 新增按鈕 -->
              <div class="col-12 col-md-6 col-lg-1 d-flex align-items-end">
                <button :disabled="isSubmitting" type="submit" class="btn-submit">
                  <span v-if="isSubmitting" class="spinner-border spinner-border-sm"></span>
                  {{ isEditing ? '更新' : isSubmitting ? '送出中' : '新增' }}
                </button>
              </div>
            </div>
          </form>

          <!-- 排序按鈕 -->
          <div class="section-header">
            <h4 class="section-title">訂位能力列表</h4>
            <div class="header-controls">
              <div class="per-page-control">
                <label>每頁顯示：</label>
                <select v-model.number="capabilitiesPerPage" @change="capabilitiesPage = 1">
                  <option :value="5">5 筆</option>
                  <option :value="10">10 筆</option>
                  <option :value="20">20 筆</option>
                  <option :value="50">50 筆</option>
                </select>
              </div>
              <button 
                v-if="validCapabilities.length > 0" 
                class="btn-sort" 
                @click="toggleCapabilitiesSort"
                :title="capabilitiesSortAsc ? '由近到遠' : '由遠到近'"
              >
                <i :class="capabilitiesSortAsc ? 'bi bi-sort-down' : 'bi bi-sort-up'"></i>
                {{ capabilitiesSortAsc ? '由近到遠' : '由遠到近' }}
              </button>
            </div>
          </div>

          <!-- 列表 -->
          <div class="table-card">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>時段</th>
                  <th>可容納</th>
                  <th>單筆上限</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in paginatedCapabilities" :key="item.reservationDate + '_' + item.reservationPeriod">
                  <td class="date-cell">
                    <i class="bi bi-calendar3"></i>
                    {{ item.reservationDate }}
                  </td>
                  <td class="period-cell">
                    <i class="bi bi-clock"></i>
                    {{ item.reservationPeriod }}
                  </td>
                  <td>
                    <span class="capacity-badge">{{ item.capability }}</span>
                  </td>
                  <td>
                    <span class="max-badge">{{ item.maxGuests }}</span>
                  </td>
                  <td class="action-cell">
                    <button class="btn-action edit" @click="onEdit(item)">
                      <i class="bi bi-pencil"></i>
                      編輯
                    </button>
                    <button class="btn-action delete" @click="onDelete(item)">
                      <i class="bi bi-trash"></i>
                      刪除
                    </button>
                  </td>
                </tr>
                <tr v-if="sortedCapabilities.length === 0">
                  <td colspan="5" class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>目前沒有能力值資料</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 能力值分頁控制器 -->
          <div v-if="capabilitiesTotalPages > 1" class="pagination-container">
            <div class="pagination-info">
              顯示第 {{ (capabilitiesPage - 1) * capabilitiesPerPage + 1 }} - 
              {{ Math.min(capabilitiesPage * capabilitiesPerPage, sortedCapabilities.length) }} 筆，
              共 {{ sortedCapabilities.length }} 筆
            </div>
            <div class="pagination-controls">
              <button 
                class="page-btn" 
                :disabled="capabilitiesPage === 1"
                @click="changeCapabilitiesPage(1)"
              >
                <i class="bi bi-chevron-bar-left"></i>
              </button>
              <button 
                class="page-btn" 
                :disabled="capabilitiesPage === 1"
                @click="changeCapabilitiesPage(capabilitiesPage - 1)"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              <span class="page-info">第 {{ capabilitiesPage }} / {{ capabilitiesTotalPages }} 頁</span>
              <button 
                class="page-btn" 
                :disabled="capabilitiesPage === capabilitiesTotalPages"
                @click="changeCapabilitiesPage(capabilitiesPage + 1)"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
              <button 
                class="page-btn" 
                :disabled="capabilitiesPage === capabilitiesTotalPages"
                @click="changeCapabilitiesPage(capabilitiesTotalPages)"
              >
                <i class="bi bi-chevron-bar-right"></i>
              </button>
            </div>
          </div>
        </section>

        <!-- 收到的訂位紀錄 -->
        <section v-show="activeTab === 'reservations'">
          <!-- ✅ 即將到來的訂位 -->
          <div class="section-header">
            <h4 class="section-title">
              <i class="bi bi-hourglass-split"></i>
              即將到來的訂位
            </h4>
            <div class="header-controls">
              <div class="per-page-control">
                <label>每頁顯示：</label>
                <select v-model.number="upcomingPerPage" @change="upcomingPage = 1">
                  <option :value="5">5 筆</option>
                  <option :value="10">10 筆</option>
                  <option :value="20">20 筆</option>
                  <option :value="50">50 筆</option>
                </select>
              </div>
              <button 
                v-if="upcomingReservations.length > 0" 
                class="btn-sort" 
                @click="toggleUpcomingSort"
                :title="upcomingSortAsc ? '由近到遠' : '由遠到近'"
              >
                <i :class="upcomingSortAsc ? 'bi bi-sort-down' : 'bi bi-sort-up'"></i>
                {{ upcomingSortAsc ? '由近到遠' : '由遠到近' }}
              </button>
            </div>
          </div>

          <div class="table-card">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>訂位日期</th>
                  <th>時段</th>
                  <th>人數</th>
                  <th>會員姓名</th>
                  <th>電話</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in paginatedUpcomingReservations" :key="r.reservationId">
                  <td class="date-cell">
                    <i class="bi bi-calendar3"></i>
                    {{ formatReservationDate(r.reservationDate) }}
                  </td>
                  <td class="period-cell">
                    <i class="bi bi-clock"></i>
                    {{ r.reservationPeriod }}
                  </td>
                  <td>
                    <span class="guest-badge">
                      <i class="bi bi-people-fill"></i>
                      {{ r.guestCount }}
                    </span>
                  </td>
                  <td class="member-cell">
                    <i class="bi bi-person"></i>
                    {{ r.memberInfo?.userName || '載入中...' }}
                  </td>
                  <td class="contact-cell">
                    <i class="bi bi-telephone"></i>
                    {{ r.memberInfo?.phone || '無電話號碼' }}
                  </td>
                  <td class="contact-cell">
                    <i class="bi bi-envelope"></i>
                    {{ r.memberInfo?.account || '載入中...' }}
                  </td>
                </tr>
                <tr v-if="sortedUpcomingReservations.length === 0">
                  <td colspan="6" class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>目前沒有即將到來的訂位</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 即將到來訂位分頁控制器 -->
          <div v-if="upcomingTotalPages > 1" class="pagination-container">
            <div class="pagination-info">
              顯示第 {{ (upcomingPage - 1) * upcomingPerPage + 1 }} - 
              {{ Math.min(upcomingPage * upcomingPerPage, sortedUpcomingReservations.length) }} 筆，
              共 {{ sortedUpcomingReservations.length }} 筆
            </div>
            <div class="pagination-controls">
              <button 
                class="page-btn" 
                :disabled="upcomingPage === 1"
                @click="changeUpcomingPage(1)"
              >
                <i class="bi bi-chevron-bar-left"></i>
              </button>
              <button 
                class="page-btn" 
                :disabled="upcomingPage === 1"
                @click="changeUpcomingPage(upcomingPage - 1)"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              <span class="page-info">第 {{ upcomingPage }} / {{ upcomingTotalPages }} 頁</span>
              <button 
                class="page-btn" 
                :disabled="upcomingPage === upcomingTotalPages"
                @click="changeUpcomingPage(upcomingPage + 1)"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
              <button 
                class="page-btn" 
                :disabled="upcomingPage === upcomingTotalPages"
                @click="changeUpcomingPage(upcomingTotalPages)"
              >
                <i class="bi bi-chevron-bar-right"></i>
              </button>
            </div>
          </div>

          <!-- ✅ 過去的訂位 -->
          <div class="section-header mt-5">
            <h4 class="section-title">
              <i class="bi bi-archive"></i>
              過去收到的訂位
            </h4>
            <div class="header-controls">
              <div class="per-page-control">
                <label>每頁顯示：</label>
                <select v-model.number="pastPerPage" @change="pastPage = 1">
                  <option :value="5">5 筆</option>
                  <option :value="10">10 筆</option>
                  <option :value="20">20 筆</option>
                  <option :value="50">50 筆</option>
                </select>
              </div>
              <button 
                v-if="pastReservations.length > 0" 
                class="btn-sort" 
                @click="togglePastSort"
                :title="pastSortAsc ? '由近到遠' : '由遠到近'"
              >
                <i :class="pastSortAsc ? 'bi bi-sort-down' : 'bi bi-sort-up'"></i>
                {{ pastSortAsc ? '由近到遠' : '由遠到近' }}
              </button>
            </div>
          </div>

          <div class="table-card">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>訂位日期</th>
                  <th>時段</th>
                  <th>人數</th>
                  <th>會員姓名</th>
                  <th>電話</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="r in paginatedPastReservations" :key="r.reservationId" class="past-record">
                  <td class="date-cell">
                    <i class="bi bi-calendar3"></i>
                    {{ formatReservationDate(r.reservationDate) }}
                  </td>
                  <td class="period-cell">
                    <i class="bi bi-clock"></i>
                    {{ r.reservationPeriod }}
                  </td>
                  <td>
                    <span class="guest-badge">
                      <i class="bi bi-people-fill"></i>
                      {{ r.guestCount }}
                    </span>
                  </td>
                  <td class="member-cell">
                    <i class="bi bi-person"></i>
                    {{ r.memberInfo?.userName || '載入中...' }}
                  </td>
                  <td class="contact-cell">
                    <i class="bi bi-telephone"></i>
                    {{ r.memberInfo?.phone || '無電話號碼' }}
                  </td>
                  <td class="contact-cell">
                    <i class="bi bi-envelope"></i>
                    {{ r.memberInfo?.account || '載入中...' }}
                  </td>
                </tr>
                <tr v-if="sortedPastReservations.length === 0">
                  <td colspan="6" class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <p>目前沒有過去的訂位</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 過去訂位分頁控制器 -->
          <div v-if="pastTotalPages > 1" class="pagination-container">
            <div class="pagination-info">
              顯示第 {{ (pastPage - 1) * pastPerPage + 1 }} - 
              {{ Math.min(pastPage * pastPerPage, sortedPastReservations.length) }} 筆，
              共 {{ sortedPastReservations.length }} 筆
            </div>
            <div class="pagination-controls">
              <button 
                class="page-btn" 
                :disabled="pastPage === 1"
                @click="changePastPage(1)"
              >
                <i class="bi bi-chevron-bar-left"></i>
              </button>
              <button 
                class="page-btn" 
                :disabled="pastPage === 1"
                @click="changePastPage(pastPage - 1)"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              <span class="page-info">第 {{ pastPage }} / {{ pastTotalPages }} 頁</span>
              <button 
                class="page-btn" 
                :disabled="pastPage === pastTotalPages"
                @click="changePastPage(pastPage + 1)"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
              <button 
                class="page-btn" 
                :disabled="pastPage === pastTotalPages"
                @click="changePastPage(pastTotalPages)"
              >
                <i class="bi bi-chevron-bar-right"></i>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import axios from "axios";
import Swal from "sweetalert2";
import flatPickr from "vue-flatpickr-component";
import "flatpickr/dist/flatpickr.css";
import api from "@/api/axiosInstance";

// state
const activeTab = ref("capabilities");
const isRangeMode = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);

const form = ref({
  dateRange: null,
  reservationPeriod: "",
  capability: 1,
  maxGuests: 1,
});

const rsCapabilities = ref([]);
const reservations = ref([]);
const closedDays = ref([]);
const closedDaysLoaded = ref(false);

// 排序方向控制
const capabilitiesSortAsc = ref(true);  // 能力值列表：由近到遠
const upcomingSortAsc = ref(true);      // 即將到來的訂位：由近到遠
const pastSortAsc = ref(false);         // 過去的訂位：由遠到近

// 分頁控制
const capabilitiesPage = ref(1);
const capabilitiesPerPage = ref(10);
const upcomingPage = ref(1);
const upcomingPerPage = ref(10);
const pastPage = ref(1);
const pastPerPage = ref(10);

let editingOriginalDate = "";
let editingOriginalPeriod = "";

// period start/end (allow minutes)
const periodStart = ref("");
const periodEnd = ref("");

// ✅ 今天（只取日期，不要時間）
const today = new Date();
today.setHours(0, 0, 0, 0);

// helpers
function toYMDString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function ensureLocalDate(input) {
  if (input instanceof Date && !isNaN(input)) return new Date(input.getFullYear(), input.getMonth(), input.getDate());
  if (typeof input === "string") {
    const ym = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input);
    if (ym) return new Date(Number(ym[1]), Number(ym[2]) - 1, Number(ym[3]));
    const dt = new Date(input);
    return isNaN(dt) ? null : new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
  }
  const dt = new Date(input);
  return isNaN(dt) ? null : new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
}
function normalizeDateRange(val) {
  if (!val && val !== 0) return [];
  if (Array.isArray(val)) {
    const a = val.map(v => ensureLocalDate(v)).filter(Boolean);
    if (a.length === 1) return [a[0], a[0]];
    if (a.length >= 2) return [a[0], a[1]];
    return [];
  }
  if (val instanceof Date) {
    const d = ensureLocalDate(val);
    return d ? [d, d] : [];
  }
  if (typeof val === "string") {
    const matches = val.match(/\d{4}-\d{2}-\d{2}/g) || [];
    if (matches.length >= 2) return [ensureLocalDate(matches[0]), ensureLocalDate(matches[1])];
    if (matches.length === 1) return [ensureLocalDate(matches[0]), ensureLocalDate(matches[0])];
    const d = ensureLocalDate(val);
    return d ? [d, d] : [];
  }
  const d = ensureLocalDate(val);
  return d ? [d, d] : [];
}
function dateEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function formatReservationDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ✅ 排序函式：根據日期和時段排序
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

// ✅ 過濾掉過期的能力值（只顯示今天及以後的）
const validCapabilities = computed(() => {
  return rsCapabilities.value.filter(item => {
    const itemDate = new Date(item.reservationDate);
    return itemDate >= today;
  });
});

// ✅ 排序後的能力值列表
const sortedCapabilities = computed(() => 
  sortRecords(validCapabilities.value, capabilitiesSortAsc.value)
);

// ✅ 新增：能力值分頁相關 computed
const capabilitiesTotalPages = computed(() => 
  Math.ceil(sortedCapabilities.value.length / capabilitiesPerPage.value)
);
const paginatedCapabilities = computed(() => {
  const start = (capabilitiesPage.value - 1) * capabilitiesPerPage.value;
  const end = start + capabilitiesPerPage.value;
  return sortedCapabilities.value.slice(start, end);
});

// ✅ 分組訂位紀錄：即將到來 / 過去
const upcomingReservations = computed(() =>
  reservations.value.filter(r => new Date(r.reservationDate) >= today)
);

const pastReservations = computed(() =>
  reservations.value.filter(r => new Date(r.reservationDate) < today)
);

// ✅ 排序後的訂位列表
const sortedUpcomingReservations = computed(() => 
  sortRecords(upcomingReservations.value, upcomingSortAsc.value)
);

const sortedPastReservations = computed(() => 
  sortRecords(pastReservations.value, pastSortAsc.value)
);

// 訂位紀錄分頁相關 computed
const upcomingTotalPages = computed(() => 
  Math.ceil(sortedUpcomingReservations.value.length / upcomingPerPage.value)
);
const paginatedUpcomingReservations = computed(() => {
  const start = (upcomingPage.value - 1) * upcomingPerPage.value;
  const end = start + upcomingPerPage.value;
  return sortedUpcomingReservations.value.slice(start, end);
});

const pastTotalPages = computed(() => 
  Math.ceil(sortedPastReservations.value.length / pastPerPage.value)
);
const paginatedPastReservations = computed(() => {
  const start = (pastPage.value - 1) * pastPerPage.value;
  const end = start + pastPerPage.value;
  return sortedPastReservations.value.slice(start, end);
});

// ✅ 切換排序方向的函式
function toggleCapabilitiesSort() {
  capabilitiesSortAsc.value = !capabilitiesSortAsc.value;
}

function toggleUpcomingSort() {
  upcomingSortAsc.value = !upcomingSortAsc.value;
}

function togglePastSort() {
  pastSortAsc.value = !pastSortAsc.value;
}

// 分頁相關函式
function changeCapabilitiesPage(page) {
  if (page >= 1 && page <= capabilitiesTotalPages.value) {
    capabilitiesPage.value = page;
  }
}

function changeUpcomingPage(page) {
  if (page >= 1 && page <= upcomingTotalPages.value) {
    upcomingPage.value = page;
  }
}

function changePastPage(page) {
  if (page >= 1 && page <= pastTotalPages.value) {
    pastPage.value = page;
  }
}

// single definition: assignDateRangeSafely
function assignDateRangeSafely(newVal) {
  const cur = form.value.dateRange;
  if (!cur && !newVal) return;
  if (Array.isArray(cur) && Array.isArray(newVal)) {
    const a0 = cur[0], a1 = cur[1], b0 = newVal[0], b1 = newVal[1];
    if (dateEqual(a0, b0) && dateEqual(a1, b1)) return;
  }
  if (Array.isArray(cur) && newVal instanceof Date) {
    if (dateEqual(cur[0], newVal) && dateEqual(cur[1], newVal)) return;
  }
  if (cur instanceof Date) {
    if (newVal instanceof Date && dateEqual(cur, newVal)) return;
    if (Array.isArray(newVal) && dateEqual(cur, newVal[0]) && dateEqual(cur, newVal[1])) return;
  }
  form.value.dateRange = newVal;
}

// flatpickr config
const dateConfig = computed(() => ({
  mode: isRangeMode.value ? "range" : "single",
  dateFormat: "Y-m-d",
  altInput: false,
  allowInput: false,
  enableTime: false,
  disableMobile: true,
  minDate: 'today',
  onDayCreate: (dObj, dStr, fp, dayElem) => {
    const date = new Date(dayElem.dateObj);
    if (closedDays.value.includes(date.getDay())) {
      dayElem.style.pointerEvents = "none";
      dayElem.style.opacity = "0.4";
      dayElem.setAttribute("aria-disabled", "true");
    }
  },
}));

// fetch
async function fetchClosedDays() {
  try {
    const res = await api.get("/vendor/openingHours/self");
    if (!Array.isArray(res.data)) throw new Error("回傳不是陣列");
    const closed = res.data.filter(d => d.openingTime === null || d.openingTime === "").map(d => d.dayOfWeek);
    closedDays.value = closed.map(db => (db === 7 ? 0 : db));
  } catch (err) {
    console.error("fetchClosedDays error:", err);
    closedDays.value = [];
  } finally {
    closedDaysLoaded.value = true;
  }
}
async function fetchCapabilities() {
  try {
    const res = await axios.get("/api/capabilities/vendor", { withCredentials: true });
    rsCapabilities.value = res.data.success
      ? res.data.data.map(item => ({
          ...item,
          reservationDate: typeof item.reservationDate === "string" ? item.reservationDate : toYMDString(new Date(item.reservationDate)),
          reservationPeriod: String(item.reservationPeriod || "").trim(),
        })).filter(it => /^\d{4}-\d{2}-\d{2}$/.test(it.reservationDate))
      : [];
  } catch (err) {
    console.error("fetchCapabilities error:", err);
    rsCapabilities.value = [];
  }
}
async function fetchReservations() {
  try {
    const res = await axios.get("/api/reservations/vendor", { withCredentials: true });
    if (res.data.success) {
      const base = res.data.data;
      const memberPromises = base.map(r => {
        const memberKey = r.memberId || r.memberID || (r.member && r.member.memberId);
        return axios.get(`/api/member/vendor/member/${memberKey}`, { withCredentials: true })
          .then(mRes => ({ ...r, memberInfo: mRes.data }))
          .catch(() => ({ ...r, memberInfo: { userName: "未知", phone: "-", account: "-" } }));
      });
      reservations.value = await Promise.all(memberPromises);
    } else reservations.value = [];
  } catch (err) {
    console.error("fetchReservations error:", err);
    reservations.value = [];
  }
}

// flatpickr events
function onPickerChange(selectedDates) {
  if (isRangeMode.value) assignDateRangeSafely(selectedDates.length ? selectedDates : []);
  else assignDateRangeSafely(selectedDates[0] ?? null);
}
function onPickerClose(selectedDates, dateStr) {
  if ((selectedDates && selectedDates.length) || !dateStr) return;
  const norm = normalizeDateRange(dateStr);
  if (isRangeMode.value) assignDateRangeSafely(norm.length ? norm : []);
  else assignDateRangeSafely(norm.length ? norm[0] : null);
}

// period helpers: allow minutes; output HH:MM-HH:MM
function normalizeTimeToHHMM(t) {
  if (!t) return "";
  const parts = String(t).split(":");
  let hh = parseInt(parts[0], 10);
  let mm = parts[1] ? parseInt(parts[1], 10) : 0;
  if (isNaN(hh)) hh = 0;
  if (isNaN(mm)) mm = 0;
  return `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
}
function preparePeriod() {
  if (!periodStart.value || !periodEnd.value) {
    Swal.fire("錯誤", "請選擇開始與結束時間", "error");
    return false;
  }
  const s = normalizeTimeToHHMM(periodStart.value);
  const e = normalizeTimeToHHMM(periodEnd.value);
  const sh = parseInt(s.split(":")[0], 10);
  const eh = parseInt(e.split(":")[0], 10);
  if (isNaN(sh) || isNaN(eh) || (sh > eh) || (sh === eh && s >= e)) {
    Swal.fire("錯誤", "開始時間必須早於結束時間", "error");
    return false;
  }
  form.value.reservationPeriod = `${s}-${e}`;
  return true;
}

// submit
function validatePeriodStr(period) {
  return /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/.test(String(period || "").trim()) || /^\d{1,2}-\d{1,2}$/.test(String(period || "").trim());
}
async function onSubmit() {
  if (!preparePeriod()) return;
  if (!validatePeriodStr(form.value.reservationPeriod)) {
    Swal.fire("錯誤", "時段格式錯誤，請檢查開始/結束時間", "error");
    return;
  }

  const norm = normalizeDateRange(form.value.dateRange);
  const [start, end] = norm;
  if (!start || !end) {
    return Swal.fire("錯誤", "日期資料有誤，請用日期選擇器重新選擇", "error");
  }

  if (isEditing.value) {
    const sameDay = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth() && start.getDate() === end.getDate();
    if (!sameDay) return Swal.fire("錯誤", "編輯模式只支援單日編輯", "error");

    const dto = {
      reservationDate: toYMDString(start),
      reservationPeriod: form.value.reservationPeriod,
      capability: form.value.capability,
      maxGuests: form.value.maxGuests
    };

    isSubmitting.value = true;
    try {
      const res = await axios.put("/api/capabilities", dto, { withCredentials: true });
      if (res.data && res.data.success) {
        Swal.fire("成功", "更新完成", "success");
        resetForm();
        await fetchCapabilities();
      } else Swal.fire("錯誤", res.data?.message || "更新失敗", "error");
    } catch (err) {
      console.error("update error:", err);
      Swal.fire("錯誤", "伺服器錯誤，更新失敗", "error");
    } finally {
      isSubmitting.value = false;
    }
    return;
  }

  // 新增批次
  let st = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  let et = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  if (et < st) [st, et] = [et, st];

  const oneDay = 24 * 60 * 60 * 1000;
  const days = [];
  let skipped = 0;
  for (let t = st; t <= et; t += oneDay) {
    const d = new Date(t);
    const dateStr = toYMDString(d);
    if (closedDays.value.includes(d.getDay())) { skipped++; continue; }
    const exists = rsCapabilities.value.some(it => it.reservationDate === dateStr && it.reservationPeriod === form.value.reservationPeriod);
    if (!exists) days.push({ reservationDate: dateStr, reservationPeriod: form.value.reservationPeriod, capability: form.value.capability, maxGuests: form.value.maxGuests });
  }

  if (!days.length) return Swal.fire("錯誤", "選擇日期已存在資料或全為公休日", "error");
  const payloads = days.filter(x => /^\d{4}-\d{2}-\d{2}$/.test(x.reservationDate));
  if (!payloads.length) return Swal.fire("錯誤", "欲送出的日期格式有誤，取消送出", "error");

  isSubmitting.value = true;
  try {
    await Promise.all(payloads.map(day => axios.post("/api/capabilities", day, { withCredentials: true })));
    Swal.fire("成功", `新增完成，共新增 ${payloads.length} 筆${skipped > 0 ? `（略過 ${skipped} 天公休日）` : ""}`, "success");
    resetForm();
    await fetchCapabilities();
  } catch (err) {
    console.error("post error", err);
    Swal.fire("錯誤", "伺服器錯誤", "error");
  } finally {
    isSubmitting.value = false;
  }
}

// edit / delete / reset
function onEdit(item) {
  isEditing.value = true;
  const [y, month, day] = String(item.reservationDate).split("-");
  const dateObj = new Date(Number(y), Number(month) - 1, Number(day));
  assignDateRangeSafely(isRangeMode.value ? [dateObj, dateObj] : dateObj);

  form.value.reservationPeriod = String(item.reservationPeriod || "").trim();
  form.value.capability = item.capability;
  form.value.maxGuests = item.maxGuests;
  editingOriginalDate = item.reservationDate;
  editingOriginalPeriod = item.reservationPeriod;

  // 解析 reservationPeriod 回填時間欄位（支援 HH:MM-HH:MM 或 H-H）
  const p = String(form.value.reservationPeriod);
  const hhmmMatch = p.match(/^(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/);
  const hhMatch = p.match(/^(\d{1,2})-(\d{1,2})$/);
  if (hhmmMatch) {
    periodStart.value = hhmmMatch[1];
    periodEnd.value = hhmmMatch[2];
  } else if (hhMatch) {
    periodStart.value = `${hhMatch[1].padStart(2,"0")}:00`;
    periodEnd.value = `${hhMatch[2].padStart(2,"0")}:00`;
  } else {
    periodStart.value = "";
    periodEnd.value = "";
  }
}

async function onDelete(item) {
  const result = await Swal.fire({ title: "確定要刪除嗎？", icon: "warning", showCancelButton: true, confirmButtonText: "刪除" });
  if (!result.isConfirmed) return;
  try {
    const res = await axios.delete(`/api/capabilities/${item.reservationDate}/${item.reservationPeriod}`, { withCredentials: true });
    if (res.data.success) { Swal.fire("成功", "刪除完成", "success"); await fetchCapabilities(); }
    else Swal.fire("錯誤", res.data.message || "刪除失敗", "error");
  } catch (err) {
    console.error("delete error", err);
    Swal.fire("錯誤", "伺服器錯誤", "error");
  }
}

function resetForm() {
  assignDateRangeSafely(isRangeMode.value ? [] : null);
  form.value.reservationPeriod = "";
  form.value.capability = 1;
  form.value.maxGuests = 1;
  isEditing.value = false;
  editingOriginalDate = "";
  editingOriginalPeriod = "";
  periodStart.value = "";
  periodEnd.value = "";
}

onMounted(async () => {
  await fetchClosedDays();
  await fetchCapabilities();
  await fetchReservations();
});
</script>

<style scoped>
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
  --milktea-danger: #c98882;
}

.vendor-management {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--milktea-bg) 0%, #f0ebe4 100%);
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
}

/* 頁面標題 */
.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--milktea-text) !important;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid var(--milktea-primary);
  margin: 0;
}

.page-title i {
  color: var(--milktea-primary) !important;
}

/* 頁籤按鈕 */
.tab-buttons {
  display: inline-flex;
  gap: 1rem;
  background: white;
  padding: 0.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 12px var(--milktea-shadow);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: var(--milktea-text) !important;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn i {
  font-size: 1.1rem;
  color: var(--milktea-text) !important;
}

.tab-btn:hover {
  background: var(--milktea-bg);
}

.tab-btn.active {
  background: var(--milktea-primary);
  color: var(--milktea-text) !important;
  border-color: var(--milktea-dark);
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(201, 168, 130, 0.4);
}

.tab-btn.active i {
  color: var(--milktea-text) !important;
}

/* 內容容器 */
.tab-content-container {
  min-height: 300px;
  padding: 0;
}

/* 區段標題和排序按鈕 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  margin-top: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--milktea-text) !important;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.section-title i {
  color: var(--milktea-primary) !important;
}

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

/* 表單樣式 */
.capability-form {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px var(--milktea-shadow);
  margin-bottom: 2rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: var(--milktea-text) !important;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-label i {
  color: var(--milktea-primary) !important;
  font-size: 1rem;
}

.custom-input {
  border: 3px solid var(--milktea-primary) !important;
  border-radius: 10px !important;
  padding: 0.75rem 0.9rem !important;
  color: var(--milktea-text) !important;
  background: white !important;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.5;
  min-height: 48px;
  height: auto !important;
  box-shadow: 0 2px 8px rgba(201, 168, 130, 0.2) !important;
  cursor: pointer;
}

.custom-input:hover {
  border-color: var(--milktea-dark) !important;
  box-shadow: 0 4px 12px rgba(201, 168, 130, 0.3) !important;
  transform: translateY(-1px);
}

.custom-input[type="time"] {
  padding: 0.75rem 0.75rem !important;
  min-height: 48px;
  height: 48px !important;
  display: flex;
  align-items: center;
}

.custom-input[type="time"]::-webkit-calendar-picker-indicator {
  margin-left: 0.5rem;
  cursor: pointer;
}

.custom-input[type="number"] {
  min-height: 48px;
  height: 48px !important;
}

.custom-input:focus {
  border-color: var(--milktea-dark) !important;
  box-shadow: 0 0 0 4px rgba(201, 168, 130, 0.3) !important;
  outline: none !important;
  transform: translateY(-1px);
}

.custom-input.loading-state {
  background: var(--milktea-bg) !important;
  color: var(--milktea-text-light) !important;
  cursor: not-allowed;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: var(--milktea-text-light) !important;
  font-size: 0.85rem;
  margin-top: 0.35rem;
}

.form-hint i {
  font-size: 0.9rem;
  color: var(--milktea-primary) !important;
}

/* Segmented Control - 改為更明顯的設計 */
.segmented-control {
  display: inline-flex;
  background: white;
  border: 2px solid var(--milktea-primary);
  padding: 3px;
  border-radius: 999px;
  flex-shrink: 0;
}

.segmented-control button {
  border: none;
  padding: 6px 16px;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--milktea-text) !important;
  font-weight: 600;
  transition: all 0.2s ease;
}

.segmented-control button.active {
  background: var(--milktea-primary);
  box-shadow: 0 2px 6px rgba(201, 168, 130, 0.4);
  color: var(--milktea-text) !important;
  font-weight: 700;
}

/* 送出按鈕 */
.btn-submit {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--milktea-light);
  color: var(--milktea-text) !important;
  border: 2px solid var(--milktea-primary);
  border-radius: 12px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(201, 168, 130, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(201, 168, 130, 0.4);
  background: var(--milktea-primary);
  color: var(--milktea-text) !important;
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 表格卡片 */
.table-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px var(--milktea-shadow);
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
  color: var(--milktea-text) !important;
  font-size: 0.95rem;
  white-space: nowrap;
  border: none;
}

.custom-table tbody tr {
  border-bottom: 1px solid var(--milktea-border);
  transition: all 0.3s ease;
}

.custom-table tbody tr:hover {
  background: var(--milktea-bg);
}

.custom-table tbody tr:last-child {
  border-bottom: none;
}

.custom-table tbody td {
  padding: 1.25rem 1rem;
  color: var(--milktea-text) !important;
  font-size: 1rem;
  font-weight: 500;
  vertical-align: middle;
}

/* 過去的訂位紀錄樣式 */
.custom-table tbody tr.past-record {
  opacity: 0.7;
}

/* 表格內的特殊欄位 */
.date-cell {
  white-space: nowrap;
  color: var(--text-primary);
}

.date-cell i {
  color: var(--cream-gold);
  font-size: 1rem;
  margin-right: 0.5rem;
  vertical-align: middle;
}

.period-cell {
  white-space: nowrap;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--milktea-text) !important;
}

.period-cell i {
  color: var(--milktea-primary) !important;
  margin-right: 0.5rem;
}

.member-cell,
.contact-cell {
  color: var(--milktea-text) !important;
}

.member-cell i,
.contact-cell i {
  color: var(--milktea-primary) !important;
  margin-right: 0.5rem;
}

/* 徽章 */
.capacity-badge,
.max-badge {
  display: inline-block;
  padding: 0.4rem 0.9rem;
  background: var(--milktea-light);
  color: var(--milktea-text) !important;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.95rem;
}

.guest-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  background: var(--milktea-light);
  color: var(--milktea-text) !important;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.95rem;
}

.guest-badge i {
  font-size: 1rem;
  color: var(--milktea-text) !important;
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

.btn-action i {
  font-size: 0.95rem;
}

.btn-action.edit {
  color: var(--milktea-text) !important;
  border-color: var(--milktea-primary);
}

.btn-action.edit i {
  color: var(--milktea-text) !important;
}

.btn-action.edit:hover {
  background: var(--milktea-light);
  color: var(--milktea-text) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 168, 130, 0.3);
}

.btn-action.delete {
  color: var(--milktea-text) !important;
  border-color: var(--milktea-danger);
}

.btn-action.delete i {
  color: var(--milktea-text) !important;
}

.btn-action.delete:hover {
  background: rgba(201, 136, 130, 0.15);
  color: var(--milktea-text) !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(201, 136, 130, 0.3);
}

/* 空狀態 */
.empty-state {
  text-align: center;
  padding: 3rem 2rem !important;
  color: var(--milktea-text-light) !important;
}

.empty-state i {
  font-size: 3rem;
  color: var(--milktea-light) !important;
  margin-bottom: 1rem;
  display: block;
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
  color: var(--milktea-text) !important;
}

/* Flatpickr 客製化 */
:deep(.flatpickr-input) {
  color: var(--milktea-text) !important;
  border: 3px solid var(--milktea-primary) !important;
  border-radius: 10px !important;
  padding: 0.75rem 0.9rem !important;
  font-weight: 600 !important;
  font-size: 1rem !important;
  min-height: 48px !important;
  background: white !important;
  box-shadow: 0 2px 8px rgba(201, 168, 130, 0.2) !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
}

:deep(.flatpickr-input:hover) {
  border-color: var(--milktea-dark) !important;
  box-shadow: 0 4px 12px rgba(201, 168, 130, 0.3) !important;
  transform: translateY(-1px);
}

:deep(.flatpickr-input:focus) {
  border-color: var(--milktea-dark) !important;
  box-shadow: 0 0 0 4px rgba(201, 168, 130, 0.3) !important;
  outline: none !important;
  transform: translateY(-1px);
}

:deep(.flatpickr-calendar) {
  background: white !important;
  border: 2px solid var(--milktea-border) !important;
  box-shadow: 0 4px 20px var(--milktea-shadow) !important;
}

:deep(.flatpickr-months) {
  background: var(--milktea-primary) !important;
}

:deep(.flatpickr-current-month) {
  color: var(--milktea-text) !important;
}

:deep(.flatpickr-weekday) {
  color: var(--milktea-text) !important;
}

:deep(.flatpickr-day) {
  color: var(--milktea-text) !important;
}

:deep(.flatpickr-day.disabled) {
  color: #d0d0d0 !important;
  opacity: 0.4;
}

:deep(.flatpickr-day.selected) {
  background: var(--milktea-primary) !important;
  border-color: var(--milktea-primary) !important;
  color: var(--milktea-text) !important;
}

:deep(.flatpickr-day.today) {
  border-color: var(--milktea-primary) !important;
}

/* 每頁筆數控制器樣式 */
.header-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.per-page-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--milktea-text);
}

.per-page-control label {
  margin: 0;
  font-weight: 500;
}

.per-page-control select {
  padding: 0.4rem 0.8rem;
  border: 2px solid var(--milktea-primary);
  border-radius: 0.375rem;
  background: white;
  color: var(--milktea-text);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.per-page-control select:hover {
  border-color: var(--milktea-dark);
  background: var(--milktea-bg);
}

.per-page-control select:focus {
  outline: none;
  border-color: var(--milktea-dark);
  box-shadow: 0 0 0 3px rgba(201, 168, 130, 0.2);
}

/* 分頁控制器樣式 */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: white;
  border-top: 2px solid var(--milktea-border);
  border-radius: 0 0 16px 16px;
  margin-top: -16px;
}

.pagination-info {
  font-size: 0.9rem;
  color: var(--milktea-text);
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 2px solid var(--milktea-primary);
  border-radius: 8px;
  background: white;
  color: var(--milktea-text);
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--milktea-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(201, 168, 130, 0.3);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: var(--milktea-border);
}

.page-btn i {
  font-size: 1rem;
}

.page-info {
  padding: 0 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--milktea-text);
  white-space: nowrap;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .tab-buttons {
    width: 100%;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .tab-btn {
    width: 100%;
    justify-content: center;
  }
  
  .capability-form {
    padding: 1.5rem;
  }
  
  .action-cell {
    flex-direction: column;
  }
  
  .btn-action {
    width: 100%;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-controls {
    width: 100%;
    flex-direction: column;
    gap: 0.75rem;
  }

  .per-page-control {
    width: 100%;
    justify-content: space-between;
  }

  .per-page-control select {
    flex: 1;
    max-width: 150px;
  }

  .btn-sort {
    width: 100%;
    justify-content: center;
  }

  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }

  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>