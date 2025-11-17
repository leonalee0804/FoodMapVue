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

    <!-- 重設密碼表單 -->
    <div class="d-flex justify-content-center align-items-center flex-grow-1">
      <div class="login-box">
        <p>重設密碼</p>

        <div class="user-box">
          <input type="password" v-model="newPassword" required />
          <label>新密碼</label>
        </div>

        <div class="user-box">
          <input type="password" v-model="confirmPassword" required />
          <label>確認新密碼</label>
        </div>

        <button
          @click="resetPassword"
          class="btn-login w-100"
          :disabled="loading"
        >
          <span></span><span></span><span></span><span></span>
          {{ loading ? "重設中..." : "重設密碼" }}
        </button>

        <div class="text-center mt-3">
          <router-link to="/login" class="a2">返回登入頁</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const newPassword = ref("");
const confirmPassword = ref("");
const token = ref("");
const loading = ref(false);

onMounted(() => {
  token.value = route.query.token || "";
  if (!token.value) {
    Swal.fire("無效連結", "請確認重設密碼的連結是否正確。", "error");
  }
});

const resetPassword = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    Swal.fire("請輸入完整密碼", "", "warning");
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    Swal.fire("密碼不一致", "請重新輸入相同的密碼。", "warning");
    return;
  }
  if (!token.value) {
    Swal.fire("無效連結", "請確認重設密碼的連結是否正確。", "error");
    return;
  }

  try {
    loading.value = true;
    const response = await axios.post(`${API_BASE_URL}/api/reset-password`, {
      token: token.value,
      newPassword: newPassword.value,
    });

    if (response.data.success) {
      Swal.fire("密碼重設成功！", "請使用新密碼登入。", "success").then(() => {
        router.push("/login");
      });
    } else {
      Swal.fire(response.data.message || "重設密碼失敗", "", "error");
    }
  } catch (error) {
    console.error(error);
    Swal.fire("伺服器錯誤，請稍後再試。", "", "error");
  } finally {
    loading.value = false;
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
