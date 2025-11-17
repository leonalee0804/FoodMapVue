<template>
  <div class="d-flex flex-row flex-nowrap min-vh-100">
    <!-- 全域 Loader -->
    <div v-if="loading" id="loader-wrapper">
      <div class="loader"></div>
    </div>

    <!-- Main container -->
    <div class="container-fluid">
      <div class="d-flex flex-row flex-nowrap min-vh-200">

        <!-- 使用獨立的 Sidebar 組件 -->
        <MemberSidebar @logout="logout" />

        <!-- Main content -->
        <main class="main-content flex-grow-1 p-4">
           <div class="title-group mb-4">
            <div class="welcome-banner">
              <div class="welcome-content">
                <h3 class="welcome-title">
                  <span class="wave">👋</span>
                  Hi, {{ member?.userName || "未設定" }}!
                </h3>
                <p class="welcome-subtitle">Welcome back! We're glad to see you again.</p>
              </div>
              <div class="welcome-decoration">
                <div class="decoration-circle circle-1"></div>
                <div class="decoration-circle circle-2"></div>
                <div class="decoration-circle circle-3"></div>
              </div>
            </div>
          </div>

          <div class="row my-4">
            <!-- Left Column: User Info -->
            <div class="col-lg-7 col-12">
              <!-- General Info -->
              <div class="custom-block custom-block-profile">
                <div class="row">
                  <div class="col-lg-12 col-12 mb-3">
                    <h6>General</h6>
                  </div>

                  <div class="col-lg-3 col-12 mb-4 mb-lg-0">
                    <div class="custom-block-profile-image-wrap">
                      <img :src="avatarPreview || avatarUrl" alt="會員頭像" id="avatarPreviewHome" width="120" height="120"
                        class="rounded-circle mb-2" style="object-fit: cover;" />
                      <a href="#" @click.prevent="openSetting" class="bi-pencil-square custom-block-edit-icon"></a>
                    </div>
                  </div>

                  <div class="col-lg-9 col-12">
                    <p class="d-flex flex-wrap mb-2">
                      <strong>Name:</strong> <span>{{ member?.userName || "未設定" }}</span>
                    </p>
                    <p class="d-flex flex-wrap mb-2">
                      <strong>Email:</strong> <a href="#">{{ user?.account || "未設定" }}</a>
                    </p>
                    <p class="d-flex flex-wrap mb-2">
                      <strong>Phone:</strong> <span>{{ member?.phone || "未填" }}</span>
                    </p>
                    <p class="d-flex flex-wrap mb-2">
                      <strong>Birthday:</strong> <span>{{ member?.birthdate || "未填" }}</span>
                    </p>
                    <p class="d-flex flex-wrap">
                      <strong>Location:</strong>
                      <span>{{ member?.city || "" }} {{ member?.district || "" }}</span>
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <!-- Right Column: Stats Cards + Contact -->
            <div class="col-lg-5 col-12">
              <!-- 統計卡片 -->
              <StatsCards :spendingData="spendingData" />
            </div>
          </div>

          <!-- 消費分析圖表 - 並排顯示 -->
          <SpendingAnalysis :spendingData="spendingData" />

            
              <!-- Account Info -->
              <div class="custom-block custom-block-profile bg-white mt-4">
                <h6 class="mb-4">Account Information</h6>
                <p class="d-flex flex-wrap mb-2">
                  <strong>Account ID:</strong> <span>{{ user?.accountId || "未知" }}</span>
                </p>
                <p class="d-flex flex-wrap mb-2">
                  <strong>Created:</strong> <span>{{ user?.createdAt || "未知" }}</span>
                </p>
                <p class="d-flex flex-wrap mb-2">
                  <strong>LastLogIn:</strong> <span>{{ user?.lastLogIn || "未知" }}</span>
                </p>
              </div>
        </main>
      </div>
    </div>


    <!-- 右側滑出側欄 -->
    <div id="memberSetting" :class="{ show: showSetting }">
      <button class="close-btn" @click="closeSetting">&times;</button>
      <!-- Setting 元件 -->
      <Setting v-show="showSetting" v-model:showSetting="showSetting" :member="member" @updated="loadMemberData"
        @avatar-preview="avatarPreview = $event" @close="showSetting = false" />
        
    </div>


    
  </div>


  
</template>

<script>
import axios from "axios";
import { useUserStore } from "@/stores/user";
import router from "@/router";
import Setting from "@/views/member/setting.vue";
import MemberSidebar from "@/components/member/memberSidebar.vue"; 
import "@/assets/css/member/memberHome.css";
import SpendingAnalysis from "@/components/member/Spendinganalysis.vue";
import StatsCards from "@/components/member/Statscards.vue";


export default {
  name: "UserProfile",
  components: { 
    Setting,
    MemberSidebar,
    SpendingAnalysis,
    StatsCards
  },
  data() {
    return {
      member: {},
      user: {},
      showSetting: false,
      loading: false,
      avatarPreview: null,
    };
  },
  computed: {
    avatarUrl() {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      return this.member?.avatarURL
        ? `${baseUrl}/uploads/avatars/${this.member.avatarURL}`
        : '/images/gururu_food.png';
    }
  },
  mounted() {
    this.loadMemberData();
  },
  methods: {
    openSetting() {
      this.showSetting = true;
    },
    closeSetting() {
      this.showSetting = false;
      this.avatarPreview = null;
    },
    async loadMemberData() {
      this.loading = true;
      try {
        const res = await axios.get("/api/member/profile", { withCredentials: true });
        const data = res.data;

        this.member = {
          avatarURL: data.avatarURL || null,
          userName: data.userName || "未填寫",
          phone: data.phone || "未填寫",
          birthdate: data.birthdate || "",
          city: data.city || "未填寫",
          district: data.district || "未填寫",
          gender: data.gender || "男",
        };

        this.user = {
          account: data.account || "未填寫",
          accountId: data.accountId,
          createdAt: data.createdAt,
          lastLogIn: data.lastLogIn,
        };

        this.avatarPreview = null;
      } catch (err) {
        console.error("讀取會員資料失敗:", err);
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      const userStore = useUserStore();

      try {
        await axios.post("/api/logout", {}, { withCredentials: true });
      } catch (err) {
        console.error("Logout failed:", err);
      } finally {
        userStore.user = null;
        userStore.isBlacklisted = false;
        router.replace("/login");
        window.history.pushState(null, "", "/login");
        window.addEventListener("popstate", () => {
          router.replace("/login");
        });
        window.location.reload();
      }
    }
  }
};
</script>

<style scoped>
.container-fluid{
  padding: 0;
}
</style>