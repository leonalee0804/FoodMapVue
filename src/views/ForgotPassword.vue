<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- 動畫區塊 -->
    <div class="d-flex justify-content-center mb-2">
      <div
        aria-label="Orange and tan hamster running in a metal wheel"
        role="img"
        class="wheel-and-hamster"
      >
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

    <!-- 忘記密碼表單 -->
    <div class="d-flex justify-content-center align-items-center flex-grow-1">
      <div class="login-box">
        <p>
            <span class="bi bi-person-fill" @click="quickFill('member3')"></span>
          
          忘記密碼</p>

        <div class="user-box">
          <input type="email" v-model="account" required />
          <label>Email</label>
        </div>

        <button
          @click="sendResetEmail"
          class="btn-login w-100"
          :disabled="loading"
        >
          <span></span><span></span><span></span><span></span>
          {{ loading ? "寄送中..." : "寄送重設連結" }}
      
        </button>

        <div class="text-center mt-3">
          <router-link to="/login" class="a2">返回登入頁</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Swal from "sweetalert2";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const account = ref("");
const loading = ref(false);

const sendResetEmail = async () => {
  if (!account.value) {
    Swal.fire("請輸入 Email", "", "warning");
    return;
  }

  try {
    loading.value = true;
    const response = await axios.post(`${API_BASE_URL}/api/forgot-password`, {
      account: account.value,
      baseUrl: window.location.origin,
    });

    if (response.data.success) {
      Swal.fire("重設連結已寄出！", "請至信箱查看。", "success");
    
    } else {
      Swal.fire(response.data.message || "找不到此帳號！", "", "error");
    }
  } catch (error) {
    console.error(error);
    Swal.fire("伺服器錯誤，請稍後再試。", "", "error");
  } finally {
    loading.value = false;
  }
};

function quickFill(role) {
  switch (role) {
    case "member3":
      account.value = "skywalkerdemo666@gmail.com";
      break;
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
</style>
