<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- Loader -->
    <div v-if="loading" id="loader-wrapper">
      <div class="loader"></div>
      <div class="loader-text">Loading...</div>
    </div>

    <!-- 倉鼠動畫 -->
    <div class="d-flex justify-content-center mt">
      <div
        aria-label="Orange and tan hamster running in a metal wheel"
        role="img"
        class="wheel-and-hamster"
      >
        <div class="wheel">
          <div class="hamster-wrapper">
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
          </div>
          <div class="spoke"></div>
        </div>
      </div>
    </div>

    <!-- 註冊表單 -->
    <div class="d-flex justify-content-center align-items-center flex-grow-1">
      <div class="login-box">
        <p id="registerTitle">{{ registerTitle }}</p>

        <!-- 選擇角色 -->
        <div class="user-box mb-3">
          <div class="d-flex justify-content-center" id="roleSelector">
            <div
              class="role-card text-center"
              :class="{ active: roleId === 2 }"
              @click="selectRole(2)"
            >
              <i class="bi bi-person-add display-6"></i>
              <div>會員</div>
            </div>

            <div
              class="role-card text-center"
              :class="{ active: roleId === 3 }"
              @click="selectRole(3)"
            >
              <i class="bi bi-shop display-6"></i>
              <div>廠商</div>
            </div>
          </div>
        </div>

        <!-- 訊息提示 -->
        <div
          v-if="msg"
          :class="['alert', msgType === 'success' ? 'alert-success' : 'alert-danger']"
        >
          {{ msg }}
        </div>

        <div class="user-box">
          <input type="email" v-model="account" required />
          <label for="account">帳號 (Email)</label>
        </div>

        <!-- 密碼欄位 + 眼睛圖示 -->
        <div class="user-box" style="position: relative;">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            required
          />
          <label for="loginPassword">密碼</label>

          <!-- 眼睛圖示 -->
          <i
            class="bi"
            :class="!showPassword ? 'bi-eye-slash' : 'bi-eye'"
            @click="togglePassword"
            style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"
          ></i>
        </div>

        <!-- 註冊按鈕 -->
        <button class="btn-login w-100" :disabled="loading" @click="register">
          <span></span><span></span><span></span><span></span> 註冊
        </button>

        <p class="mt-3">
          <RouterLink to="/login" class="a2">已有帳號? 登入</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Register",

  data() {
    return {
      account: "",
      password: "",
      roleId: 2,
      msg: "",
      msgType: "",
      loading: false,
      showPassword: false,
    };
  },

  computed: {
    registerTitle() {
      return this.roleId === 2 ? "會員註冊" : "廠商註冊";
    },
  },

  methods: {
    selectRole(role) {
      this.roleId = role;
    },

    togglePassword() {
      this.showPassword = !this.showPassword;
    },

    async register() {
      this.msg = "";
      this.loading = true;

      if (!this.account.includes("@")) {
        this.showMsg("請輸入有效 Email", "danger");
        this.loading = false;
        return;
      }
      if (this.password.length < 6) {
        this.showMsg("密碼至少 6 碼", "danger");
        this.loading = false;
        return;
      }

      try {
        const res = await axios.post(
          "/api/register",
          {
            account: this.account,
            password: this.password,
            roleId: this.roleId,
          },
          { withCredentials: true }
        );

        if (res.data.success) {
          this.showMsg("註冊成功！請至信箱確認驗證信", "success");
          this.account = "";
          this.password = "";
        } else {
          this.showMsg(res.data.message || "註冊失敗", "danger");
        }
      } catch (e) {
        this.showMsg("伺服器錯誤，請稍後再試", "danger");
      } finally {
        this.loading = false;
      }
    },

    showMsg(msg, type) {
      this.msg = msg;
      this.msgType = type;
    },
  },
};
</script>

<style scoped>
@import "@/assets/css/hamsterR.css";
</style>
