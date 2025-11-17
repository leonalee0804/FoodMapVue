<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light shadow-sm fixed-top">
    <div class="container">
      <!-- Logo -->
      <router-link class="navbar-brand fw-bold" to="/">
        <img src="/images/gururu_food.png" alt="美食地圖" class="logo-img" />
      </router-link>

      <!-- Hamburger -->
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="切換選單">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!--整合搜尋列 -->
      <form @submit.prevent="searchVendors" class="nav-search">
        <input type="text" v-model="keyword" placeholder="輸入餐廳或關鍵字..." />

        <select v-model="styleId">
          <option value="">全部風格</option>
          <option v-for="s in styles" :key="s.styleId" :value="s.styleId">
            {{ s.styleName }}
          </option>
        </select>

        <select v-model="city">
          <option value="">全部地區</option>
          <option v-for="c in cities" :key="c">{{ c }}</option>
        </select>

        <button type="submit" class="search-btn">搜尋</button>
        <button type="button" class="adv-btn" @click="showAdvanced = true">
          進階
        </button>
      </form>

      <!--進階搜尋 Modal -->
      <AdvancedSearchModal :show="showAdvanced" :modelValue="advancedFilters"
        @update:modelValue="advancedFilters = $event" @close="showAdvanced = false"
        @apply="applyAdvancedSearch($event)" />

      <!-- 導覽選單 -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto align-items-center">
          <!-- 公用選單 -->
          <!-- 美食店鋪下拉選單 -->
          <li v-if="false" class="nav-item dropdown me-5" data-aos="fade-down" data-aos-delay="0">
            <a class="nav-link dropdown-toggle" href="#" id="vendorsDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">
              <i class="bi bi-shop me-10"></i> 美食店鋪
            </a>

            <ul class="dropdown-menu shadow" aria-labelledby="vendorsDropdown">
              <li>
                <a class="dropdown-item" href="#" @click.prevent="goVendorsList">
                  <i class="bi bi-shop-window me-10 text-primary"></i> 所有店家
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="router.push('/member/favorite')">
                  <i class="bi bi-heart-fill me-2 text-danger"></i> 我的收藏
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="router.push('/member/lookHistory')">
                  <i class="bi bi-clock-history me-2 text-secondary"></i>
                  瀏覽紀錄
                </a>
              </li>
            </ul>
          </li>

          <li class="nav-item"me-5 data-aos="fade-down" data-aos-delay="100" >
            <router-link class="nav-link" to="/customerServices">
              <i class="bi bi-envelope-fill me-1"></i> 聯絡我們
            </router-link>
          </li>

          <!-- 廠商專屬：控制訂位 -->
          <li v-if="userStore.isLoggedIn && userStore.roleId === 3 " class="nav-item" me-2>
            <router-link class="nav-link" to="/vendor/rs-capabilities">
              <i class="bi bi-calendar-check me-1"></i> 控制訂位
            </router-link>
          </li>

          <li class="nav-item" mx-3 data-aos="fade-down" data-aos-delay="200">
            <router-link class="nav-link" to="/cart">
              <i class="bi bi-cart4"></i> 購物車
            </router-link>
          </li>

          <!-- 推播布告欄 -->
          <li v-if="userStore.isLoggedIn && userStore.roleId === 2" class="nav-item dropdown" data-aos="fade-down"
            data-aos-delay="300">
            <a class="nav-link position-relative" href="#" id="notificationDropdown" role="button"
              data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-bell"></i>
              <span v-if="userStore.isBlacklisted"
                class="position-absolute top-10 start-10 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span class="visually-hidden">New alerts</span>
              </span>
              <span v-if="reservations.length > 0" :class="[
                'position-absolute top-0 start-100 translate-middle p-1 border border-light rounded-circle',
                hasCancelled ? 'bg-danger' : 'bg-success',
              ]">
              </span>
            </a>

            <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="productNotificationDropdown"
              style="min-width: 300px; max-height: 400px; overflow-y: auto"
              @click="notificationStore.clearProductNotificationFlag()">
              <!-- 黑名單通知 -->
              <li v-if="userStore.isBlacklisted">
                <a class="dropdown-item d-flex align-items-center" href="#">
                  <div class="bg-danger rounded-circle d-flex justify-content-center align-items-center me-2"
                    style="width: 30px; height: 30px">
                    <i class="bi bi-exclamation-circle-fill text-white" style="font-size: 18px"></i>
                  </div>
                  <div>
                    <span>黑名單通知：{{
                      userStore.blacklistReason || "帳號已被黑名單"
                    }}</span>
                  </div>
                </a>
              </li>

              <!-- 訂位成功通知 -->
              <li v-for="r in reservations" :key="r.reservationID">
                <a class="dropdown-item d-flex align-items-center" href="#">
                  <div class="bg-success rounded-circle d-flex justify-content-center align-items-center me-2"
                    style="width: 30px; height: 30px">
                    <i class="bi bi-check-circle-fill text-white" style="font-size: 18px"></i>
                  </div>
                  <div>
                    <span>您在 {{ r.vendorName }} 的訂位已成功！</span>
                    <p class="mb-0">
                      <small>{{ r.reservationDate }}
                        {{ r.reservationPeriod }} ，人數
                        {{ r.guestCount }}</small>
                    </p>
                  </div>
                </a>
              </li>

              <!-- 客服回信通知 -->
              <li>
                <a class="dropdown-item d-flex align-items-center" href="#">
                  <div class="bg-info rounded-circle d-flex justify-content-center align-items-center me-2"
                    style="width: 30px; height: 30px">
                    <i class="bi bi-envelope-fill text-white" style="font-size: 18px"></i>
                  </div>
                  <div>
                    <span>客服已回覆您的問題</span>
                    <p class="mb-0"><small>1 天前</small></p>
                  </div>
                </a>
              </li>

              <!-- 沒有通知 -->
              <li v-if="!userStore.isBlacklisted && !hasOtherNotifications"
                class="dropdown-item text-center text-muted">
                目前無新通知
              </li>
            </ul>
          </li>




<!-- 廠商通知中心 -->
<li v-if="userStore.isLoggedIn && userStore.roleId === 3" class="nav-item dropdown me-2">
  <a class="nav-link position-relative" href="#" id="vendorNotificationDropdown" role="button"
    data-bs-toggle="dropdown" aria-expanded="false" @click="() => {
      notificationStore.clearReservationNotificationFlag();
      notificationStore.clearProductNotificationFlag();
    }">
    <i class="bi bi-bell-fill fs-5"></i>

    <!-- 新通知提示點 -->
    <span v-if="notificationStore.hasNewNotification"
      class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
    </span>
  </a>

  <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="vendorNotificationDropdown"
    style="min-width: 350px; max-height: 500px; overflow-y: auto">

    <!-- 通知標題 -->
    <li class="dropdown-header d-flex justify-content-between align-items-center px-3 py-2">
      <span class="fw-bold">廠商通知中心</span>
      <span class="badge bg-primary rounded-pill">
        {{ notificationStore.productNotifications.length + notificationStore.reservationNotifications.length }}
      </span>
    </li>
    <li><hr class="dropdown-divider my-0" /></li>

    <!-- 沒有通知 -->
    <li v-if="notificationStore.productNotifications.length === 0 && notificationStore.reservationNotifications.length === 0" 
      class="dropdown-item text-center text-muted py-4">
      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
      目前沒有通知
    </li>

    <!-- 商品審核通知 -->
    <template v-if="notificationStore.productNotifications.length > 0">
      <li class="dropdown-header px-3 py-2 bg-light">
        <i class="bi bi-file-earmark-text me-2"></i>商品審核通知
      </li>
      <li v-for="(notification, index) in notificationStore.productNotifications" :key="'product-' + index"
        class="dropdown-item d-flex align-items-start py-3">
        <div class="bg-warning rounded-circle d-flex justify-content-center align-items-center me-3"
          style="width: 40px; height: 40px">
          <i class="bi bi-file-earmark-text text-white fs-5"></i>
        </div>
        <div class="flex-grow-1">
          <div class="notification-message">{{ notification.message }}</div>
          <div class="text-muted small mt-1">
            <i class="bi bi-clock me-1"></i>{{ notification.date }}
          </div>
        </div>
      </li>
    </template>

    <!-- 訂位通知 -->
    <template v-if="notificationStore.reservationNotifications.length > 0">
      <li class="dropdown-header px-3 py-2 bg-light">
        <i class="bi bi-calendar-check me-2"></i>訂位通知
      </li>
      <li v-for="(notification, index) in notificationStore.reservationNotifications" :key="'reservation-' + index"
        class="dropdown-item d-flex align-items-start py-3">
        <div class="bg-success rounded-circle d-flex justify-content-center align-items-center me-3"
          style="width: 40px; height: 40px">
          <i class="bi bi-calendar-check text-white fs-5"></i>
        </div>
        <div class="flex-grow-1">
          <div class="notification-message">{{ notification.message }}</div>
          <div class="text-muted small mt-1">
            <i class="bi bi-clock me-1"></i>{{ notification.date }}
          </div>
        </div>
      </li>
    </template>

  </ul>
</li>

          <!-- 未登入 -->
          <template v-if="!userStore.isLoggedIn">
            <li class="nav-item" data-aos="fade-down" data-aos-delay="400">
              <a class="nav-link bi bi-person-fill" href="#" @click.prevent="router.push('/login')">
                登入/註冊
              </a>
            </li>
          </template>

          <!-- 已登入 -->
          <li v-else class="nav-item dropdown" data-aos="fade-down" data-aos-delay="500">
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">
              <i class="bi bi-person-circle"></i>
              {{ userStore.userName }}
              <small class="text-muted" v-if="userStore.roleId === 1">管理員</small>
              <small class="text-muted" v-else-if="userStore.roleId === 2">(會員)</small>
              <small class="text-muted" v-else-if="userStore.roleId === 3">(廠商)</small>
            </a>
            <ul class="dropdown-menu" aria-labelledby="userDropdown">
              <li v-if="userStore.roleId === 2">
                <a class="dropdown-item" href="#" @click.prevent="router.push('/member/memberHome')">
                  個人資料
                </a>
              </li>
              <li v-if="userStore.roleId === 3">
                <a class="dropdown-item" href="#" @click.prevent="router.push('/vendor/vendorHome')">
                  廠商後台
                </a>
              </li>
              <li v-if="userStore.roleId === 1">
                <a class="dropdown-item" href="#" @click.prevent="router.push('/admin/adminHome')">
                  管理後台
                </a>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="logout">登出</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useUserStore } from "@/stores/user";
import Swal from "sweetalert2";

import { useRouter } from "vue-router";
import axios from "@/plugins/axios";
import axiosapi from "@/plugins/axios";
import AdvancedSearchModal from "@/components/AdvancedSearchModal.vue";
import { useNotificationStore } from "@/stores/notification";
import { storeToRefs } from "pinia";

const userStore = useUserStore();
const router = useRouter();
const notificationStore = useNotificationStore();


const { productNotifications, hasNewProductNotification, reservationNotifications, hasNewReservationNotification } =
  storeToRefs(notificationStore);

const reservations = ref([]);
let ws = null;

const styles = ref([]);
const keyword = ref("");
const styleId = ref("");
const city = ref("");
const cities = ref([
  "台北市",
  "新北市",
  "桃園市",
  "台中市",
  "台南市",
  "高雄市",
]);
const showAdvanced = ref(false);
const hasOtherNotifications = computed(() => reservations.value.length > 0);

const advancedFilters = ref({
  priceRange: "",
  timeSlot: "",
  airConditioner: false,
  veganFriendly: false,
  petFriendly: false,
});

// ==================== 廠商通知中心相關 computed ====================



function searchVendors() {
  const params = {
    keyword: keyword.value,
    styleId: styleId.value,
    city: city.value,
  };
  const query = new URLSearchParams(params).toString();
  router.push(`/search?${query}`);
}
function applyAdvancedSearch(filters) {
  console.log("Header 收到進階搜尋:", filters);
  showAdvanced.value = false;
  advancedFilters.value = filters;

  let userMinPrice = null;
  let userMaxPrice = null;

  if (filters.priceRange) {
    const [min, max] = filters.priceRange.split("-").map((v) => parseInt(v));
    userMinPrice = isNaN(min) ? 0 : min;
    userMaxPrice = isNaN(max) ? 999999 : max;
  }

  const params = {
    keyword: keyword.value,
    styleId: styleId.value,
    city: city.value,
    userMinPrice,
    userMaxPrice,
    timeSlot: filters.timeSlot,
    airConditioner: filters.airConditioner,
    veganFriendly: filters.veganFriendly,
    petFriendly: filters.petFriendly,
  };

  // 移除空值
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([_, v]) => v))
  ).toString();
  router.push(`/search?${query}`);
}

// 監聽 userStore.user 變化，第一次登入就會觸發
watch(
  () => userStore.user,
  (newUser) => {
    if (newUser?.member?.memberId) {
      connectBlacklistWS(newUser.member.memberId);
      connectReservationSocket(newUser.member.memberId);
    }
    if (newUser && userStore.roleId === 3) {
      notificationStore.connectAllVendorWebSockets();
    } else if (userStore.roleId !== 3) {
      notificationStore.closeAllVendorWebSockets();
    }
  },
  { immediate: true }
);

// -------------------- 黑名單 --------------------
async function fetchBlacklist() {
  const memberId = userStore.user?.member?.memberId;
  if (!memberId) {
    console.warn("尚未登入或 memberId 不存在，略過黑名單查詢");
    return;
  }

  try {
    const res = await axios.get("/blacklist/list");
    const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
    const me = list.find((b) => b.memberId === memberId);

    userStore.setBlacklisted(!!me, me?.reason || null);
    console.log("目前使用者黑名單狀態：", !!me, me?.reason || null);
  } catch (err) {
    console.error("抓取黑名單失敗：", err);
  }
}

function connectBlacklistWS(memberId) {
  if (!memberId) return;
  if (ws) ws.close();
  ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?memberId=${memberId}`);
  ws.onopen = () => console.log("黑名單 WebSocket 已連線");
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    console.log("收到黑名單推播:", msg);
    if (msg.type === "add") userStore.setBlacklisted(true, msg.data?.reason);
    else if (msg.type === "remove") userStore.setBlacklisted(false);
  };
  ws.onerror = (err) => console.error("黑名單 WebSocket 錯誤:", err);
  ws.onclose = () => console.warn(" 黑名單 WebSocket 已關閉");
}

// -------------------- 訂位 --------------------
let reservationSocket = null;
let reservationReconnectTimer = null;

async function fetchReservations() {
  try {
    const res = await axios.get("/reservations/my");
    const resList = Array.isArray(res.data.data)
      ? res.data.data
      : [res.data.data];

    const confirmed = resList.filter((r) => r.rv_Status?.trim() === "已確認");

    const withVendorNames = await Promise.all(
      confirmed.map(async (r) => {
        try {
          const vRes = await axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/vendor/${r.vendorID}`
          );
          return { ...r, vendorName: vRes.data.vendorName || "未知商家" };
        } catch {
          return { ...r, vendorName: "未知商家" };
        }
      })
    );

    reservations.value = withVendorNames;
    console.log("已確認訂位更新:", reservations.value);
  } catch (err) {
    console.error("抓取訂位失敗:", err);
    reservations.value = [];
  }
}

function connectReservationSocket(memberId) {
  if (!memberId) {
    console.warn("memberId 不存在，無法建立 WebSocket 連線");
    return;
  }

  if (reservationSocket && reservationSocket.readyState === WebSocket.OPEN)
    return;

  const wsUrl = `${import.meta.env.VITE_WS_Reservation_URL
    }?memberId=${memberId}`;
  reservationSocket = new WebSocket(wsUrl);

  reservationSocket.onopen = () => {
    console.log("訂位 WebSocket 已連線:", wsUrl);
    if (reservationReconnectTimer) {
      clearTimeout(reservationReconnectTimer);
      reservationReconnectTimer = null;
    }
  };

  reservationSocket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log("收到訂位通知:", msg);
      fetchReservations();
    } catch (err) {
      console.error("無法解析 WebSocket 訊息:", event.data);
    }
  };

  reservationSocket.onerror = (err) => {
    console.error("訂位 WebSocket 錯誤:", err);
  };

  reservationSocket.onclose = () => {
    reservationReconnectTimer = setTimeout(
      () => connectReservationSocket(memberId),
      5000
    );
  };
}

// -------------------- 登出功能 --------------------
function logout() {
  // 清除登入狀態
  userStore.logout();

  // 導回首頁
  router.replace("/").then(() => {
    // 可選：重新載入頁面
    window.location.reload();
  });
}

// --------------------------------------------------

// -------------------- 初始化 --------------------
onMounted(async () => {
  try {
    const res = await axiosapi.get("/vendors/styles");
    styles.value = res.data;
  } catch (err) {
    console.error("載入風格失敗：", err);
  }

  await userStore.fetchUser();
  const memberId = userStore.user?.member?.memberId;
  if (!memberId) return;

  await fetchBlacklist();
  connectBlacklistWS(memberId);

  await fetchReservations();
  connectReservationSocket(memberId);
});

// -------------------- 清理 --------------------
onUnmounted(() => {
  if (ws) ws.close();
  if (reservationSocket) reservationSocket.close();
  notificationStore.closeAllVendorWebSockets();
});
</script>

<style scoped>
@font-face {
  font-family: "YozaiLight";
  src: url("@/assets/fonts/Yozai-Light.ttf") format("truetype");
  font-weight: normal;
  font-style: normal;
}

.navbar-nav .nav-link {
  font-family: "YozaiLight", "Noto Sans TC", sans-serif;
  font-weight: 600;
}

.navbar-nav .dropdown-toggle {
  font-family: "YozaiLight", "Noto Sans TC", sans-serif;
}

.nav-item.dropdown .nav-link {
  min-width: 30px;
  text-align: center;
}

#notificationDropdown.nav-link,
#vendorNotificationDropdown.nav-link {
  /* 新增了 #vendorNotificationDropdown */
  padding: 0;
  min-width: auto;
}

/* 以下是我修改/新增的通知樣式 */
.notification-item {
  transition: all 0.2s ease;
  /* 改成 all 0.2s */
}

.notification-item:hover {
  background-color: rgba(0, 123, 255, 0.08);
  /* 改成 0.08 */
  cursor: pointer;
  border-radius: 8px;
  /* 改成 8px */
  transform: translateX(2px);
  /* 新增 */
}

.notification-type {
  /* 全新的 */
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.notification-message {
  font-weight: 500;
  line-height: 1.4;
  /* 改成 1.4 */
  margin-bottom: 4px;
  /* 改成 4px */
  color: #333;
  /* 新增 */
}

.notification-date {
  font-size: 0.8rem;
  color: #6c757d;
  /* 新增 */
}

/* 以下全都是新增的 */
.dropdown-menu {
  padding: 0;
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  font-size: 0.95rem;
}

.notification-item .rounded-circle {
  transition: transform 0.2s ease;
}

.notification-item:hover .rounded-circle {
  transform: scale(1.1);
}

.badge {
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
}

.dropdown-item.text-center.text-muted {
  padding: 2rem 1rem;
}

.dropdown-item.text-center.text-primary {
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.dropdown-item.text-center.text-primary:hover {
  background-color: rgba(13, 110, 253, 0.1);
}

.dropdown-divider {
  margin: 0;
  opacity: 0.15;
}

#vendorNotificationDropdown .bi-bell-fill {
  transition: transform 0.3s ease;
}

#vendorNotificationDropdown:hover .bi-bell-fill {
  transform: rotate(15deg);
}
</style>
