<template>
  <div class="d-flex flex-column min-vh-100">

    <div class="d-flex justify-content-center align-items-center flex-grow-1">
      <div class="login-box">
        <div v-if="loading" class="alert alert-info">驗證中，請稍候...</div>
        <div v-else-if="success" class="alert alert-success">{{ message }}</div>
        <div v-else class="alert alert-danger">{{ message }}</div>

        <RouterLink to="/login" class="btn-login w-100 mt-3">
          <span></span><span></span><span></span><span></span> 回登入頁
        </RouterLink>
      </div>
    </div>

  </div>
</template>

<script>

import axios from "axios";

export default {
  name: "VerifyResult",

  data() {
    return {
      loading: true,
      success: false,
      message: "驗證中...",
    };
  },
  mounted() {
    // 取得 URL query token
    const token = this.$route.query.token;

    if (!token) {
      this.loading = false;
      this.success = false;
      this.message = "缺少驗證 token";
      return;
    }

    // 呼叫後端 API 驗證
    axios.get(`/api/verify?token=${token}`)
      .then(res => {
        this.success = res.data.success;
        this.message = res.data.message;
      })
      .catch(err => {
        this.success = false;
        this.message = "伺服器錯誤，請稍後再試";
      })
      .finally(() => {
        this.loading = false;
      });
  }
};
</script>

