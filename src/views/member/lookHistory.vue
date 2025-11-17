<template>
  <div class="lookHistory-wrapper">
    <div class="history-page">
      <!-- 側邊欄 -->
      <MemberSidebar @logout="logout" />

      <!-- 主內容區 -->
      <div class="history-content container py-5">
        <h2 class="section-title text-center mb-4">我的瀏覽紀錄</h2>

        <!-- 無紀錄提示 -->
        <div v-if="historyData.length === 0" class="no-history">
          <p>尚無瀏覽紀錄，快去探索美食吧！</p>
        </div>

        <!-- 瀏覽紀錄卡片 -->
        <div v-else class="history-grid">
          <div
            class="history-card"
            v-for="item in pagedData"
            :key="item.lookHistoryId"
            @click="onClickVendor(item.vendorId)"
          >
            <img
              :src="IMAGE_BASE_URL + `${item.logoUrl || 'default.jpg'}`"
              alt="vendor image"
              class="history-img"
            />
            <div class="history-info">
              <h5>{{ item.vendorName }}</h5>
              <p class="text-muted">{{ item.createAt }}</p>
            </div>
          </div>
        </div>

        <!-- 分頁 -->
        <paginate
          v-if="totalPages > 1"
          :page-count="totalPages"
          :click-handler="handlePageChange"
          :prev-text="'‹'"
          :next-text="'›'"
          :container-class="'pagination justify-content-center mt-4'"
          :page-class="'page-item'"
          :page-link-class="'page-link'"
          :prev-class="'page-item'"
          :prev-link-class="'page-link'"
          :next-class="'page-item'"
          :next-link-class="'page-link'"
          :active-class="'active'"
        />
      </div>

      <!-- Modal -->
      <div class="modal fade" id="vendorModal" tabindex="-1" aria-hidden="true" ref="vendorModalRef">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content vendor-modal">
            <div class="modal-header">
              <h5 class="modal-title">{{ selectedVendor.vendorName }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <p><strong>電話：</strong>{{ selectedVendor.contactTel }}</p>
              <p><strong>地址：</strong>{{ selectedVendor.address }}</p>
              <iframe
                v-if="selectedVendor.address"
                :src="mapUrl"
                width="100%"
                height="300"
                style="border: 0;"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from "vue";
import axiosapi from "@/plugins/axios";
import Paginate from "vuejs-paginate-next";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import MemberSidebar from "@/components/member/memberSidebar.vue";

export default {
  components: { Paginate, MemberSidebar },

  setup() {
    const userStore = useUserStore();
    const IMAGE_BASE_URL = "http://localhost:8082/Vendor_Pic/";
    const historyData = ref([]);
    const currentPage = ref(1);
    const pageSize = 8;
    const router = useRouter();
    const selectedVendor = reactive({
      vendorName: "",
      contactTel: "",
      address: "",
    });
    const vendorModalRef = ref(null);

    const totalPages = computed(() =>
      Math.ceil(historyData.value.length / pageSize)
    );

    const pagedData = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return historyData.value.slice(start, start + pageSize);
    });

    const mapUrl = computed(() =>
      selectedVendor.address
        ? `https://www.google.com/maps?q=${encodeURIComponent(
            selectedVendor.address
          )}&output=embed`
        : ""
    );

    const loadHistory = async () => {
      try {
        const memberId = userStore.user?.member?.memberId;
        if (!memberId) {
          console.warn("尚未登入，無法載入瀏覽紀錄");
          return;
        }
        const res = await axiosapi.get(`/lookhistory/${memberId}`);
        historyData.value = res.data.sort(
          (a, b) => new Date(b.createAt) - new Date(a.createAt)
        );
      } catch (err) {
        console.error("載入歷史紀錄失敗:", err);
      }
    };

    const handlePageChange = (page) => {
      currentPage.value = page;
    };

    const onClickVendor = (vendorId) => {
      router.push(`/vendor/${vendorId}`);
    };

    const closeModal = () => {
      const modal = bootstrap.Modal.getInstance(vendorModalRef.value);
      modal.hide();
    };

    onMounted(() => {
      const savedUser = localStorage.getItem("user");
      if (savedUser && !userStore.user) {
        userStore.user = JSON.parse(savedUser);
      }
      if (userStore.user?.member?.memberId) {
        loadHistory();
      }
    });

    watch(
      () => userStore.user,
      (newUser) => {
        if (newUser?.member?.memberId) {
          loadHistory();
        }
      }
    );

    return {
      IMAGE_BASE_URL,
      historyData,
      pagedData,
      totalPages,
      handlePageChange,
      onClickVendor,
      selectedVendor,
      vendorModalRef,
      mapUrl,
      closeModal,
    };
  },
};
</script>

<style scoped>
.lookHistory-wrapper {
  width: 100%;
}

/* 主要區塊：左側 Sidebar + 右側內容 */
.history-page {
  display: flex;
  min-height: 100vh;
}

/* 右側主內容 */
/* .history-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; 
  align-items: center;
  text-align: center;
  padding: 40px 20px;
} */

/* 響應式：小螢幕改為上下排列 */
@media (max-width: 992px) {
  .history-page {
    flex-direction: column;
    align-items: center;
  }

  .history-content {
    padding-top: 60px;
  }
}

.section-title {
  font-family: "Yozai-Light", "Microsoft JhengHei", sans-serif;
  color: #8b4513;
  font-weight: bold;
  font-size: 2rem;
  margin-bottom: 2rem;
}

.history-grid {
  display: flex;
  justify-content: center;
  gap: 2rem 1.5rem;
  width: 100%;
  margin-top: -350px; /* 往上移 20px，可自行調整 */
}


.history-card {
  width: 260px;
  height: 320px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.25s ease-in-out;
  text-align: center;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.history-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.history-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.history-info {
  padding: 0.8rem;
}

.history-info h5 {
  font-size: 1.1rem;
  color: #5a3e2b;
  font-weight: bold;
}

.no-history {
  text-align: center;
  padding: 4rem 0;
  color: #8b4513;
  font-size: 1.2rem;
}

.vendor-modal {
  border-radius: 16px;
  background-color: #fffdf8;
  border: 1px solid #f0e6d2;
}
</style>
