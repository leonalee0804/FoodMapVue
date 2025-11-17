<template>
  <div class="vendorHome d-flex min-vh-100">
    <!-- 側邊欄 -->
    <nav class="sidebar bg-light p-3">
      <ul>
        <li><router-link to="report">營運報表</router-link></li>
        <li><router-link to="info">基本資料</router-link></li>
        <li><router-link to="details">營業資訊</router-link></li>
        <li><router-link to="menu">商品瀏覽</router-link></li>
        <!-- <li><router-link to="orders">訂單管理</router-link></li> -->
        <li><router-link to="ADPage">廣告購買</router-link></li>
        <li><router-link to="vendorComment">觀看評論</router-link></li>
        <li class="nav-item border-top pt-2" data-aos="fade-down" data-aos-delay="1000">
          <a href="#" class="dropdown-item d-flex align-items-center" @click.prevent="logout">
            <i class="bi-box-arrow-left me-2"></i>
            登出
          </a>
        </li>
      </ul>
    </nav>

    <!-- 右側內容區 -->
    <div class="main-content flex-fill p-4">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import axios from "axios";
import { useUserStore } from "@/stores/user";

const router = useRouter();
const userStore = useUserStore();

async function logout() {
  try {
    await axios.post("/api/logout", {}, { withCredentials: true });
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    // 清除使用者登入狀態
    userStore.user = null;
    userStore.isBlacklisted = false;

    // 導向登入頁並替換歷史紀錄
    router.replace("/login");

    // 防止使用者按上一頁回會員頁
    window.history.pushState(null, "", "/login");
    window.addEventListener("popstate", () => {
      router.replace("/login");
    });

    // 強制刷新頁面以確保狀態更新
    window.location.reload();
  }
}
</script>


<style scoped>
.vendorHome {
  display: flex;
}

.sidebar {
  width: 220px;
  min-height: 100vh;
  border-right: 1px solid #ddd;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin: 1rem 0;
}

.sidebar a {
  text-decoration: none;
  color: #333;
}

.sidebar a.router-link-active {
  font-weight: bold;
  color: #007bff;
}

.main-content {
  flex: 1;
}
</style>
