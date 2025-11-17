<template>
  <div class="vendor-details-container">
    <div v-if="details" class="details-card">
      <!-- 營業資訊卡片 -->
      <div class="info-section-card">
        <div class="card-header">
          <div class="header-content">
            <i class="bi bi-info-circle header-icon"></i>
            <h2 class="header-title">營業資訊</h2>
          </div>
          <!-- 營業時間按鈕 -->
          <button @click="showHoursModal = true" class="hours-button">
            <i class="bi bi-clock me-2"></i>營業時間設定
          </button>
        </div>

        <div class="card-body">
          <!-- 雙欄表單 -->
          <div class="form-grid-two-col">
            <!-- 座位數 -->
            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-person-workspace me-2"></i>座位數
              </label>
              <input
                type="number"
                class="form-input"
                v-model.number="details.seatsNumber"
                @input="validateSeatsNumber"
                placeholder="請輸入座位數"
              />
              <span v-if="seatError" class="error-message">
                <i class="bi bi-exclamation-circle me-1"></i>{{ seatError }}
              </span>
            </div>

            <!-- 服務費 -->
            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-receipt me-2"></i>服務費
              </label>
              <select class="form-select" v-model="details.serviceCharge">
                <option :value="0">0%</option>
                <option :value="10">10%</option>
              </select>
            </div>

            <!-- 最低價格 -->
            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-currency-dollar me-2"></i>最低價格
              </label>
              <input
                type="number"
                class="form-input"
                v-model.number="details.priceMin"
                @input="validatePriceMin"
                placeholder="最低價格"
              />
              <span v-if="priceMinError" class="error-message">
                <i class="bi bi-exclamation-circle me-1"></i>{{ priceMinError }}
              </span>
            </div>

            <!-- 最高價格 -->
            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-currency-dollar me-2"></i>最高價格
              </label>
              <input
                type="number"
                class="form-input"
                v-model.number="details.priceMax"
                @input="validatePriceMax"
                placeholder="最高價格"
              />
              <span v-if="priceMaxError" class="error-message">
                <i class="bi bi-exclamation-circle me-1"></i>{{ priceMaxError }}
              </span>
            </div>
          </div>

          <!-- 設施選項 -->
          <div class="facilities-section">
            <h3 class="section-subtitle">
              <i class="bi bi-gear me-2"></i>店家設施
            </h3>
            <div class="checkbox-grid">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="details.airConditioner"
                  class="checkbox-input"
                />
                <span class="checkbox-text">
                  <i class="bi bi-snow2 me-2"></i>冷氣空調
                </span>
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="details.park"
                  class="checkbox-input"
                />
                <span class="checkbox-text">
                  <i class="bi bi-car-front me-2"></i>停車位
                </span>
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="details.babyFriendly"
                  class="checkbox-input"
                />
                <span class="checkbox-text">
                  <i class="bi bi-emoji-smile me-2"></i>嬰幼兒座位
                </span>
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="details.petFriendly"
                  class="checkbox-input"
                />
                <span class="checkbox-text">
                  <i class="bi bi-heart me-2"></i>寵物友善
                </span>
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="details.veganFriendly"
                  class="checkbox-input"
                />
                <span class="checkbox-text">
                  <i class="bi bi-flower1 me-2"></i>素食友善
                </span>
              </label>

              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="details.halalFriendly"
                  class="checkbox-input"
                />
                <span class="checkbox-text">
                  <i class="bi bi-moon-stars me-2"></i>清真認證
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- 儲存按鈕 -->
      <div class="action-footer">
        <button @click="updateAll" class="save-button">
          <i class="bi bi-check-circle me-2"></i>儲存修改
        </button>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-else class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="loading-text">載入中...</p>
    </div>

    <!-- 營業時間 Modal -->
    <div
      v-if="showHoursModal"
      class="modal-overlay"
      @click.self="showHoursModal = false"
    >
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-content">
            <i class="bi bi-clock header-icon"></i>
            <h2 class="header-title">營業時間設定</h2>
          </div>
          <button @click="showHoursModal = false" class="close-button">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="hours-grid">
            <div
              v-for="time in fullWeek"
              :key="time.dayOfWeek"
              class="hour-item"
            >
              <div class="day-header">
                <span class="day-label">{{ getDayName(time.dayOfWeek) }}</span>
                <label class="closed-toggle">
                  <input
                    type="checkbox"
                    v-model="time.isClosed"
                    class="checkbox-input"
                  />
                  <span class="closed-text">公休</span>
                </label>
              </div>

              <div class="time-inputs" :class="{ disabled: time.isClosed }">
                <div class="time-input-wrapper">
                  <i class="bi bi-clock me-2 time-icon"></i>
                  <input
                    type="time"
                    class="time-input"
                    v-model="time.openTime"
                    :disabled="time.isClosed"
                    placeholder="開始時間"
                  />
                </div>
                <span class="time-separator">~</span>
                <div class="time-input-wrapper">
                  <i class="bi bi-clock me-2 time-icon"></i>
                  <input
                    type="time"
                    class="time-input"
                    v-model="time.closeTime"
                    :disabled="time.isClosed"
                    placeholder="結束時間"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showHoursModal = false" class="cancel-button">
            <i class="bi bi-x-circle me-2"></i>取消
          </button>
          <button @click="saveHours" class="confirm-button">
            <i class="bi bi-check-circle me-2"></i>確認
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/api/axiosInstance";
import Swal from "sweetalert2";

const details = ref(null);
const fullWeek = ref([]);
const seatError = ref("");
const priceMinError = ref("");
const priceMaxError = ref("");
const showHoursModal = ref(false);

// 星期對應
const getDayName = (day) => {
  const days = ["一", "二", "三", "四", "五", "六", "日"];
  return days[day - 1];
};

// 座位數驗證
const validateSeatsNumber = () => {
  if (details.value.seatsNumber < 0) {
    seatError.value = "座位數不可為負數";
  } else {
    seatError.value = "";
  }
};

// 最低價驗證
const validatePriceMin = () => {
  if (isNaN(details.value.priceMin) || details.value.priceMin < 0) {
    priceMinError.value = "請輸入有效金額";
  } else {
    priceMinError.value = "";
  }
};

// 最高價驗證
const validatePriceMax = () => {
  if (
    details.value.priceMax < details.value.priceMin ||
    details.value.priceMax < 0
  ) {
    priceMaxError.value = "最高金額不可低於最低金額";
  } else {
    priceMaxError.value = "";
  }
};

// 初始化完整 7 天
const initFullWeek = () => {
  fullWeek.value = Array.from({ length: 7 }, (_, i) => ({
    dayOfWeek: i + 1,
    openTime: "",
    closeTime: "",
    isClosed: false,
    vdOpeningHourId: null,
  }));
};

// GET 店家細節與營業時間
onMounted(async () => {
  initFullWeek();
  try {
    // 店家細節
    const resDetails = await api.get("/vendor/details/self");
    details.value = resDetails.data;

    // 營業時間
    const resHours = await api.get("/vendor/openingHours/self");
    const openingHours = resHours.data.map((h) => ({
      ...h,
      openTime: h.openingTime,
      closeTime: h.closingTime,
      isClosed: !h.openingTime && !h.closingTime,
    }));

    // 將資料對應到 fullWeek
    openingHours.forEach((h) => {
      const day = fullWeek.value.find((d) => d.dayOfWeek === h.dayOfWeek);
      if (day) {
        day.openTime = h.openTime;
        day.closeTime = h.closeTime;
        day.isClosed = h.isClosed;
        day.vdOpeningHourId = h.vdOpeningHourId;
      }
    });

    console.log("取得資料：", details.value, fullWeek.value);
  } catch (error) {
    console.error("取得資料失敗：", error);
  }
});

// 儲存營業時間（從 modal）
const saveHours = () => {
  showHoursModal.value = false;
  Swal.fire({
    icon: "info",
    title: "營業時間已暫存",
    text: "請點擊「儲存修改」完成更新",
    confirmButtonColer: "#d4b896",
  });
};

// PUT 更新資料
const updateAll = async () => {
  // 送出前四捨五入
  details.value.priceMin = Math.round(details.value.priceMin);
  details.value.priceMax = Math.round(details.value.priceMax);

  // 重新驗證
  validatePriceMin();
  validatePriceMax();
  validateSeatsNumber();

  // 第一個錯誤提示
  if (seatError.value) {
    Swal.fire({
      icon: "error",
      title: "資料錯誤",
      text: "請先修正座位數錯誤，再儲存!",
      confirmButtonColor: "#d4b896",
    });
    return;
  }
  // 第二個錯誤提示
  if (priceMinError.value || priceMaxError.value) {
    Swal.fire({
      icon: "error",
      title: "資料錯誤",
      text: "請先修正高低價錯誤，再儲存!",
      confirmButtonColor: "#d4b896",
    });
    return;
  }

  try {
    // 更新店家細節
    await api.put("/vendor/details/self", details.value);

    // 建立完整 payload 並一次送到後端
    const payload = fullWeek.value.map((time) => ({
      vdOpeningHourId: time.vdOpeningHourId,
      dayOfWeek: time.dayOfWeek,
      openingTime: time.isClosed ? null : time.openTime,
      closingTime: time.isClosed ? null : time.closeTime,
    }));

    await api.put("/vendor/openingHours/self", payload);

    // 成功提示
    Swal.fire({
      icon: "success",
      title: "修改成功！",
      showConfirmButton: false,
      timer: 1500,
    });
  } catch (error) {
    // 失敗提示 (在 catch 區塊內)
    Swal.fire({
      icon: "error",
      title: "修改失敗",
      text: "請稍後再試",
      confirmButtonColor: "#d4b896",
    });
  }
};
</script>

<style scoped>
.vendor-details-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.details-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ==================== 卡片樣式 ==================== */
.info-section-card,
.hours-section-card {
  background: #faf8f3;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(139, 117, 95, 0.08),
    0 2px 4px rgba(139, 117, 95, 0.05);
  overflow: hidden;
  border: 1px solid #e8dcc8;
}

/* ==================== 營業時間按鈕 ==================== */
.hours-button {
  padding: 0.6rem 1.25rem;
  background: linear-gradient(135deg, #f5f1ea 0%, #ede7dc 100%);
  color: #5a4a3a;
  border: 2px solid #d4b896;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.hours-button:hover {
  background: linear-gradient(135deg, #ede7dc 0%, #e8dcc8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(139, 117, 95, 0.2);
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

/* ==================== 卡片內容 ==================== */
.card-body {
  padding: 1.5rem;
}

/* ==================== 表單網格 (雙欄) ==================== */
.form-grid-two-col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #8b755f;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  margin: 0;
}

.form-label i {
  color: #c9a882;
}

.form-input,
.form-select {
  padding: 0.65rem;
  border: 2px solid #e8dcc8;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #5a4a3a;
  background-color: #ffffff;
  transition: all 0.2s ease;
  width: 100%;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #d4b896;
  box-shadow: 0 0 0 3px rgba(212, 184, 150, 0.1);
}

.form-input::placeholder {
  color: #a89179;
}

.error-message {
  color: #b87171;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
}

/* ==================== 設施區塊 ==================== */
.facilities-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e8dcc8;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #5a4a3a;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.section-subtitle i {
  color: #c9a882;
}

.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background-color: #f5f1ea;
  border-radius: 8px;
  border: 2px solid #e8dcc8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkbox-label:hover {
  background-color: #ede7dc;
  border-color: #d4b896;
}

.checkbox-input {
  width: 1.125rem;
  height: 1.125rem;
  margin-right: 0.6rem;
  cursor: pointer;
  accent-color: #c9a882;
}

.checkbox-text {
  font-size: 0.9rem;
  color: #5a4a3a;
  display: flex;
  align-items: center;
}

.checkbox-text i {
  color: #c9a882;
}

/* ==================== 營業時間 ==================== */
.hours-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 600px;
}

.hour-item {
  padding: 0.75rem;
  background-color: #f5f1ea;
  border-radius: 8px;
  border: 2px solid #e8dcc8;
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.day-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #5a4a3a;
  min-width: 50px;
}

.closed-toggle {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
}

.closed-text {
  font-size: 0.75rem;
  color: #8b755f;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  max-width: 400px;
}

.time-inputs.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.time-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 2px solid #e8dcc8;
  border-radius: 8px;
  padding: 0.35rem 0.5rem;
  transition: all 0.2s ease;
  min-width: 0;
}

.time-input-wrapper:focus-within {
  border-color: #d4b896;
  box-shadow: 0 0 0 3px rgba(212, 184, 150, 0.1);
}

.time-icon {
  color: #c9a882;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.time-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.85rem;
  color: #5a4a3a;
  background: transparent;
  min-width: 0;
}

.time-separator {
  font-size: 0.9rem;
  color: #8b755f;
  font-weight: 600;
  flex-shrink: 0;
}

/* ==================== 儲存按鈕 ==================== */
.action-footer {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.save-button {
  padding: 0.85rem 2.5rem;
  background: linear-gradient(135deg, #d4b896 0%, #c9a882 100%);
  color: #ffffff;
  border: none;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(139, 117, 95, 0.3);
  transition: all 0.3s ease;
}

.save-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 117, 95, 0.4);
}

.save-button:active {
  transform: translateY(0);
}

/* ==================== 載入狀態 ==================== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.loading-text {
  font-size: 1.125rem;
  color: #8b755f;
  margin: 0;
}

/* ==================== Modal 樣式 ==================== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(90, 74, 58, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: #faf8f3;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(139, 117, 95, 0.3);
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 2px solid #e8dcc8;
}

.modal-header {
  background: linear-gradient(135deg, #d4b896 0%, #c9a882 100%);
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-button {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  transition: transform 0.2s ease;
}

.close-button:hover {
  transform: scale(1.1);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1rem 1.5rem;
  background-color: #f5f1ea;
  border-top: 2px solid #e8dcc8;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.cancel-button,
.confirm-button {
  padding: 0.65rem 1.5rem;
  border: none;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.cancel-button {
  background: #ede7dc;
  color: #5a4a3a;
  border: 2px solid #d4b896;
}

.cancel-button:hover {
  background: #e8dcc8;
}

.confirm-button {
  background: linear-gradient(135deg, #d4b896 0%, #c9a882 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(139, 117, 95, 0.3);
}

.confirm-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(139, 117, 95, 0.4);
}

/* ==================== 響應式設計 ==================== */
@media (max-width: 992px) {
  .checkbox-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-grid-two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .vendor-details-container {
    padding: 1rem;
  }

  .card-header {
    padding: 1rem 1.5rem;
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .hours-button {
    width: 100%;
    justify-content: center;
  }

  .header-title {
    font-size: 1.25rem;
  }

  .card-body {
    padding: 1.5rem;
  }

  .checkbox-grid {
    grid-template-columns: 1fr;
  }

  .time-inputs {
    flex-direction: column;
    gap: 0.5rem;
  }

  .time-separator {
    transform: rotate(90deg);
  }

  .modal-footer {
    flex-direction: column;
  }

  .cancel-button,
  .confirm-button {
    width: 100%;
    justify-content: center;
  }
}
</style>
