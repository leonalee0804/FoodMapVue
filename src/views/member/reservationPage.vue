<template>
  <div class="reservation-page">
    <div class="container">
      <div class="row">
        <!-- 左邊：餐廳資訊 -->
        <div class="col-md-5 restaurant-info-card">
          <h1 v-if="vendor">{{ vendor.vendorName }}</h1>
          <h1 v-else class="loading">載入中...</h1>
          <div v-if="vendor" class="info-details">
            <div class="info-item">
              <i class="bi bi-telephone"></i>
              <span>{{ vendor.contactTel }}</span>
            </div>
            <div class="info-item">
              <i class="bi bi-geo-alt"></i>
              <span>{{ vendor.address }}</span>
            </div>
          </div>
        </div>

        <!-- 右邊：訂位表單 -->
        <div class="col-md-7 booking-card">
          <!-- 無可訂日期提示 -->
          <div v-if="availableDates.length === 0" class="alert-card">
            <i class="bi bi-calendar-x"></i>
            <h3>目前無可訂位日期</h3>
            <p>請稍後再試或選擇其他餐廳</p>
          </div>

          <!-- 訂位表單 -->
          <div v-else class="booking-form">
            <h2 class="form-title">預訂資訊</h2>

            <!-- 步驟 1: 選擇日期 -->
            <div class="form-step">
              <div class="step-label">
                <span class="step-number">1</span>
                <span class="step-text">選擇日期</span>
              </div>
              <div class="form-field">
                <Datepicker
                  v-model="editForm.reservationDate"
                  model-type="format"
                  format="yyyy-MM-dd"
                  :enable-time-picker="false"
                  :allowed-dates="availableDates"
                  :auto-apply="true"
                  :min-date="new Date()"
                  @update:model-value="onDateChange"
                  placeholder="請選擇日期"
                />
              </div>
            </div>

            <!-- 步驟 2: 選擇時段 - 改成下拉式選單 -->
            <div class="form-step" :class="{ disabled: !editForm.reservationDate }">
              <div class="step-label">
                <span class="step-number">2</span>
                <span class="step-text">選擇時段</span>
              </div>
              <div class="form-field">
                <select 
                  class="period-select" 
                  v-model="editForm.reservationPeriod"
                  :disabled="!editForm.reservationDate || (capabilitiesDetail[vendorId]?.[editForm.reservationDate] || []).length === 0"
                >
                  <option value="">請選擇時段</option>
                  <option
                    v-for="p in sortedPeriods"
                    :key="p.period"
                    :value="p.period"
                    :disabled="p.capability === 0"
                  >
                    {{ p.period }}
                    <span v-if="p.capability === 0">（已額滿）</span>
                  </option>
                </select>
                <small
                  v-if="editForm.reservationDate && (capabilitiesDetail[vendorId]?.[editForm.reservationDate] || []).length === 0"
                  class="error-hint"
                >
                  此日期無可訂時段
                </small>
              </div>
            </div>

            <!-- 步驟 3: 選擇人數 -->
            <div class="form-step" :class="{ disabled: !editForm.reservationPeriod }">
              <div class="step-label">
                <span class="step-number">3</span>
                <span class="step-text">選擇人數</span>
              </div>
              <div class="form-field">
                <div class="guest-selector">
                  <button
                    class="guest-btn minus"
                    :disabled="editForm.guestCount <= 1"
                    @click="editForm.guestCount--"
                  >
                    <i class="bi bi-dash"></i>
                  </button>
                  <div class="guest-count">
                    <span class="count-number">{{ editForm.guestCount }}</span>
                    <span class="count-label">位</span>
                  </div>
                  <button
                    class="guest-btn plus"
                    :disabled="editForm.guestCount >= maxPeople.length"
                    @click="editForm.guestCount++"
                  >
                    <i class="bi bi-plus"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- 確認按鈕 -->
            <div class="form-actions">
              <button
                class="btn-confirm"
                @click="confirmReservation"
                :disabled="!selectedPeriodAvailable || submitting"
              >
                <span v-if="submitting">
                  <span class="spinner"></span>
                  送出中...
                </span>
                <span v-else>
                  <i class="bi bi-check-circle"></i>
                  確認訂位
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/api/axiosInstance";   // ✅ 改用你統一的 axios instance
import Swal from "sweetalert2";
import Datepicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

const route = useRoute();
const router = useRouter();

const vendorId = route.params.vendorId;
const vendor = ref(null);

const editForm = ref({
  reservationDate: "",
  reservationPeriod: "",
  guestCount: 1,
  vendorID: vendorId
});

const submitting = ref(false);

// capabilitiesDetail: vendorId -> { 'YYYY-MM-DD': [{ period, capability }] }
const capabilitiesDetail = ref({});
// availableDatesMap: vendorId -> ['YYYY-MM-DD']
const availableDatesMap = ref({});

const maxPeople = computed(() => {
  if (!editForm.value.reservationDate || !editForm.value.reservationPeriod) return [];
  const list = capabilitiesDetail.value[vendorId]?.[editForm.value.reservationDate] || [];
  const found = list.find(p => p.period === editForm.value.reservationPeriod);
  if (!found) return [];
  const limit = Math.min(found.capability, found.maxGuests);
  return Array.from({ length: limit }, (_, i) => i + 1);
});

// 會員資訊
const member = ref({ userName: "", phone: "", email: "" });

// 可選日期（只允許有空位的日期）
const availableDates = computed(() => {
  return availableDatesMap.value[vendorId] || [];
});

// 判斷目前選定的時段是否可用
const selectedPeriodAvailable = computed(() => {
  if (!editForm.value.vendorID || !editForm.value.reservationDate || !editForm.value.reservationPeriod) return false;
  const list = capabilitiesDetail.value[editForm.value.vendorID]?.[editForm.value.reservationDate] || [];
  const found = list.find(p => p.period === editForm.value.reservationPeriod);
  return found && found.capability > 0;
});
//排序時段
const sortedPeriods = computed(() => {
  const periods = capabilitiesDetail.value[vendorId]?.[editForm.value.reservationDate] || [];
  return [...periods].sort((a, b) => {
    const timeA = a.period.split('-')[0].trim();
    const timeB = b.period.split('-')[0].trim();
    return timeA.localeCompare(timeB);
  });
});

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
}

// 撈 vendor 與 capabilities
async function loadVendorInfo() {
  try {
    // ✅ Vendor API 沒有 /api 前綴
    const res = await api.get(`/vendor/r/${vendorId}`);
    vendor.value = res.data;
    await loadCapabilities(vendorId);
  } catch (err) {
    Swal.fire("無法載入餐廳資料", err.response?.data?.message || err.message, "error");
  }
}

// 撈 capabilities 並整理成 map
async function loadCapabilities(vendorId) {
  // capabilities 還是走 /api
  const res = await api.get(`/api/capabilities/vendor/${vendorId}/public`);
  const data = res.data?.data || [];
  const map = {};
  const dates = new Set();

  data.forEach(c => {
    const rawDate = new Date(c.ReservationDate ?? c.reservationDate);
    const y = rawDate.getFullYear();
    const m = String(rawDate.getMonth() + 1).padStart(2, "0");
    const d = String(rawDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    const p = String(c.ReservationPeriod ?? c.reservationPeriod).trim();
    const cap = parseInt(c.Capability ?? c.capability, 10) || 0;
    const maxG = parseInt(c.MaxGuests ?? c.maxGuests, 10) || 0;

    if (!map[dateStr]) map[dateStr] = [];
    map[dateStr].push({ period: p, capability: cap, maxGuests: maxG });

    if (cap > 0) dates.add(dateStr); // ✅ 只收有空位的日期
  });

  capabilitiesDetail.value[vendorId] = map;
  availableDatesMap.value[vendorId] = [...dates];
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

// 確認視窗
async function confirmReservation() {
  if (!selectedPeriodAvailable.value) {
    return Swal.fire("不可送出", "該時段已無可預訂空位", "warning");
  }

  const htmlContent = `
    <div style="text-align:left">
      <p><strong>餐廳：</strong>${vendor.value.vendorName}</p>
      <p><strong>日期：</strong>${editForm.value.reservationDate}</p>
      <p><strong>時段：</strong>${editForm.value.reservationPeriod}</p>
      <p><strong>人數：</strong>${editForm.value.guestCount}</p>
      <hr/>
      <p><strong>訂位人：</strong>${member.value.userName}</p>
      <p><strong>電話：</strong>${member.value.phone}</p>
      <p><strong>Email：</strong>${member.value.account}</p>
    </div>
  `;

  const result = await Swal.fire({
    title: "確認訂位資訊",
    html: htmlContent,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "確認送出",
    cancelButtonText: "取消"
  });

  if (result.isConfirmed) {
    await submitReservation();
  }
}

// 送出訂位
async function submitReservation() {
  const dto = {
    vendorId,
    vendorName: vendor.value.vendorName,        // ✅ 新增：餐廳名稱
    reservationDate: String(editForm.value.reservationDate).slice(0, 10),
    reservationPeriod: String(editForm.value.reservationPeriod).trim(),
    guestCount: Number(editForm.value.guestCount),
    memberName: member.value.userName,
    memberPhone: member.value.phone,
    memberEmail: member.value.account           // ✅ 修改：改成 account
  };

  try {
    submitting.value = true;
    const res = await api.post("/api/reservations/my", dto);
    if (res.data?.success) {
      Swal.fire("訂位成功", "確認信已發送至您的信箱", "success").then(() => {  // ✅ 修改：加訊息
        router.push("/reservationrecords");
      });
    } else {
      Swal.fire("訂位失敗", res.data?.message || "未知錯誤", "error");
    }
  } catch (err) {
    let msg = err.response?.data?.message || err.message;
    if (msg.includes("座位不足")) {
      msg = "訂位失敗，座位不足";
    } else {
      msg = "訂位失敗，請稍後再試";
    }
    Swal.fire("訂位失敗", msg, "error");
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  loadVendorInfo();
  loadMemberInfo(); // ✅ 同時載入會員資訊
});
</script>

<style scoped>
/* 大地色系配色 */
:root {
  --earth-primary: #8b7355;
  --earth-light: #d4b896;
  --earth-bg: #f5f1e8;
  --earth-card: #ffffff;
  --earth-text: #5c4a3a;
  --earth-border: #e8dcc8;
  --earth-shadow: #ca93641a
}

* {
  box-sizing: border-box;
  color: var(--earth-text);
}

.reservation-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f1e8 0%, #ebe4d8 100%);
  display: flex;
  align-items: center; /* 垂直置中 */
  justify-content: center;
  padding: 3rem 0;
}

.container {
  max-width: 1000px;
  width: 100%;
  display: flex;
  gap: 2rem;
  align-items: center; /* 左右欄垂直置中 */
}

/* 左邊：餐廳資訊 */
.restaurant-info-card {
  flex: 1;
  background: var(--earth-light);
  padding: 2rem;
  border-radius: 16px 0 0 16px; /* 左邊圓角 */
  box-shadow: 0 4px 20px var(--earth-shadow);
  animation: fadeInDown 0.6s ease-out;
  border-right: 2px solid #ccc;
}


.restaurant-info-card h1 {
  font-size: 1.75rem; /* 稍微大一點 */
  font-weight: 700;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.info-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.info-item span {
  word-break: break-word; /* 自動換行 */
  white-space: normal;    /* 允許換行 */
}

/* 右邊：訂位表單 */
.booking-card {
  flex: 2;
  background: var(--earth-card);
  border-radius: 0 16px 16px 0; /* 右邊圓角 */
  padding: 2rem;
  box-shadow: 0 6px 20px var(--earth-shadow);
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--earth-light);
}

/* 表單步驟 */
.form-step { margin-bottom: 2rem; }
.form-step.disabled { opacity: 0.5; pointer-events: none; }

.step-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}
.step-number {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: var(--earth-primary);
  color: var(--earth-card);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 0.9rem;
}
.step-text { font-size: 1rem; font-weight: 600; }
.form-field { padding-left: 2rem; }

/* 時段下拉選單樣式 */
.period-select {
  width: 100%;
  padding: 1rem;
  border: 3px solid var(--earth-primary);
  border-radius: 12px;
  background: white;
  color: var(--earth-text);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(139, 115, 85, 0.2);
}

.period-select:hover:not(:disabled) {
  border-color: var(--earth-dark);
  box-shadow: 0 4px 12px rgba(139, 115, 85, 0.3);
  transform: translateY(-1px);
}

.period-select:focus {
  border-color: var(--earth-dark);
  box-shadow: 0 0 0 4px rgba(139, 115, 85, 0.2);
  outline: none;
  transform: translateY(-1px);
}

.period-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.period-select option:disabled {
  color: #999;
}

/* 人數選擇器 */
.guest-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--earth-bg);
  border: 2px solid var(--earth-border);
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  width: fit-content;
}
.guest-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 2px solid var(--earth-primary);
  background: var(--earth-card);
  color: var(--earth-primary);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}
.guest-btn:hover:not(:disabled) {
  background: var(--earth-primary);
  color: var(--earth-card);
}
.guest-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.guest-count {
  display: flex; align-items: baseline;
  gap: 0.25rem; min-width: 60px; justify-content: center;
}
.count-number { font-size: 1.5rem; font-weight: 700; }
.count-label { font-size: 1rem; }

/* 確認按鈕 */
.form-actions {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--earth-border);
}
.btn-confirm {
  width: 100%; 
  padding: 1rem;
  background: var(--earth-primary);
  color: var(--earth-card);
  border: none; 
  border-radius: 12px;
  font-size: 1.1rem; 
  font-weight: 600;
  cursor: pointer; 
  transition: all 0.3s ease;
  animation: breathing 1s infinite ease-in-out;
}
.btn-confirm:hover:not(:disabled) { background: #d7ae85; }
.btn-confirm:disabled { 
  opacity: 0.6; 
  cursor: not-allowed;
  animation: none;
}
@keyframes breathing {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(139, 115, 85, 0.3);
    transform: scale(1);
  }
  
  50% {
    box-shadow: 0 4px 20px rgba(139, 115, 85, 0.6);
    transform: scale(1.02);
  }
}

/* Datepicker 客製化 */
:deep(.dp__input_icon) { display: none !important; }
:deep(.dp__input) {
  border: 2px solid var(--earth-border);
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  color: var(--earth-text);
  background: var(--earth-card);
}
:deep(.dp__input:hover) { border-color: var(--earth-primary); }
:deep(.dp__input:focus) {
  border-color: var(--earth-primary);
  box-shadow: 0 0 0 2px rgba(139, 115, 85, 0.1);
}
:deep(.dp__active_date) {
  background: var(--earth-primary) !important;
  color: var(--earth-card) !important;
}
:deep(.dp__today) { border-color: var(--earth-primary); }
</style>
