//Boostrap 遮罩問題
<template>
  <div>
    <div class="container mt-4">
      <h2>所有店家</h2>

      <!-- 搜尋 & 篩選 -->
      <div class="row mb-3">
        <div class="col-md-4">
          <input type="text" v-model="searchText" class="form-control" placeholder="搜尋店名或地址" />
        </div>
        <div class="col-md-3">
          <select v-model="categoryFilter" class="form-select">
            <option value="">全部分類</option>
            <option value="1">火鍋</option>
            <option value="2">壽司</option>
            <option value="3">咖啡館</option>
            <option value="4">燒烤</option>
            <option value="5">披薩/牛排</option>
          </select>
        </div>
        <div class="col-md-3">
          <select v-model="statusFilter" class="form-select">
            <option value="">全部狀態</option>
            <option value="上限中">上限中</option>
            <option value="審核中">審核中</option>
            <option value="結束合作">結束合作</option>
            <option value="停用中">停用中</option>
          </select>
        </div>
        <div class="col-md-2 d-flex align-items-center">
          <label class="me-2 mb-0">每頁顯示：</label>
          <select v-model.number="pageSize" class="form-select w-auto">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
          </select>
        </div>
      </div>

      <!-- 店家表格 -->
      <table class="table table-bordered align-middle">
        <thead class="table-dark">
          <tr>
            <th>地圖</th>
            <th>店名</th>
            <th>地址</th>
            <th>聯絡人</th>
            <th>電話</th>
            <th>狀態</th>
            <th v-if="isLoggedIn">收藏</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vendor in paginatedVendors" :key="vendor.vendorId" class="vendor-row"
              @click="showVendorDetail(vendor.vendorId)">
            <td>
              <iframe class="vendor-map-thumb"
                      :src="'https://www.google.com/maps?q=' + encodeURIComponent(vendor.address) + '&output=embed'"></iframe>
            </td>
            <td>{{ vendor.vendorName }}</td>
            <td>{{ vendor.address }}</td>
            <td>{{ vendor.contactName }}</td>
            <td>{{ vendor.contactTel }}</td>
            <td>{{ vendor.vdStatus }}</td>
            <td v-if="isLoggedIn" class="text-center">
              <i class="bi" :class="vendor.isFavorited ? 'bi-heart-fill text-danger' : 'bi-heart text-secondary'"
                 @click.stop="toggleFavorite(vendor)" style="cursor: pointer; font-size: 1.3rem;"></i>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分頁 -->
      <nav v-if="totalPages > 1">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 0 }">
            <a href="#" class="page-link" @click.prevent="currentPage--">上一頁</a>
          </li>
          <li v-for="(page, index) in totalPages" :key="index" class="page-item" :class="{ active: index === currentPage }">
            <a href="#" class="page-link" @click.prevent="currentPage = index">{{ index + 1 }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages - 1 }">
            <a href="#" class="page-link" @click.prevent="currentPage++">下一頁</a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- 店家詳細資料 Modal -->
    <div class="modal fade" id="vendorModal" tabindex="-1" aria-hidden="true" ref="vendorModalRef">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title">{{ selectedVendor.vendorName }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><strong>地址：</strong>{{ selectedVendor.address }}</p>
            <p><strong>聯絡人：</strong>{{ selectedVendor.contactName }}</p>
            <p><strong>電話：</strong>{{ selectedVendor.contactTel }}</p>
            <p><strong>狀態：</strong>{{ selectedVendor.vdStatus }}</p>


            
            <div v-if="isLoggedIn" class="text-center mt-3">
              <button class="btn btn-outline-danger" @click="toggleFavorite(selectedVendor)">
                <i class="bi" :class="selectedVendor.isFavorited ? 'bi-heart-fill' : 'bi-heart'"></i>
                {{ selectedVendor.isFavorited ? "已收藏" : "加入收藏" }}
              </button>
              <button class="btn btn-primary" @click="goToReservation(selectedVendor.vendorId)">
                訂位
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from "vue";
import axios from "axios";
import * as bootstrap from "bootstrap";
import { useFavorites } from "@/composables/useFavorites";
import { useRouter } from 'vue-router';

const { toggleFavorite } = useFavorites();
const router = useRouter();

const vendors = ref([]);
const searchText = ref("");
const categoryFilter = ref("");
const statusFilter = ref("");
const pageSize = ref(5);
const currentPage = ref(0);
const vendorModalRef = ref(null);
const isLoggedIn = ref(false);

const selectedVendor = reactive({
  vendorId: null,
  vendorName: "",
  address: "",
  contactName: "",
  contactTel: "",
  vdStatus: "",
  isFavorited: false,
});

//=================boostrap 遮罩關掉設定============================================


let isFirstOpen = true;
let vendorModalInstance = null;

// 顯示詳細資料 Modal
const showVendorDetail = async (vendorId) => {
  try {
    const res = await axios.get(`/api/vendor/${vendorId}`);
    Object.assign(selectedVendor, res.data);

    if (!vendorModalInstance) {
      vendorModalInstance = new bootstrap.Modal(vendorModalRef.value, {
        backdrop: isFirstOpen ? true : false,
        keyboard: true
      });

      vendorModalRef.value.addEventListener('hidden.bs.modal', () => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      });
    }

    vendorModalInstance.show();
    isFirstOpen = false;

  } catch (err) {
    console. Error(err);
  }
};
//===========================================================================================
// 訂位跳轉
function goToReservation(vendorId) {
  if (vendorModalInstance) vendorModalInstance.hide();
  router.push('/reservation/' + vendorId);
}

// -----------------------------
// 取得店家 + 收藏
// -----------------------------
const fetchVendors = async () => {
  try {
    let favoriteIds = new Set();
    try {
      const favoritesRes = await axios.get("/api/favorites/my");
      favoriteIds = new Set(favoritesRes.data.map(f => f.vendorId));
      isLoggedIn.value = true;
    } catch { isLoggedIn.value = false; }

    const vendorsRes = await axios.get("/api/vendor/all");
    vendors.value = vendorsRes.data.map(v => ({ ...v, isFavorited: favoriteIds.has(v.vendorId) }));
  } catch (err) {
    console. Error(err);
  }
};

onMounted(fetchVendors);
//==============================================================================================
// 分頁
const filteredVendors = computed(() => {
  return vendors.value.filter(v => {
    const matchesSearch = v.vendorName.toLowerCase().includes(searchText.value.toLowerCase()) ||
                          v.address.toLowerCase().includes(searchText.value.toLowerCase());
    const matchesCategory = !categoryFilter.value || v.vdCategoryID == categoryFilter.value;
    const matchesStatus = !statusFilter.value || v.vdStatus === statusFilter.value;
    return matchesSearch && matchesCategory && matchesStatus;
  });
});
const totalPages = computed(() => Math.ceil(filteredVendors.value.length / pageSize.value));
const paginatedVendors = computed(() => {
  const start = currentPage.value * pageSize.value;
  return filteredVendors.value.slice(start, start + pageSize.value);
});
watch([searchText, categoryFilter, statusFilter, pageSize], () => currentPage.value = 0);

</script>

<style scoped>
.vendor-map-thumb { width: 150px; height: 100px; border: 0; }
.vendor-row:hover { cursor: pointer; background-color: #f2f2f2; }
</style>
