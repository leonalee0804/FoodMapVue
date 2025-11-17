<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- 動畫 -->
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

    <!-- 重設密碼表單 -->
    <div class="d-flex justify-content-center align-items-center flex-grow-1">
      <div class="login-box">
        <p>重設密碼</p>

        <div class="user-box" style="position: relative;">
          <input type="text" v-model="account" required />
          <label>帳號 (Email)</label>
        </div>

        <div class="user-box" style="position: relative;">
          <input type="password" v-model="newPassword" required />
          <label>新密碼</label>
        </div>

        <button @click="resetPassword" class="btn-login w-100">
          <span></span><span></span><span></span><span></span>確認重設
        </button>

        <p class="mt-3 text-center">
          <router-link to="/login" class="a2">返回登入</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const account = ref("");
const newPassword = ref("");

const resetPassword = async () => {
  if (!account.value || !newPassword.value) {
    Swal.fire("請輸入帳號與新密碼", "", "warning");
    return;
  }

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/reset-password-direct`,
      {
        account: account.value,
        newPassword: newPassword.value,
      }
    );

    if (response.data.success) {
      Swal.fire("密碼重設成功！", "請使用新密碼登入", "success");
    } else {
      Swal.fire("錯誤", response.data.message, "error");
    }
  } catch (error) {
    Swal.fire("伺服器錯誤", "", "error");
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
