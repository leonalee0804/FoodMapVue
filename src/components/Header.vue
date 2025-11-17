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

        <FilterDropdown title="風格" :options="styles.map(s => ({ value: s.styleId, label: s.styleName }))"
          v-model="styleId" @open="handleDropdownOpen" />

        <FilterDropdown title="地區" :options="cities.map(c => ({ value: c, label: c }))" v-model="city"
          @open="handleDropdownOpen" />


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
          <li v-if="true" class="nav-item dropdown me-4" data-aos="fade-down" data-aos-delay="0">
            <a class="nav-link dropdown-toggle" href="#" id="vendorsDropdown" role="button" data-bs-toggle="dropdown"
              aria-expanded="false">
              <i class="bi bi-shop me-1"></i> 美食店鋪
            </a>

            <ul class="dropdown-menu shadow" aria-labelledby="vendorsDropdown">
              <li>
                <a class="dropdown-item" href="#" @click.prevent="router.push('/member/favorite')">
                  <i class="bi bi-heart-fill me-2 text-danger"></i> 我的收藏
                </a>
              </li>
              <li>
                <a class="dropdown-item" href="#" @click.prevent="router.push('/member/lookHistory')">
                  <i class="bi bi-clock-history me-2 text-secondary"></i> 瀏覽紀錄
                </a>
              </li>
            </ul>
          </li>



          <li class="nav-item" data-aos="fade-down" data-aos-delay="100">
            <router-link class="nav-link" to="/customerServices">
              <i class="bi bi-envelope-fill me-1"></i> 聯絡我們
            </router-link>
          </li>

          <!-- 廠商專屬：控制訂位 -->
          <li v-if="userStore.isLoggedIn && userStore.roleId === 3" class="nav-item">
            <router-link class="nav-link" to="/vendor/rs-capabilities">
              <i class="bi bi-calendar-check me-1"></i> 控制訂位
            </router-link>
          </li>

          <li class="nav-item" data-aos="fade-down" data-aos-delay="200">
            <router-link class="nav-link" to="/cart">
              <i class="bi bi-cart4"></i> 購物車
            </router-link>
          </li>

          <!-- 推播布告欄 -->
          <li v-if="userStore.isLoggedIn && (userStore.roleId === 2 || userStore.roleId === 1)"
            class="nav-item dropdown" data-aos="fade-down" data-aos-delay="300">
            <a class="nav-link position-relative" href="#" id="notificationDropdown" role="button"
              data-bs-toggle="dropdown" aria-expanded="false">
              <i class="bi bi-bell"></i>

              <!-- 黑名單紅燈 -->
              <span v-if="userStore.isBlacklisted && showBlacklistLight"
                class="position-absolute top-0 start-0 translate-middle p-1 bg-danger border border-light rounded-circle"
                style="left: 45px;">
                <span class="visually-hidden">黑名單通知</span>
              </span>

              <!-- 訂位通知綠燈 -->
              <span v-if="reservations.length > 0 && showReservationLight"
                :class="['position-absolute top-0 translate-middle p-1 border border-light rounded-circle', hasCancelled ? 'bg-danger' : 'bg-success']"
                style="left: 28px;">
                <span class="visually-hidden">訂位通知</span>
              </span>

              <!-- 客服通知黃燈 -->
              <span v-if="customerServiceList.length > 0 && showCustomerLight"
                class="position-absolute top-0 translate-middle p-1 bg-warning border border-light rounded-circle"
                style="left: 14px;">
                <span class="visually-hidden">客服通知</span>
              </span>
            </a>

            <!-- 下拉選單 -->
            <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="notificationDropdown"
              style="min-width: 300px; max-height: 400px; overflow-y: auto">
              <!-- 黑名單通知 -->
              <li v-if="userStore.isBlacklisted" @click="showBlacklistLight = false">
                <a class="dropdown-item d-flex align-items-center" href="#">
                  <div class="bg-danger rounded-circle d-flex justify-content-center align-items-center me-2"
                    style="width: 30px; height: 30px;">
                    <i class="bi bi-exclamation-circle-fill text-white" style="font-size: 18px"></i>
                  </div>
                  <div>
                    <span>黑名單通知：{{ userStore.blacklistReason || '帳號已被黑名單' }}</span>
                  </div>
                </a>
              </li>

              <!-- 訂位成功通知 -->
              <li v-for="r in reservations" :key="r.reservationID" @click="showReservationLight = false">
                <a class="dropdown-item d-flex align-items-center" href="#">
                  <div class="bg-success rounded-circle d-flex justify-content-center align-items-center me-2"
                    style="width: 30px; height: 30px;">
                    <i class="bi bi-check-circle-fill text-white" style="font-size: 18px"></i>
                  </div>
                  <div>
                    <span>您在 {{ r.vendorName }} 的訂位已成功！</span>
                    <p class="mb-0">
                      <small>{{ r.reservationDate }} {{ r.reservationPeriod }} ，人數 {{ r.guestCount }}</small>
                    </p>
                  </div>
                </a>
              </li>

              <!-- 客服通知 -->
              <li v-for="cs in (userStore.roleId === 1 ? filteredCustomerServices : customerServiceList)"
                :key="cs.CustomerServiceID" class="dropdown-item d-flex flex-column" @click="showCustomerLight = false">
                <a class="dropdown-item d-flex align-items-center" href="#">
                  <div class="bg-warning rounded-circle d-flex justify-content-center align-items-center me-2"
                    style="width: 30px; height: 30px;">
                    <i class="bi bi-envelope-fill text-white" style="font-size: 18px;"></i>
                  </div>
                  <div>
                    <span class="fw-semibold">{{ cs.Subject }} ({{ cs.CS_Status }})</span>
                    <p class="mb-0 text-muted">
                      <small v-if="cs.MemberName">會員: {{ cs.MemberName }}</small><br v-if="cs.MemberName" />
                      <small>店家: {{ cs.VendorName }}</small><br />
                      <small>客訴內容: {{ cs.Context }}</small><br />
                      <small v-if="cs.Reply">客訴回復: {{ cs.Reply }}</small><br />
                      <small>
                        {{
                          cs.ReplyAt
                            ? '回覆於 ' + new Date(cs.ReplyAt).toLocaleString()
                            : '建立於 ' + new Date(cs.CreateAt).toLocaleString()
                        }}
                      </small>
                    </p>
                  </div>
                </a>
              </li>

              <!-- 沒有通知 -->
              <li v-if="!userStore.isBlacklisted && reservations.length === 0 && customerServiceList.length === 0"
                class="dropdown-item text-center text-muted">
                目前無新通知
              </li>
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
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from "vue";
import { useUserStore } from "@/stores/user";
import Swal from "sweetalert2";

import { useRouter } from "vue-router";
import axios from "axios";

import axiosapi from "@/plugins/axios";
import AdvancedSearchModal from "@/components/AdvancedSearchModal.vue";
import FilterDropdown from "@/components/FilterDropdown.vue";
import { useNotificationStore } from "@/stores/notification";

const notificationStore = useNotificationStore();
const userStore = useUserStore();
const router = useRouter();


const showBlacklistLight = ref(true);
const showReservationLight = ref(true);
const showCustomerLight = ref(true);


const styles = ref([]);
const keyword = ref("");
const styleId = ref("");
const city = ref("");
const cities = ref(["台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市"]);
const showAdvanced = ref(false);
const hasOtherNotifications = computed(() => reservations.value.length > 0);

const advancedFilters = ref({
  priceRange: "",
  timeSlot: "",
  airConditioner: false,
  veganFriendly: false,
  petFriendly: false,
});
// 追蹤目前開啟的下拉選單（風格 or 地區）
const activeDropdown = ref(null);

function handleDropdownOpen(name) {
  // 如果另一個下拉已經開啟，就通知它關閉
  if (activeDropdown.value && activeDropdown.value !== name) {
    window.dispatchEvent(new CustomEvent("closeDropdown", { detail: name }));
  }
  activeDropdown.value = name;
}

function searchVendors() {
  let userMinPrice = null;
  let userMaxPrice = null;

  if (advancedFilters.value.priceRange) {
    const [min, max] = advancedFilters.value.priceRange.split("-").map(v => parseInt(v));
    userMinPrice = isNaN(min) ? 0 : min;
    userMaxPrice = isNaN(max) ? 999999 : max;
  }

  const params = {
    keyword: keyword.value,
    styleId: styleId.value,
    city: city.value,
    userMinPrice,
    userMaxPrice,
  };

  if (advancedFilters.value.timeSlot) {
    params.timeSlot = advancedFilters.value.timeSlot;
  }
  if (advancedFilters.value.airConditioner === true) {
    params.airConditioner = true;
  }
  if (advancedFilters.value.veganFriendly === true) {
    params.veganFriendly = true;
  }
  if (advancedFilters.value.petFriendly === true) {
    params.petFriendly = true;
  }

  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
    )
  ).toString();

  router.push(`/search?${query}`);
}


function applyAdvancedSearch(filters) {
  showAdvanced.value = false;
  advancedFilters.value = filters;

  let userMinPrice = null;
  let userMaxPrice = null;

  if (filters.priceRange) {
    const [min, max] = filters.priceRange.split("-").map(v => parseInt(v));
    userMinPrice = isNaN(min) ? 0 : min;
    userMaxPrice = isNaN(max) ? 999999 : max;
  }

  const params = {
    keyword: keyword.value,
    styleId: styleId.value,
    city: city.value,
    userMinPrice,
    userMaxPrice,
  };

  if (filters.timeSlot) params.timeSlot = filters.timeSlot;
  if (filters.airConditioner === true) params.airConditioner = true;
  if (filters.veganFriendly === true) params.veganFriendly = true;
  if (filters.petFriendly === true) params.petFriendly = true;

  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
    )
  ).toString();

  router.push(`/search?${query}`);
}

function goVendorsList() {
  router.push('/vendors');
}

// ============================================WebScoket 專區============================================
// 監聽 userStore.user 變化(勿刪)

// 添加初始化標記
const wsInitialized = ref({
  admin: false,
  member: false
});

watch(
  () => userStore.user,
  (newUser) => {
    if (!newUser) return;

    // 如果是會員 (roleId !== 1)
    if (newUser?.member?.memberId) {
      connectBlacklistWS(newUser.member.memberId);
      connectReservationSocket(newUser.member.memberId);
      fetchCloseCustomerService(newUser.member.memberId);
      connectCustomerServiceWS(newUser.member.memberId);
    }

    // 如果是管理員 (roleId === 1)
    if (newUser.roleId === 1) {
      fetchAllCustomerService();
      connectAdminCustomerServiceWS();
    }
  },
  { immediate: true }
);


// -------------------- 黑名單 --------------------
let ws = null;
async function fetchBlacklist() {
  const memberId = userStore.user?.member?.memberId;
  if (!memberId) {
    console.warn("尚未登入或 memberId 不存在，略過黑名單查詢");
    return;
  }

  try {
    const res = await axios.get("/api/blacklist/list");
    const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
    const me = list.find(b => b.memberId === memberId);

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
const reservations = ref([]);
let reservationSocket = null;
let reservationReconnectTimer = null;

async function fetchReservations() {
  try {
    const res = await axios.get("/api/reservations/my");
    const resList = Array.isArray(res.data.data) ? res.data.data : [res.data.data];

    const confirmed = resList.filter(r => r.rv_Status?.trim() === "已確認");

    const withVendorNames = await Promise.all(
      confirmed.map(async r => {
        try {
          const vRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/vendor/${r.vendorID}`);
          return { ...r, vendorName: vRes.data.vendorName || "未知商家" };
        } catch {
          return { ...r, vendorName: "未知商家" };
        }
      })
    );

    reservations.value = withVendorNames;
  } catch (err) {
    console.error("抓取訂位失敗:", err);
    reservations.value = [];
  }
}

function connectReservationSocket(memberId) {
  if (!memberId) {
    return;
  }

  if (reservationSocket && reservationSocket.readyState === WebSocket.OPEN) return;

  const wsUrl = `${import.meta.env.VITE_WS_Reservation_URL}?memberId=${memberId}`;
  reservationSocket = new WebSocket(wsUrl);

  reservationSocket.onopen = () => {
    if (reservationReconnectTimer) {
      clearTimeout(reservationReconnectTimer);
      reservationReconnectTimer = null;
    }
  };

  reservationSocket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      fetchReservations();
    } catch (err) {
      console.error("無法解析 WebSocket 訊息:", event.data);
    }
  };

  reservationSocket.onerror = (err) => {
    console.error("訂位 WebSocket 錯誤:", err);
  };

  reservationSocket.onclose = () => {
    reservationReconnectTimer = setTimeout(() => connectReservationSocket(memberId), 5000);
  };
}

// -------------------- 客服 -------------------------------------------------------
const vendorNames = ref({});
let csSocket = null;

// -------------------- 透過 vendorId 拿名稱 --------------------
async function fetchVendorName(vendorId) {
  if (!vendorId) return "未知廠商";
  if (vendorNames.value[vendorId]) return vendorNames.value[vendorId];

  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/vendor/r/${vendorId}`);
    vendorNames.value[vendorId] = res.data.vendorName;
    return res.data.vendorName;
  } catch (err) {
    console.error("找不到廠商", vendorId, err);
    vendorNames.value[vendorId] = "未知廠商";
    return "未知廠商";
  }
}

// -------------------- 會員取得已結案客服案件 --------------------
async function fetchCloseCustomerService(memberId) {
  if (!memberId) {
    return;
  }

  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/customerservice/close/${memberId}`;
    const res = await axios.get(url);

    const allCases = await Promise.all(
      (res.data || []).map(async (cs) => ({
        VendorName: await fetchVendorName(cs.vendorId),
        Subject: cs.subject,
        Context: cs.context,
        CreateAt: cs.createAt,
        Reply: cs.reply,
        ReplyAt: cs.replyAt,
        AccountID: cs.accountId,
        CS_Status: cs.csStatus,
        CustomerServiceID: cs.customerServiceId,
        MemberName: cs.memberName // 如果有會員名稱
      }))
    );
    
    // 按回覆時間或建立時間排序，最新的在最前面
    customerServiceList.value = allCases.sort((a, b) => {
      const dateA = a.ReplyAt ? new Date(a.ReplyAt) : new Date(a.CreateAt);
      const dateB = b.ReplyAt ? new Date(b.ReplyAt) : new Date(b.CreateAt);
      return dateB - dateA;
    });
    
  } catch (err) {
    console.error("抓取未結案客服案件失敗:", err);
  }
}

// -------------------- 會員 WebSocket 連線 --------------------
function connectCustomerServiceWS(memberId) {
  if (!memberId) {
    return;
  }

  if (csSocket && csSocket.readyState === WebSocket.OPEN) return;

  const wsUrl = `${import.meta.env.VITE_WS_CS_URL}?memberId=${memberId}`;
  csSocket = new WebSocket(wsUrl);

  csSocket.onopen = () => {
    console.log("客服 WebSocket 已連線:", wsUrl);
  };

  csSocket.onmessage = async (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.csStatus === "已回覆") {
        const csItem = {
          VendorName: await fetchVendorName(msg.vendorId),
          CustomerServiceID: msg.customerServiceId,
          Subject: msg.subject,
          Context: msg.context,
          CS_Status: msg.csStatus,
          Reply: msg.reply,
          ReplyAt: msg.replyAt,
          CreateAt: msg.createAt,
          MemberName: msg.memberName // 如果有會員名稱
        };
        
        // 檢查是否已存在
        const existingIndex = customerServiceList.value.findIndex(
          cs => cs.CustomerServiceID === csItem.CustomerServiceID
        );
        
        if (existingIndex >= 0) {
          // 如果存在，更新該案件
          customerServiceList.value[existingIndex] = csItem;
        } else {
          // 如果不存在，加到最前面
          customerServiceList.value.unshift(csItem);
        }
        
        showCustomerLight.value = true;
      }
    } catch (err) {
      console.error("解析客服 WebSocket 訊息失敗:", event.data, err);
    }
  };

  csSocket.onerror = (err) => {
    console.error("客服 WebSocket 錯誤:", err);
  };

  csSocket.onclose = () => {
    console.log("客服 WebSocket 已關閉");
  };
}

// -------------------- 全域變數 --------------------
const customerServiceList = ref([]);
const adminCSSocket = ref(null);
const filterStatus = ref("待處理");

// -------------------- 篩選客服案件 --------------------
const filteredCustomerServices = computed(() => {
  if (!filterStatus.value) return customerServiceList.value;
  return customerServiceList.value.filter(
    (cs) => cs.CS_Status?.trim() === filterStatus.value
  );
});

// -------------------- 取得所有客服案件 --------------------
async function fetchAllCustomerService() {
  try {
    const url = `${import.meta.env.VITE_API_BASE_URL}/customerservice/find`;
    const res = await axios.post(url);

    const allCases = await Promise.all(
      (res.data || []).map(async (cs) => ({
        VendorName: await fetchVendorName(cs.vendorId),
        Subject: cs.subject,
        Context: cs.context,
        CreateAt: cs.createAt,
        Reply: cs.reply,
        ReplyAt: cs.replyAt,
        AccountID: cs.accountId,
        CS_Status: cs.csStatus,
        CustomerServiceID: cs.customerServiceId,
        MemberName: cs.memberName // 如果有會員名稱
      }))
    );
    
    // 按建立時間排序，最新的在最前面
    customerServiceList.value = allCases.sort((a, b) => {
      return new Date(b.CreateAt) - new Date(a.CreateAt);
    });
    
  } catch (err) {
    console.error("抓取客服案件失敗:", err);
  }
}

// -------------------- 管理員 WebSocket 連線 --------------------
function connectAdminCustomerServiceWS() {
  // 檢查是否已有連線且狀態正常
  if (adminCSSocket.value) {
    const state = adminCSSocket.value.readyState;
    if (state === WebSocket.CONNECTING || state === WebSocket.OPEN) {
      console.log("管理員客服 WebSocket 已存在，狀態:", state);
      return;
    }
    // 關閉舊的連線
    adminCSSocket.value.close();
    adminCSSocket.value = null;
  }

  const wsUrl = `${import.meta.env.VITE_WS_ADMIN_CS_URL}`;
  console.log("建立管理員客服 WebSocket 連線:", wsUrl);
  adminCSSocket.value = new WebSocket(wsUrl);

  adminCSSocket.value.onopen = () => {
    console.log("✅ 管理員客服 WebSocket 已連線:", wsUrl);
  };

  adminCSSocket.value.onmessage = async (event) => {
    try {
      const msg = JSON.parse(event.data);
      console.log("📩 收到客服推播:", msg);
      console.log("當前列表長度:", customerServiceList.value.length);
      
      // 直接處理新案件
      const vendorName = await fetchVendorName(msg.vendorId);
      
      const newCase = {
        VendorName: vendorName,
        CustomerServiceID: msg.customerServiceId || msg.customerServiceId,
        Subject: msg.subject,
        Context: msg.context,
        CreateAt: msg.createAt || new Date().toISOString(),
        Reply: msg.reply || '',
        ReplyAt: msg.replyAt || null,
        AccountID: msg.accountId,
        CS_Status: msg.csStatus || '待處理',
        MemberName: msg.memberName || ''
      };
      
      console.log("新案件:", newCase);
      
      // 檢查是否已存在（避免重複）
      const existingIndex = customerServiceList.value.findIndex(
        cs => cs.CustomerServiceID === newCase.CustomerServiceID
      );
      
      if (existingIndex >= 0) {
        console.log("更新現有案件:", existingIndex);
        // 使用 Vue 的響應式更新
        customerServiceList.value.splice(existingIndex, 1, newCase);
      } else {
        console.log("新增案件到列表最前面");
        // 使用響應式方法新增到最前面
        customerServiceList.value = [newCase, ...customerServiceList.value];
      }
      
      console.log("更新後列表長度:", customerServiceList.value.length);
      
      // 強制觸發響應性更新
      showCustomerLight.value = false;
      await nextTick();
      showCustomerLight.value = true;
      
      // 可選：播放提示音效
      try {
        const audio = new Audio("/sounds/notification.mp3");
        audio.play().catch(e => console.log("音效播放失敗:", e));
      } catch (e) {
        // 忽略音效錯誤
      }
      
      // 可選：顯示瀏覽器通知
      if (Notification.permission === "granted") {
        new Notification("新客服案件", {
          body: `${newCase.Subject} - ${newCase.VendorName}`,
          icon: "/images/notification-icon.png"
        });
      }
      
    } catch (err) {
      console.error("❌ 解析管理員客服 WebSocket 訊息失敗:", event.data, err);
    }
  };

  adminCSSocket.value.onerror = (err) => {
    console.error("🚨 管理員客服 WebSocket 錯誤:", err);
  };

  adminCSSocket.value.onclose = (e) => {
    console.log("⚠️ 管理員客服 WebSocket 已關閉, code:", e.code, "reason:", e.reason);
    
    // 只在非主動關閉的情況下重連
    if (e.code !== 1000 && e.code !== 1001) {
      setTimeout(() => {
        console.log("🔁 嘗試重新連線管理員客服 WebSocket...");
        connectAdminCustomerServiceWS();
      }, 3000);
    }
  };
}

// -------------------- 清除通知 --------------------
function clearBlacklistNotification() {
  userStore.setBlacklisted(false);
}

function clearReservationNotification(reservationID) {
  reservations.value = reservations.value.filter(r => r.reservationID !== reservationID);
}

function clearCustomerServiceNotification(csID) {
  customerServiceList.value = customerServiceList.value.filter(cs => cs.CustomerServiceID !== csID);
}

// -------------------- 測試功能 --------------------
// 將測試函數暴露到 window 物件，方便在 Console 測試
if (typeof window !== 'undefined') {
  window.testAdminNotification = () => {
    const testCase = {
      VendorName: "測試餐廳",
      CustomerServiceID: `TEST_${Date.now()}`,
      Subject: "測試客訴案件",
      Context: "這是一個測試案件",
      CreateAt: new Date().toISOString(),
      Reply: "",
      ReplyAt: null,
      AccountID: 1,
      CS_Status: "待處理",
      MemberName: "測試會員"
    };
    
    console.log("手動新增測試案件:", testCase);
    customerServiceList.value = [testCase, ...customerServiceList.value];
    showCustomerLight.value = true;
    console.log("更新後列表長度:", customerServiceList.value.length);
    console.log("通知燈狀態:", showCustomerLight.value);
  };
}

// ============================================WebSocket 專區結束============================================

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

// -------------------- 初始化 --------------------
onMounted(async () => {
  try {
    const res = await axiosapi.get("/vendors/styles");
    styles.value = res.data;
  } catch (err) {
    console.error("載入風格失敗：", err);
  }

  // 確保用戶資料載入完成
  await userStore.fetchUser();
  
  // 等待 DOM 更新
  await nextTick();
  
  console.log("onMounted - roleId:", userStore.roleId, "memberId:", userStore.user?.member?.memberId);
  
  // 備援初始化（如果 watch 沒有觸發）
  if (userStore.roleId === 1 && !wsInitialized.value.admin) {
    console.log("初始化管理員客服功能 (from onMounted - backup)");
    wsInitialized.value.admin = true;
    await fetchAllCustomerService();
    connectAdminCustomerServiceWS();
  }
  
  const memberId = userStore.user?.member?.memberId;
  if (memberId && !wsInitialized.value.member) {
    wsInitialized.value.member = true;
    
    // 黑名單
    await fetchBlacklist();
    connectBlacklistWS(memberId);
    
    // 訂位
    await fetchReservations();
    connectReservationSocket(memberId);
    
    // 客服（僅會員）
    if (userStore.roleId === 2) {
      await fetchCloseCustomerService(memberId);
      connectCustomerServiceWS(memberId);
    }
  }
});

// -------------------- 清理 --------------------
onUnmounted(() => {
  // 關閉所有 WebSocket 連線
  if (ws) {
    ws.close();
    ws = null;
  }
  
  if (reservationSocket) {
    reservationSocket.close();
    reservationSocket = null;
  }
  
  if (csSocket) {
    csSocket.close();
    csSocket = null;
  }
  
  if (adminCSSocket.value) {
    adminCSSocket.value.close();
    adminCSSocket.value = null;
  }
  
  // 清理重連計時器
  if (reservationReconnectTimer) {
    clearTimeout(reservationReconnectTimer);
    reservationReconnectTimer = null;
  }
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
  min-width: 80px;
  text-align: center;
}

#notificationDropdown.nav-link {
  padding: 0 6px;
  min-width: auto;
}

/* 讓整個 header 不會溢出畫面寬度 */
.navbar {
  overflow: hidden;
  white-space: nowrap;
}

/* 限制搜尋列寬度 */
.nav-search {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 8px;
  max-width: 110%;
  overflow: hidden;
}

/* 輸入框、下拉選單寬度在小螢幕自動變小 */
.nav-search input {
  max-width: 250px;
  margin-left: 10px;
}

.nav-search select {
  max-width: 120px;
  font-size: 14px;
}

/* 在中小螢幕 (992px 以下) 把搜尋列收進漢堡菜單 */
@media (max-width: 991.98px) {
  .nav-search {
    display: none;
    /* 隱藏上方搜尋列 */
  }
}

.navbar {
  overflow: visible !important;
}

.navbar .container {
  overflow: visible !important;
}

.dropdown-menu {
  z-index: 2000 !important;
}

.nav-item.dropdown:hover>.dropdown-menu {
  display: block !important;
  margin-top: 0;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.logo-img {
  height: 90px;
  width: auto;
  object-fit: contain;
  margin-left: -50px;
  transition: transform 0.2s ease;
}

.logo-img:hover {
  transform: scale(1.05);
}

.navbar-brand {
  display: flex;
  align-items: center;
  margin-right: 12px;
}
</style>