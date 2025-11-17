<template>
  <div class="container" id="container" :class="{ 'active': isSignUp }">
    <!-- 登入區 -->
    <div class="form-container sign-in" v-show="!isSignUp">
      <div class="login-box mt-4">
        <p>登入</p>

        <div class="user-box">
          <input type="text" v-model="loginAccount" required />
          <label>帳號 (Email)</label>
        </div>

        <div class="user-box" style="position: relative;">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="loginPassword"
            required
          />
          <label>密碼</label>
          <i
            class="bi"
            :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
            @click="togglePassword"
            style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"
          ></i>
        </div>

        <div class="d-flex justify-content-between align-items-center mb-2 mt-2">
            <!-- 記住我 -->
            <div class="form-check mb-0">
              <input
                class="form-check-input"
                type="checkbox"
                id="rememberMe"
                v-model="rememberMe"
              />
              <label class="form-check-label" for="rememberMe">
                記住我
              </label>
            </div>

            <!-- 忘記密碼  -->
            <router-link to="/forgot-password" class="forgot-link">忘記密碼？</router-link>
          </div>


        <!-- 快速登入選擇 -->
<div class="user-box2">
  <div class="d-flex justify-content-center flex-wrap gap-3" id="quickLoginButtons">
    <div
      class="role-card text-center"
      @click="quickFill('member')"
    >
      <i class="bi bi-person-fill"></i>
    </div>

    <div
      class="role-card text-center"
      @click="quickFill('vendor')"
    >
      <i class="bi bi-shop"></i>
    </div>

    <div
      class="role-card text-center"
      @click="quickFill('admin')"
    >
      <i class="bi bi-shield-lock-fill"></i>
    </div>
  </div>
</div>


        <!-- Google 登入按鈕 -->
        <div class="d-flex justify-content-center mt-3 mb-3" id="g_id_signin"></div>

        <button @click="login" class="btn-login w-100 mt-2">
          <span></span><span></span><span></span><span></span>登入
        </button>

        <div class="text-center mt-3" :style="{ color: msgColor }">{{ loginMsg }}</div>

      </div>
      
    </div>

    <!-- 註冊區 -->
    <div class="form-container sign-up" v-show="isSignUp">
      <div class="login-box mt-4">
        
        <p id="registerTitle">
          <span class="bi bi-person-fill" @click="quickFill('member2')"></span>
          {{ registerTitle }}
        </p>

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
          <input type="email" v-model="registerAccount" required />
          <label>帳號 (Email)</label>
          
        </div>

        <div class="user-box" style="position: relative;">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="registerPassword"
            required
          />
          <label>密碼</label>
          <i
            class="bi"
            :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"
            @click="togglePassword"
            style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); cursor: pointer;"
          ></i>
        </div>


        <!-- Google 註冊按鈕 -->
         <div class="d-flex justify-content-center mt-3 mb-3" id="g_id_signin_register"></div>



        <button class="btn-login w-100" :disabled="loading" @click="register">
          <span></span><span></span><span></span><span></span> 註冊
        </button>
      </div>
    </div>

    <!-- 切換區保留 hamster 動畫 -->
    <div class="toggle-container">
      <div class="toggle">
        <div class="toggle-panel toggle-left">
          <h2>歡迎回來！</h2>
          <p>~請登入以使用所有網站功能~</p>
          <button class="hidden" @click="isSignUp = false">登入</button>
          
          <div class="d-flex justify-content-center mb-2">
            <div class="wheel-and-hamster" aria-label="Hamster running" role="img">
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
          
        </div>

        <div class="toggle-panel toggle-right">
          <h2>哈囉，新朋友！</h2>
          <p>~註冊帳號以體驗完整服務~</p>
          <button class="hidden" @click="isSignUp = true">註冊</button>
          <div class="d-flex justify-content-center mt">
            <div class="wheel-and-hamster" aria-label="Hamster running" role="img">
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
                <div class="spokeR"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import Swal from "sweetalert2"; 
import axios from "axios";
import { useGoogleLogin } from "@/composables/googleLogin.js";


const router = useRouter();
const userStore = useUserStore();
const roleId = ref(2); // 先宣告 roleId
const { initGoogleLogin } = useGoogleLogin(router, roleId);
const rememberMe = ref(false);


// 登入變數
const loginAccount = ref("");
const loginPassword = ref("");
const loginMsg = ref("");
const msgColor = ref("#333");

// 註冊變數
const registerAccount = ref("");
const registerPassword = ref("");
const msg = ref("");
const msgType = ref("");
const showPassword = ref(false);
const isSignUp = ref(false);
const loading = ref(false);

const registerTitle = computed(() => {
  return roleId.value === 2 ? "會員註冊" : "廠商註冊";
});

// 切換角色 / 顯示密碼
const selectRole = (role) => {
  roleId.value = role;
};
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

// Google 登入初始化
onMounted(() => {
  // 初始化登入區的 Google 按鈕
  initGoogleLogin("g_id_signin", "signin");

  // 初始化註冊區的 Google 按鈕
  initGoogleLogin("g_id_signin_register", "signup");


    // 讀取已記住的帳號
  const rememberedAccount = localStorage.getItem("rememberedAccount");
  const rememberedPassword = localStorage.getItem("rememberedPassword");
  if (rememberedAccount && rememberedPassword) {
    loginAccount.value = rememberedAccount;
    loginPassword.value = rememberedPassword;
    rememberMe.value = true;
  }
});


// 登入
const login = async () => {
  try {
    const result = await userStore.login(loginAccount.value, loginPassword.value);
    if (result.success) {
      // 記住帳號密碼
      if (rememberMe.value) {
        localStorage.setItem("rememberedAccount", loginAccount.value);
        localStorage.setItem("rememberedPassword", loginPassword.value);
      } else {
        localStorage.removeItem("rememberedAccount");
        localStorage.removeItem("rememberedPassword");
      }

      Swal.fire({ icon: "success", title: "登入成功", confirmButtonText: "確定" })
        .then(() => {
          // 判斷使用者角色
          if (userStore.roleId === 3) {
            router.push("/vendor/vendorHome"); // 導向廠商頁面
          } else {
            router.push("/"); // 其他導向首頁
          }
        });
    } else {
      Swal.fire({ icon: "error", title: result.message });
    }
  } catch (err) {
    Swal.fire({ icon: "error", title: "登入失敗" });
  }
};




// 註冊
const register = async () => {

  if (!registerAccount.value.includes("@")) {
    Swal.fire({ icon: "warning", title: "請輸入有效 Email" });
    return;
  }
  if (registerPassword.value.length < 6) {
    Swal.fire({ icon: "warning", title: "密碼至少 6 碼" });
    return;
  }

  loading.value = true;
  try {
    const res = await axios.post("/api/register", {
      account: registerAccount.value,
      password: registerPassword.value,
      roleId: roleId.value,
    }, { withCredentials: true });


    if (res.data.success) {
      await Swal.fire({
        icon: "success",
        title: "註冊成功！",
        text: "請至信箱驗證後即可登入。",
        confirmButtonText: "確定",
      });
      registerAccount.value = "";
      registerPassword.value = "";
      isSignUp.value = false;
    } else {
      Swal.fire({ icon: "error", title: "註冊失敗", text: res.data.message || "請稍後再試" });
    }
  } catch (error) {
    Swal.fire({ icon: "error", title: "伺服器錯誤", text: "請稍後再試" });
  } finally {
    loading.value = false;
  }
};



// 一鍵填入帳密
function quickFill(role) {
  switch (role) {
    case "member":
      loginAccount.value = "bob2@gururu.com.tw";
      loginPassword.value = "Passw0rd02";
      break;
    case "vendor":
      loginAccount.value = "vendor001@gururu.com.tw";
      loginPassword.value = "VendorPwd01";
      break;
    case "admin":
      loginAccount.value = "admin@gururu.com.tw";
      loginPassword.value = "Admin@12345";
      break;
    case "member2":
      registerAccount.value = "skywalkerdemo666@gmail.com";
      registerPassword.value = "111111";
      break;
  }
};




</script>

<style scoped>
@import "@/assets/css/container.css";
@import "@/assets/css/hamster.css";
@import "@/assets/css/hamsterR.css";
</style>
