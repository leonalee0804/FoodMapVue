<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- 全域 Loader -->
    <div id="loader-wrapper" v-if="loading">
      <div class="loader"></div>
      <div class="loader-text">Loading...</div>
    </div>

    <!-- 動畫區塊 -->
    <div class="d-flex justify-content-center mb-2">
      <div aria-label="Orange and tan hamster running in a metal wheel"
           role="img"
           class="wheel-and-hamster">
        <div class="wheel"></div>
        <div class="hamster">
          <div class="hamster__body">
            <div class="hamster__head">
              <div class="hamster__ear"></div>
              <div class="hamster__eye"></div>
              <div class="hamster__nose"></div>
            </div>
            <div class="hamster__limb hamster__limb--fr"></div>
            <div class="hamster__limb hamster__limb--fl"></div>
            <div class="hamster__limb hamster__limb--br"></div>
            <div class="hamster__limb hamster__limb--bl"></div>
            <div class="hamster__tail"></div>
          </div>
        </div>
        <div class="spoke"></div>
      </div>
    </div>

    <!-- 登入表單 -->
    <div class="d-flex justify-content-center align-items-center flex-grow-1">
      <div class="login-box">
        <p>Login</p>

        <div class="user-box" style="position: relative;">
          <input type="text" v-model="account" required />
          <label for="loginAccount">帳號(Email)</label>
        </div>

        <div class="user-box" style="position: relative;">
          <input type="password" v-model="password" required />
          <label for="loginPassword">密碼</label>
        </div>

        <!-- 忘記密碼 -->
        <div class="text-end">
          <router-link to="/forgot-password" class="forgot-link small text-muted">
            忘記密碼？
          </router-link>
        </div>

        <button @click="login" class="btn-login w-100 mt-2">
          <span></span><span></span><span></span><span></span>登入
        </button>

        <!-- 登入訊息顯示區 -->
        <div class="text-center mt-2" :style="{ color: msgColor }">
          {{ loginMsg }}
        </div>

        <p class="mt-3 text-center">
          <router-link to="/register" class="a2">還沒有帳號？ 註冊</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const userStore = useUserStore();
const router = useRouter();

const account = ref("");
const password = ref("");
const loading = ref(false);
const loginMsg = ref("");
const msgColor = ref("#333");

const login = async () => {
  loading.value = true;
  const result = await userStore.login(account.value, password.value);
  loading.value = false;

  if (result.success) {
    Swal.fire({ icon: "success", title: "登入成功", showConfirmButton: true });
    setTimeout(() => {
      router.push("/");
    }, 1000);
  } else {
    Swal.fire({ icon: "error", title: result.message });
  }
};
</script>

<style scoped>
@import "@/assets/css/hamster.css";

.a2 {
  text-decoration: none;
  color: #333;
  transition: 0.3s;
}
.a2:hover {
  color: #007bff;
}

.forgot-link {
  text-decoration: none;
  font-size: 13px;
  transition: 0.3s;
}
.forgot-link:hover {
  color: #007bff !important;
}
</style>
