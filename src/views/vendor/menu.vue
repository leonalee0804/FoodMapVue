<template>
  <div class="vendor-menu-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <div class="header-content">
        <i class="bi bi-bag-check header-icon"></i>
        <h2 class="header-title">我的商品列表</h2>
      </div>
      <button @click="showForm = true" class="add-product-button">
        <i class="bi bi-plus-circle me-2"></i>新增商品
      </button>
    </div>

    <!-- 🆕 篩選區 - 優化配色 -->
    <div class="filter-section mb-4">
      <div class="d-flex gap-3 align-items-center">
        <input
          type="text"
          v-model="searchKeyword"
          class="form-control search-input"
          placeholder="搜尋商品名稱..."
          style="max-width: 300px"
        />
        <select v-model="filterStatus" class="form-select status-select" style="max-width: 200px">
          <option value="">全部狀態</option>
          <option value="審核中">審核中</option>
          <option value="上架中">上架中</option>
          <option value="已下架">已下架</option>
          <option value="審核不通過">審核不通過</option>
        </select>

        <!-- ✅ 統計資訊 - 改用奶茶色系 -->
        <div class="ms-auto d-flex gap-2">
          <span class="status-count pending">
            <i class="bi bi-clock-history me-1"></i>
            審核中 {{ statusCount.審核中 }}
          </span>
          <span class="status-count approved">
            <i class="bi bi-check-circle me-1"></i>
            上架中 {{ statusCount.上架中 }}
          </span>
          <span class="status-count offline">
            <i class="bi bi-dash-circle me-1"></i>
            已下架 {{ statusCount.已下架 }}
          </span>
          <span class="status-count rejected">
            <i class="bi bi-x-circle me-1"></i>
            未通過 {{ statusCount.審核不通過 }}
          </span>
        </div>
      </div>
    </div>

    <!-- 商品列表 -->
    <div v-if="filteredMenu.length" class="menu-grid">
      <div v-for="item in filteredMenu" :key="item.productId" class="menu-item">
        <!-- 商品圖片 -->
        <div class="product-image-wrapper">
          <img
            v-if="item.picUrl"
            :src="getImageUrl(item.picUrl)"
            alt="商品圖片"
            class="product-image"
          />
          <div v-else class="no-image">
            <i class="bi bi-image"></i>
            <span>無圖片</span>
          </div>
        </div>

        <!-- 商品資訊 -->
        <div class="product-info">
          <h3 class="product-name">{{ item.productName }}</h3>

          <!-- 價格區塊 -->
          <div class="price-section">
            <div class="price-row">
              <span class="price-label">
                <i class="bi bi-tag me-1"></i>原價
              </span>
              <span class="price-value original-price">NT$ {{ item.unitPrice }}</span>
            </div>

            <div v-if="item.specialPrice && item.specialPrice < item.unitPrice" class="price-row special">
              <span class="price-label">
                <i class="bi bi-lightning-fill me-1"></i>特價
              </span>
              <span class="price-value special-price">NT$ {{ item.specialPrice }}</span>
            </div>

            <div v-if="item.specialPrice && item.specialPrice < item.unitPrice" class="discount-badge">
              折扣 {{ calcDiscount(item.unitPrice, item.specialPrice) }}%
            </div>
          </div>

          <!-- 其他資訊 -->
          <div class="info-section">
            <div class="info-row">
              <i class="bi bi-box-seam me-2"></i>
              <span class="info-label">庫存：</span>
              <span class="info-value">{{ item.stock }}</span>
            </div>

            <div class="info-row">
              <i class="bi bi-calendar-event me-2"></i>
              <span class="info-label">有效至：</span>
              <span class="info-value">{{ formatDate(item.endDate) }}</span>
            </div>
          </div>

          <!-- 狀態標籤 -->
          <div class="status-section">
            <span 
              class="status-badge" 
              :class="{
                'status-pending': item.status === '審核中',
                'status-approved': item.status === '上架中',
                'status-offline': item.status === '已下架',
                'status-rejected': item.status === '審核不通過'
              }"
            >
              <i class="bi" :class="{
                'bi-clock-history': item.status === '審核中',
                'bi-check-circle-fill': item.status === '上架中',
                'bi-dash-circle-fill': item.status === '已下架',
                'bi-x-circle-fill': item.status === '審核不通過'
              }"></i>
              {{ item.status }}
            </span>
          </div>

          <!-- 審核不通過原因 -->
          <div v-if="item.status === '審核不通過'" class="rejection-reason">
            <i class="bi bi-exclamation-triangle me-2"></i>
            {{ item.reason || '無原因記錄' }}
          </div>

          <!-- ✅ 操作按鈕區 - 改用奶茶色系 -->
          <div class="action-buttons">
            <!-- 審核中：只能查看 -->
            <div v-if="item.status === '審核中'" class="waiting-message">
              <i class="bi bi-hourglass-split me-2"></i>
              等待管理員審核中...
            </div>

            <!-- 上架中：可以修改庫存、下架 -->
            <div v-if="item.status === '上架中'" class="button-group">
              <button class="action-btn edit-btn" @click="openEditModal(item)">
                <i class="bi bi-pencil-square me-1"></i>修改庫存
              </button>
              <button class="action-btn offline-btn" @click="toggleStatus(item)">
                <i class="bi bi-dash-circle me-1"></i>下架商品
              </button>
            </div>

            <!-- 已下架：可以修改庫存、重新上架 -->
            <div v-if="item.status === '已下架'" class="button-group">
              <button class="action-btn edit-btn" @click="openEditModal(item)">
                <i class="bi bi-pencil-square me-1"></i>修改庫存
              </button>
              <button class="action-btn online-btn" @click="toggleStatus(item)">
                <i class="bi bi-check-circle me-1"></i>重新上架
              </button>
            </div>

            <!-- ✅ 審核不通過：可以完整修改後重新送審 -->
            <div v-if="item.status === '審核不通過'" class="button-group">
              <button class="action-btn resubmit-btn" @click="openResubmitModal(item)">
                <i class="bi bi-arrow-clockwise me-1"></i>修改後重新送審
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-else-if="menu.length === 0" class="loading-container">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">載入中...</span>
      </div>
      <p class="loading-text">載入中...</p>
    </div>

    <!-- 無符合條件的商品 -->
    <div v-else class="loading-container">
      <i class="bi bi-inbox fs-1 text-muted"></i>
      <p class="loading-text">無符合條件的商品</p>
    </div>

    <!-- 修改庫存/到期日 Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-content">
            <i class="bi bi-pencil-square header-icon"></i>
            <h2 class="header-title">修改商品資訊</h2>
          </div>
          <button @click="closeEditModal" class="close-button">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="submitEdit" class="modal-body">
          <div class="form-group">
            <label class="form-label">
              <i class="bi bi-tag me-2"></i>商品名稱
            </label>
            <input
              type="text"
              :value="editingProduct.productName"
              class="form-input"
              disabled
            />
            <small class="text-muted">（商品名稱不可修改）</small>
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="bi bi-box-seam me-2"></i>庫存數量
            </label>
            <input
              type="number"
              v-model.number="editForm.stock"
              class="form-input"
              placeholder="請輸入庫存數量"
              required
              min="0"
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="bi bi-calendar-event me-2"></i>有效日期
            </label>
            <input
              type="date"
              v-model="editForm.endDate"
              class="form-input"
              required
            />
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeEditModal" class="cancel-button">
              <i class="bi bi-x-circle me-2"></i>取消
            </button>
            <button type="submit" class="confirm-button">
              <i class="bi bi-check-circle me-2"></i>確認修改
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ✅ 重新送審 Modal（可修改商品名稱和圖片）-->
    <div v-if="showResubmitModal" class="modal-overlay" @click.self="closeResubmitModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-content">
            <i class="bi bi-arrow-clockwise header-icon"></i>
            <h2 class="header-title">修改商品後重新送審</h2>
          </div>
          <button @click="closeResubmitModal" class="close-button">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="submitResubmit" class="modal-body">
          <!-- 拒絕原因提示 -->
          <div class="alert alert-warning">
            <i class="bi bi-exclamation-triangle me-2"></i>
            <strong>拒絕原因：</strong>{{ resubmitForm.reason || '無原因記錄' }}
          </div>

          <!-- ✅ 商品名稱（可修改）-->
          <div class="form-group">
            <label class="form-label">
              <i class="bi bi-pencil me-2"></i>商品名稱
            </label>
            <input
              v-model="resubmitForm.productName"
              class="form-input"
              placeholder="請輸入商品名稱"
              required
            />
          </div>

          <!-- 庫存 -->
          <div class="form-group">
            <label class="form-label">
              <i class="bi bi-box-seam me-2"></i>庫存數量
            </label>
            <input
              type="number"
              v-model.number="resubmitForm.stock"
              class="form-input"
              placeholder="請輸入庫存數量"
              required
              min="0"
            />
          </div>

          <!-- 有效日期 -->
          <div class="form-group">
            <label class="form-label">
              <i class="bi bi-calendar-event me-2"></i>有效日期
            </label>
            <input
              type="date"
              v-model="resubmitForm.endDate"
              class="form-input"
              required
            />
          </div>

          <!-- ✅ 商品圖片（可重新上傳）-->
          <div class="form-group">
            <label class="form-label">
              <i class="bi bi-image me-2"></i>商品圖片
            </label>
            
            <!-- 目前圖片預覽 -->
            <div v-if="resubmitForm.currentPicUrl && !resubmitForm.newPicFile" class="current-image-preview">
              <img :src="getImageUrl(resubmitForm.currentPicUrl)" alt="目前圖片" />
              <p class="text-muted small mt-2">目前的商品圖片</p>
            </div>

            <!-- 新圖片預覽 -->
            <div v-if="resubmitForm.newPicFile" class="new-image-preview">
              <img :src="resubmitForm.newPicPreview" alt="新圖片" />
              <p class="text-success small mt-2">✓ 已選擇新圖片</p>
              <button type="button" @click="clearNewImage" class="btn btn-sm btn-outline-danger mt-2">
                <i class="bi bi-x-circle me-1"></i>取消更換
              </button>
            </div>

            <!-- 上傳按鈕 -->
            <input
              type="file"
              @change="handleResubmitFileUpload"
              class="form-input file-input"
              accept="image/*"
            />
            <small class="text-muted">
              {{ resubmitForm.currentPicUrl ? '如需更換圖片請選擇新檔案' : '請上傳商品圖片' }}
            </small>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeResubmitModal" class="cancel-button">
              <i class="bi bi-x-circle me-2"></i>取消
            </button>
            <button type="submit" class="confirm-button">
              <i class="bi bi-check-circle me-2"></i>確認送審
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 新增商品 Modal -->
    <div v-if="showForm" class="modal-overlay" @click.self="cancelForm">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-content">
            <i class="bi bi-plus-square header-icon"></i>
            <h2 class="header-title">新增商品</h2>
          </div>
          <button @click="cancelForm" class="close-button">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="submitProduct" class="modal-body">
          <!-- 商品名稱 -->
          <div class="form-group">
            <label class="form-label">
              <i class="bi bi-pencil me-2"></i>商品名稱
            </label>
            <input
              v-model="newProduct.productName"
              class="form-input"
              placeholder="請輸入商品名稱"
              required
            />
          </div>

          <!-- 價格區塊 -->
          <div class="form-grid-two-col">
            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-currency-dollar me-2"></i>原價
              </label>
              <input
                type="number"
                v-model.number="newProduct.unitPrice"
                class="form-input"
                placeholder="請輸入原價"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-lightning me-2"></i>特價
              </label>
              <input
                type="number"
                v-model.number="newProduct.specialPrice"
                class="form-input"
                placeholder="選填"
              />
            </div>
          </div>

          <!-- 折扣顯示 -->
          <div
            v-if="
              newProduct.specialPrice &&
              newProduct.unitPrice &&
              newProduct.specialPrice < newProduct.unitPrice
            "
            class="discount-info"
          >
            折扣：{{ calcDiscount(newProduct.unitPrice, newProduct.specialPrice) }}%
          </div>

          <!-- 日期與庫存 -->
          <div class="form-grid-two-col">
            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-calendar-event me-2"></i>有效日期
              </label>
              <input
                type="date"
                v-model="newProduct.endDate"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="bi bi-box-seam me-2"></i>庫存
              </label>
              <input
                type="number"
                v-model.number="newProduct.stock"
                class="form-input"
                placeholder="請輸入庫存數量"
                required
              />
            </div>
          </div>

          <!-- 圖片上傳 -->
          <div class="form-group">
            <label class="form-label">
              <i class="bi bi-image me-2"></i>商品圖片
            </label>
            <input
              type="file"
              @change="handleFileUpload"
              class="form-input file-input"
              accept="image/*"
            />
          </div>

          <!-- 按鈕區 -->
          <div class="modal-footer">
            <button type="button" @click="cancelForm" class="cancel-button">
              <i class="bi bi-x-circle me-2"></i>取消
            </button>
            <button type="submit" class="confirm-button">
              <i class="bi bi-check-circle me-2"></i>提交
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useNotificationStore } from "@/stores/notification";
import api from "@/api/axiosInstance";
import { useUserStore } from "@/stores/user";
import Swal from "sweetalert2";

const userStore = useUserStore();
const notificationStore = useNotificationStore();
const menu = ref([]);
const showForm = ref(false);
const showEditModal = ref(false);
const showResubmitModal = ref(false); // ✅ 新增
const searchKeyword = ref("");
const filterStatus = ref("");

// 新增商品資料
const newProduct = ref({
  productName: "",
  unitPrice: null,
  specialPrice: null,
  endDate: "",
  stock: null,
  picUrl: null,
});

// 編輯商品資料
const editingProduct = ref({});
const editForm = ref({
  stock: null,
  endDate: "",
});

// ✅ 重新送審表單
const resubmitForm = ref({
  productId: null,
  productName: "",
  stock: null,
  endDate: "",
  reason: "",
  currentPicUrl: "",
  newPicFile: null,
  newPicPreview: null,
});

// 篩選後的商品列表
const filteredMenu = computed(() => {
  return menu.value.filter((item) => {
    const matchKeyword =
      !searchKeyword.value ||
      item.productName?.toLowerCase().includes(searchKeyword.value.toLowerCase());
    const matchStatus = !filterStatus.value || item.status === filterStatus.value;
    return matchKeyword && matchStatus;
  });
});

// 狀態統計
const statusCount = computed(() => {
  const count = {
    審核中: 0,
    上架中: 0,
    已下架: 0,
    審核不通過: 0,
  };
  menu.value.forEach((item) => {
    if (count.hasOwnProperty(item.status)) {
      count[item.status]++;
    }
  });
  return count;
});

// 載入商品列表
onMounted(async () => {
  notificationStore.connectVendorWebSocket();
  
  // ✅ 初次載入
  await loadProducts();
  
  // ✅ 每隔 5 秒自動刷新一次
  setInterval(loadProducts, 5000);
});

// ✅ 將載入邏輯抽成獨立函式
const loadProducts = async () => {
  try {
    const res = await api.get("/vProduct/self", { withCredentials: true });
    menu.value = res.data;
    console.log("我的商品資料：", menu.value);
  } catch (error) {
    console.error("取得商品資料失敗：", error);
    // ✅ 自動刷新時不顯示錯誤提示，避免干擾使用者
    // Swal.fire("錯誤", "無法取得商品資料", "error");
  }
};

// 開啟編輯 Modal
const openEditModal = (item) => {
  editingProduct.value = item;
  editForm.value = {
    stock: item.stock,
    endDate: formatDateForInput(item.endDate),
  };
  showEditModal.value = true;
};

// 關閉編輯 Modal
const closeEditModal = () => {
  showEditModal.value = false;
  editingProduct.value = {};
  editForm.value = {
    stock: null,
    endDate: "",
  };
};

// ✅ 修改庫存/到期日（上架中、已下架用）
const submitEdit = async () => {
  try {
    const formData = new FormData();
    formData.append("stock", editForm.value.stock);
    formData.append("endDate", editForm.value.endDate);

    const res = await api.put(
      `/vProduct/${editingProduct.value.productId}/update-details`,
      formData,
      { 
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true 
      }
    );

    Swal.fire("成功", "商品資訊已更新！", "success");
    editingProduct.value.stock = res.data.stock;
    editingProduct.value.endDate = res.data.endDate;
    closeEditModal();
  } catch (error) {
    console.error("修改商品失敗：", error);
    Swal.fire("錯誤", error.response?.data || "修改失敗", "error");
  }
};

// ✅ 開啟重新送審 Modal
const openResubmitModal = (item) => {
  resubmitForm.value = {
    productId: item.productId,
    productName: item.productName,
    stock: item.stock,
    endDate: formatDateForInput(item.endDate),
    reason: item.reason,
    currentPicUrl: item.picUrl,
    newPicFile: null,
    newPicPreview: null,
  };
  showResubmitModal.value = true;
};

// ✅ 關閉重新送審 Modal
const closeResubmitModal = () => {
  showResubmitModal.value = false;
  resubmitForm.value = {
    productId: null,
    productName: "",
    stock: null,
    endDate: "",
    reason: "",
    currentPicUrl: "",
    newPicFile: null,
    newPicPreview: null,
  };
};

// ✅ 處理重新送審的檔案上傳
const handleResubmitFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  resubmitForm.value.newPicFile = file;
  
  // 產生預覽圖
  const reader = new FileReader();
  reader.onload = (e) => {
    resubmitForm.value.newPicPreview = e.target.result;
  };
  reader.readAsDataURL(file);
};

// ✅ 清除新圖片
const clearNewImage = () => {
  resubmitForm.value.newPicFile = null;
  resubmitForm.value.newPicPreview = null;
};

// ✅ 重新送審（審核不通過用）
const submitResubmit = async () => {
  try {
    // 1. 先更新商品資訊（包含名稱和圖片）
    const formData = new FormData();
    formData.append("stock", resubmitForm.value.stock);
    formData.append("endDate", resubmitForm.value.endDate);
    formData.append("productName", resubmitForm.value.productName);
    
    if (resubmitForm.value.newPicFile) {
      formData.append("picFile", resubmitForm.value.newPicFile);
    }

    const updateRes = await api.put(
      `/vProduct/${resubmitForm.value.productId}/update-details`,
      formData,
      { 
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true 
      }
    );

    // 2. 再重新送審
    const resubmitRes = await api.put(
      `/vProduct/${resubmitForm.value.productId}/resubmit`,
      {},
      { withCredentials: true }
    );

    Swal.fire("成功", "商品已重新提交審核！", "success");

    // 更新本地資料
    const item = menu.value.find(p => p.productId === resubmitForm.value.productId);
    if (item) {
      item.status = resubmitRes.data.status;
      item.productName = updateRes.data.productName;
      item.stock = updateRes.data.stock;
      item.endDate = updateRes.data.endDate;
      item.reason = null;
      
      if (resubmitForm.value.newPicFile && updateRes.data.picUrl) {
        item.picUrl = updateRes.data.picUrl;
      }
    }

    closeResubmitModal();
  } catch (error) {
    console.error("重新送審失敗：", error);
    Swal.fire("錯誤", error.response?.data || "送審失敗", "error");
  }
};

// 切換上架/下架狀態
const toggleStatus = async (item) => {
  const action = item.status === '上架中' ? '下架' : '重新上架';
  
  const result = await Swal.fire({
    title: `確認${action}？`,
    text: `確定要${action}「${item.productName}」嗎？`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: `確認${action}`,
    cancelButtonText: "取消",
  });

  if (!result.isConfirmed) return;

  try {
    const res = await api.put(
      `/vProduct/${item.productId}/toggle-status`,
      {},
      { withCredentials: true }
    );

    Swal.fire("成功", `商品已${action}！`, "success");

    // 更新本地資料
    item.status = res.data.status;
  } catch (error) {
    console.error("切換狀態失敗：", error);
    Swal.fire("錯誤", error.response?.data || "操作失敗，請稍後再試", "error");
  }
};

// 處理檔案上傳
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  newProduct.value.picUrl = file;
};

// 提交新增商品
const submitProduct = async () => {
  try {
    const formData = new FormData();
    formData.append("productName", newProduct.value.productName);
    formData.append("unitPrice", newProduct.value.unitPrice);
    formData.append("specialPrice", newProduct.value.specialPrice || "");
    formData.append("endDate", newProduct.value.endDate);
    formData.append("stock", newProduct.value.stock);
    if (newProduct.value.picUrl)
      formData.append("picFile", newProduct.value.picUrl);

    await api.post("/vProduct/create", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
    });

    Swal.fire("成功", "商品已提交審核！", "success");
    // ✅ 關閉表單
    showForm.value = false;
    
    // ✅ 加入延遲，等待後端完成圖片處理
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // ✅ 重新載入列表
    const res = await api.get("/vProduct/self", { withCredentials: true });
    menu.value = res.data;
    
    // 重置表單
    newProduct.value = {
      productName: "",
      unitPrice: null,
      specialPrice: null,
      endDate: "",
      stock: null,
      picUrl: null,
    };
  } catch (error) {
    console.error("提交商品失敗：", error);
    Swal.fire("錯誤", "提交失敗，請檢查輸入或登入狀態！", "error");
  }
};
//     menu.value.push(res.data);
//     showForm.value = false;
//     newProduct.value = {
//       productName: "",
//       unitPrice: null,
//       specialPrice: null,
//       endDate: "",
//       stock: null,
//       picUrl: null,
//     };
//   } catch (error) {
//     console.error("提交商品失敗：", error);
//     Swal.fire("錯誤", "提交失敗，請檢查輸入或登入狀態！", "error");
//   }
// };

// 取消按鈕
const cancelForm = () => {
  showForm.value = false;
  newProduct.value = {
    productName: "",
    unitPrice: null,
    specialPrice: null,
    endDate: "",
    stock: null,
    picUrl: null,
  };
};

// 計算折扣百分比
const calcDiscount = (unit, special) => {
  if (!unit || !special) return "-";
  const discount = ((unit - special) / unit) * 100;
  return discount.toFixed(1);
};

// 格式化日期顯示
const formatDate = (date) => {
  if (!date) return "-";
  if (typeof date === 'string') return date.split('T')[0];
  return date;
};

// 格式化日期給 input 用
const formatDateForInput = (date) => {
  if (!date) return "";
  if (typeof date === 'string') return date.split('T')[0];
  return date;
};

// 取得完整圖片 URL
const getImageUrl = (filename) => {
  return filename?.startsWith("http")
    ? filename
    : `http://localhost:8082/Product_Pic/${filename}`;
};
</script>

<style scoped>
/* 保持原有的所有基礎 CSS... */
.vendor-menu-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  background: linear-gradient(135deg, #d4b896 0%, #c9a882 100%);
  padding: 1.5rem 2rem;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(139, 117, 95, 0.3);
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

.add-product-button {
  padding: 0.75rem 1.5rem;
  background:linear-gradient(135deg, #f5f1ea 0%, #ede7dc 100%);
  color: #5a4a3a;
  border: none;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.add-product-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

/* ✅ 篩選區樣式 - 優化 */
.filter-section {
  background: #faf8f3;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  border: 2px solid #e8dcc8;
  box-shadow: 0 2px 8px rgba(139, 117, 95, 0.1);
}

.search-input,
.status-select {
  border: 2px solid #e8dcc8;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
}

.search-input:focus,
.status-select:focus {
  border-color: #c9a882;
  box-shadow: 0 0 0 3px rgba(201, 168, 130, 0.1);
  outline: none;
}

/* ✅ 統計資訊 - 改用奶茶色系 */
.status-count {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.status-count.pending {
  background: #f5efe6;
  color: #9d7e5a;
  border: 2px solid #d4b896;
}

.status-count.approved {
  background: #e8f0e6;
  color: #6b8e5f;
  border: 2px solid #a8c99f;
}

.status-count.offline {
  background: #f0ebe6;
  color: #8b7d6b;
  border: 2px solid #c9b8a3;
}

.status-count.rejected {
  background: #f5e8e6;
  color: #a87b73;
  border: 2px solid #d4a599;
}

.status-count:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 商品網格 */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.menu-item {
  background: #faf8f3;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e8dcc8;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(139, 117, 95, 0.1);
}

.menu-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(139, 117, 95, 0.2);
  border-color: #d4b896;
}

/* 商品圖片 */
.product-image-wrapper {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #ede7dc;
  position: relative;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.menu-item:hover .product-image {
  transform: scale(1.05);
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #a89179;
  font-size: 0.9rem;
}

.no-image i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  color: #c9a882;
}

/* 商品資訊 */
.product-info {
  padding: 1.25rem;
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #5a4a3a;
  margin: 0 0 1rem 0;
  line-height: 1.4;
  min-height: 2.8rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 價格區塊 */
.price-section {
  background: #f5f1ea;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  border: 1px solid #e8dcc8;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.price-row:last-of-type {
  margin-bottom: 0;
}

.price-row.special {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed #d4b896;
}

.price-label {
  font-size: 0.875rem;
  color: #8b755f;
  display: flex;
  align-items: center;
}

.price-value {
  font-size: 1rem;
  font-weight: 600;
}

.original-price {
  color: #5a4a3a;
}

.special-price {
  color: #b87171;
  font-size: 1.125rem;
}

.discount-badge {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(135deg, #d4b896 0%, #c9a882 100%);
  color: #ffffff;
  padding: 0.35rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
}

/* 其他資訊 */
.info-section {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #5a4a3a;
  margin-bottom: 0.5rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row i {
  color: #c9a882;
}

.info-label {
  color: #8b755f;
  margin-right: 0.25rem;
}

.info-value {
  font-weight: 600;
  color: #5a4a3a;
}

/* 狀態標籤 */
.status-section {
  margin-top: 1rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.85rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-pending {
  background: #f5efe6;
  color: #9d7e5a;
  border: 2px solid #d4b896;
}

.status-approved {
  background: #e8f0e6;
  color: #6b8e5f;
  border: 2px solid #a8c99f;
}

.status-offline {
  background: #f0ebe6;
  color: #8b7d6b;
  border: 2px solid #c9b8a3;
}

.status-rejected {
  background: #f5e8e6;
  color: #a87b73;
  border: 2px solid #d4a599;
}

.rejection-reason {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: #f5e8e6;
  border-left: 3px solid #a87b73;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #8b6560;
  display: flex;
  align-items: flex-start;
}

.rejection-reason i {
  flex-shrink: 0;
  margin-top: 0.1rem;
  color: #a87b73;
}

/* ✅ 操作按鈕區 - 改用奶茶色系 */
.action-buttons {
  margin-top: 1rem;
}

.waiting-message {
  padding: 0.75rem;
  background: #f5efe6;
  border-radius: 8px;
  color: #9d7e5a;
  font-size: 0.875rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #d4b896;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #f5efe6;
  color: #8b755f;
  border: 2px solid #d4b896;
}

.edit-btn:hover {
  background: #d4b896;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 117, 95, 0.2);
}

.offline-btn {
  background: #f0ebe6;
  color: #8b7d6b;
  border: 2px solid #c9b8a3;
}

.offline-btn:hover {
  background: #c9b8a3;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(139, 117, 95, 0.2);
}

.online-btn {
  background: #e8f0e6;
  color: #6b8e5f;
  border: 2px solid #a8c99f;
}

.online-btn:hover {
  background: #a8c99f;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(107, 142, 95, 0.2);
}

.resubmit-btn {
  background: #ede8f0;
  color: #7b6b8e;
  border: 2px solid #b8a8c9;
}

.resubmit-btn:hover {
  background: #b8a8c9;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(123, 107, 142, 0.2);
}

/* ✅ 圖片預覽樣式 */
.current-image-preview,
.new-image-preview {
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f5f1ea;
  border-radius: 8px;
  border: 2px solid #e8dcc8;
  text-align: center;
}

.current-image-preview img,
.new-image-preview img {
  max-width: 200px;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  border: 2px solid #d4b896;
}

.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.alert-warning {
  background: #f5efe6;
  border-left: 4px solid #d4b896;
  color: #8b755f;
}

/* 載入狀態 */
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

/* Modal 樣式 */
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
  max-width: 600px;
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

/* 表單樣式 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
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

.form-input {
  padding: 0.75rem;
  border: 2px solid #e8dcc8;
  border-radius: 8px;
  font-size: 0.95rem;
  color: #5a4a3a;
  background-color: #ffffff;
  transition: all 0.2s ease;
  width: 100%;
}

.form-input:focus {
  outline: none;
  border-color: #d4b896;
  box-shadow: 0 0 0 3px rgba(212, 184, 150, 0.1);
}

.form-input::placeholder {
  color: #a89179;
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.file-input {
  padding: 0.5rem;
}

.form-grid-two-col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.discount-info {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: linear-gradient(135deg, #d4b896 0%, #c9a882 100%);
  color: #ffffff;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Modal 按鈕 */
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
  padding: 0.75rem 1.75rem;
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

/* 響應式設計 */
@media (max-width: 1400px) {
  .menu-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-grid-two-col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .vendor-menu-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .add-product-button {
    width: 100%;
    justify-content: center;
  }

  .menu-grid {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
  }

  .cancel-button,
  .confirm-button {
    width: 100%;
    justify-content: center;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .status-count {
    font-size: 0.75rem;
    padding: 0.4rem 0.8rem;
  }
}
</style>