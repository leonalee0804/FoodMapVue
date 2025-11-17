<template>
  <div>
    <!-- Hero Section -->
    <Carousel>
      <SearchBar />
    </Carousel>
    <GuessYouLike v-if="isLoggedIn" />

    <!-- <div class="adimg">
      <a href="/ADevent">
        <img src="/images/ADmain.png" alt="廣告主圖" />
      </a>
    </div> -->

    <TopVendors />

    <!-- <Promotions /> -->
    <HomeProducts />

  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed } from "vue";
import { useUserStore } from "@/stores/user";
import axios from "axios";
import Swal from "sweetalert2";

// Home輪播
import SearchBar from "@/components/SearchBar.vue";
import Carousel from "@/components/Carousel.vue";
import TopVendors from "@/components/TopVendors.vue";
import Promotions from "@/components/Promotions.vue";
import GuessYouLike from "@/components/GuessYouLike.vue";
import HomeProducts from "@/components/HomeProducts.vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { Autoplay, Pagination } from "swiper/modules";


axios.defaults.withCredentials = true;

// 取得 Pinia store
const userStore = useUserStore();

// 登入狀態
const isLoggedIn = computed(() => !!userStore.user);
const isBlacklisted = computed(() => userStore.isBlacklisted);


// 收藏 / 取消收藏
// const toggleFavorite = async (vendor) => {
//   if (!isLoggedIn.value) {
//     Swal.fire("帳號未啟用或未登入，無法收藏", "", "warning");
//     return;
//   }

//   if (isBlacklisted.value) {
//     Swal.fire("帳號已停權，無法使用收藏功能", "", "warning");
//     return;
//   }

//   if (!vendor.isFavorited) {
//     const result = await Swal.fire({
//       title: "確認加入收藏？",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "加入收藏",
//       cancelButtonText: "取消",
//     });
//     if (result.isConfirmed) {
//       try {
//         await axios.post("/api/favorites/my", { vendorID: vendor.vendorId });
//         vendor.isFavorited = true;
//         Swal.fire("已加入收藏", "", "success");
//       } catch {
//         Swal.fire("加入收藏失敗", "", "error");
//       }
//     }
//   } else {
//     const result = await Swal.fire({
//       title: "確認取消收藏？",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "是，取消收藏",
//       cancelButtonText: "取消",
//     });
//     if (result.isConfirmed) {
//       try {
//         await axios.delete(`/api/favorites/my/${vendor.vendorId}`);
//         vendor.isFavorited = false;
//         Swal.fire("已取消收藏！", "", "success");
//       } catch {
//         Swal.fire("取消收藏失敗", "", "error");
//       }
//     }
//   }
// };

// 初始化
onMounted(async () => {
  await userStore.fetchUser(); // 抓當前使用者,更新 stores.user
});
</script>


<style scoped>
.food-card {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease-in-out;
}

.food-card.show {
  opacity: 1;
  transform: translateY(0);
}

.favorite-btn {
  position: relative;
  z-index: 5;
}

/* Swiper pagination dots */
.swiper-pagination-bullet {
  background: #d98c3f;
  opacity: 0.7;
}

.swiper-pagination-bullet-active {
  opacity: 1;
  background: #d98c3f;
}

.adimg {
  max-width: 900px;
  margin: 40px auto;
  display: flex;
  justify-content: center;
}

.adimg img {
  width: 100%;
  height: auto;
  object-fit: contain;
}
</style>
