<template>
  <nav id="sidebarMenu" class="sidebar">
    <div class="sidebar-header">
      <h5 class="sidebar-title">會員中心</h5>
    </div>
    
    <ul class="nav flex-column">
      <li class="nav-item" data-aos="fade-down" data-aos-delay="0">
        <RouterLink to="/member/memberHome" class="nav-link">
          <i class="bi bi-house-fill"></i>
          <span>Overview</span>
        </RouterLink>
      </li>
      <li class="nav-item" data-aos="fade-down" data-aos-delay="100">
        <RouterLink to="/member/profile" class="nav-link">
          <i class="bi bi-gear-fill"></i>
          <span>會員設定</span>
        </RouterLink>
      </li>
      <li class="nav-item" data-aos="fade-down" data-aos-delay="200">
        <RouterLink to="/member/orderHistory" class="nav-link">
          <i class="bi bi-wallet-fill"></i>
          <span>訂單紀錄</span>
        </RouterLink>
      </li>
      <li class="nav-item" data-aos="fade-down" data-aos-delay="300">
        <RouterLink to="/reservationrecords" class="nav-link">
          <i class="bi bi-calendar-check-fill"></i>
          <span>訂位紀錄</span>
        </RouterLink>
      </li>
      <li class="nav-item" data-aos="fade-down" data-aos-delay="400">
        <RouterLink to="/cart" class="nav-link">
          <i class="bi bi-cart-fill"></i>
          <span>購物車</span>
        </RouterLink>
      </li>
      <li class="nav-item" data-aos="fade-down" data-aos-delay="500">
        <RouterLink to="/member/lookHistory" class="nav-link">
          <i class="bi bi-clock-history"></i>
          <span>瀏覽紀錄</span>
        </RouterLink>
      </li>
      <li class="nav-item" data-aos="fade-down" data-aos-delay="600">
        <RouterLink to="/member/commentRecord" class="nav-link">
          <i class="bi bi-chat-dots-fill"></i>
          <span>評論紀錄</span>
        </RouterLink>
      </li>
      <li class="nav-item" data-aos="fade-down" data-aos-delay="700">
        <RouterLink to="/member/favorite" class="nav-link">
          <i class="bi bi-heart-fill"></i>
          <span>我的收藏</span>
        </RouterLink>
      </li>
      <li class="nav-item" data-aos="fade-down" data-aos-delay="800">
        <RouterLink to="/customerServiceRecord" class="nav-link">
          <i class="bi bi-headset"></i>
          <span>客服中心</span>
        </RouterLink>
      </li>
      
      <li class="nav-divider"></li>
      
      <li class="nav-item" data-aos="fade-down" data-aos-delay="900">
        <RouterLink to="/" class="nav-link">
          <i class="bi bi-house-door-fill"></i>
          <span>回首頁</span>
        </RouterLink>
      </li>
      <li class="nav-item" data-aos="fade-down" data-aos-delay="1000">
        <a href="#" class="nav-link logout-link" @click.prevent="handleLogout">
          <i class="bi bi-box-arrow-left"></i>
          <span>登出</span>
        </a>
      </li>
    </ul>

    <!-- 登出確認對話框 -->
    <div v-if="showLogoutModal" class="logout-modal-overlay" @click.self="closeLogoutModal">
      <div class="logout-modal">
        <div class="logout-modal-header">
          <h5>確認登出</h5>
          <button class="close-btn" @click="closeLogoutModal">&times;</button>
        </div>
        <div class="logout-modal-body">
          <i class="bi bi-exclamation-circle logout-icon"></i>
          <p>確定要登出嗎？</p>
        </div>
        <div class="logout-modal-footer">
          <button class="btn-cancel" @click="closeLogoutModal">取消</button>
          <button class="btn-confirm" @click="confirmLogout">確定登出</button>
        </div>
      </div>
    </div>

    <!-- Loading 遮罩 -->
    <div v-if="isLoggingOut" class="logout-loading-overlay">
      <div class="logout-spinner"></div>
      <p>登出中...</p>
    </div>
  </nav>
</template>

<script>
import axios from 'axios';
import { useUserStore } from '@/stores/user';
import { useRouter } from 'vue-router';

export default {
  name: "MemberSidebar",
  emits: ['logout'],
  data() {
    return {
      showLogoutModal: false,
      isLoggingOut: false
    };
  },
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    return { router, userStore };
  },
  methods: {
    handleLogout() {
      // 顯示確認對話框
      this.showLogoutModal = true;
    },
    closeLogoutModal() {
      this.showLogoutModal = false;
    },
    async confirmLogout() {
      this.showLogoutModal = false;
      this.isLoggingOut = true;

      try {
        // 調用後端登出 API
        await axios.post("/api/logout", {}, { withCredentials: true });
        
        // 清除用戶狀態
        this.userStore.user = null;
        this.userStore.isBlacklisted = false;
        
        // 清除本地存儲
        localStorage.clear();
        sessionStorage.clear();
        
        // 發送登出事件給父組件
        this.$emit('logout');
        
        // 延遲一下讓用戶看到登出動畫
        setTimeout(() => {
          // 跳轉到登入頁
          this.router.replace('/login');
          
          // 防止用戶使用瀏覽器返回鍵
          window.history.pushState(null, "", "/login");
          window.addEventListener("popstate", () => {
            this.router.replace("/login");
          });
          
          // 重新加載頁面確保完全清除狀態
          window.location.reload();
        }, 500);
        
      } catch (err) {
        console.error("登出失敗:", err);
        alert("登出失敗，請重試");
      } finally {
        this.isLoggingOut = false;
      }
    }
  }
};
</script>

<style scoped>
:root {
  --milk-tea-dark: #8B6F47;      
  --milk-tea-medium: #e28e2ddc;    
  --milk-tea-light: #C9A88A;    
  --milk-tea-pale: #E8D5C4;      
  --cream: #F5EBE0;              
  --cream-white: #FAF6F1;        
  --text-dark: #5D4E37;          
  --text-medium: #8B7355;  
}

#sidebarMenu {
  width: 240px;
  min-width: 240px;
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg, var(--cream-white) 0%, var(--cream) 100%);
  border-right: 2px solid var(--milk-tea-pale);
  box-shadow: 4px 0 15px rgba(139, 111, 71, 0.08);
  transition: all 0.3s ease;
}

#sidebarMenu::-webkit-scrollbar {
  width: 6px;
}

#sidebarMenu::-webkit-scrollbar-track {
  background: transparent;
}

#sidebarMenu::-webkit-scrollbar-thumb {
  background: var(--milk-tea-light);
  border-radius: 3px;
}

#sidebarMenu::-webkit-scrollbar-thumb:hover {
  background: var(--milk-tea-medium);
}

.sidebar-header {
  padding: 1rem 1rem;
  background: linear-gradient(135deg, var(--milk-tea-medium) 0%, var(--milk-tea-dark) 100%);
  border-bottom: 2px solid var(--milk-tea-light);
  box-shadow: 0 2px 8px rgba(139, 111, 71, 0.15);
}

.sidebar-title {
  margin: 0;
  color: var(--cream-white);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}

.nav {
  padding: 0.15rem 0;
}

#sidebarMenu .nav-link {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.9rem;
  color: var(--text-dark);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  background: transparent;
}

#sidebarMenu .nav-link::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(180deg, var(--milk-tea-medium) 0%, var(--milk-tea-dark) 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
  border-radius: 0 4px 4px 0;
}

#sidebarMenu .nav-link i {
  font-size: 1.05rem;
  min-width: 24px;
  margin-right: 0.65rem;
  transition: all 0.3s ease;
  color: var(--milk-tea-medium);
}

#sidebarMenu .nav-link span {
  flex: 1;
}

#sidebarMenu .nav-item .nav-link:hover,
#sidebarMenu .nav-link:hover {
  color: #FFFFFF !important;
  transform: translateX(5px) !important;
  box-shadow: 0 2px 10px rgba(139, 111, 71, 0.15) !important;
}

#sidebarMenu .nav-item .nav-link:hover span,
#sidebarMenu .nav-link:hover span {
  color: #FFFFFF !important;
}

#sidebarMenu .nav-item .nav-link:hover i,
#sidebarMenu .nav-link:hover i {
  transform: scale(1.15) rotate(5deg) !important;
  color: #FFFFFF !important;
}

.nav-link.router-link-active,
.nav-link.router-link-exact-active {
  background: linear-gradient(135deg, var(--milk-tea-pale) 0%, rgba(247, 247, 247, 0.3) 100%);
  color: var(--milk-tea-dark);
  font-weight: 600;
  box-shadow: 0 3px 12px rgba(139, 111, 71, 0.18);
}

.nav-link.router-link-active::before,
.nav-link.router-link-exact-active::before {
  transform: scaleY(1);
}

.nav-link.router-link-active i,
.nav-link.router-link-exact-active i {
  color: var(--milk-tea-dark);
  transform: scale(1.2);
}

.nav-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--milk-tea-pale), transparent);
  margin: 0.35rem 1.25rem;
}

#sidebarMenu .logout-link {
  color: #8B4513;
}

#sidebarMenu .logout-link i {
  color: #A0522D;
}

#sidebarMenu .logout-link:hover {
  background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%) !important;
  color: #FFFFFF !important;
}

#sidebarMenu .logout-link:hover span {
  color: #FFFFFF !important;
}

#sidebarMenu .logout-link:hover i {
  color: #FFFFFF !important;
  transform: translateX(-3px) scale(1.1);
}

/* ========== 登出確認對話框 ========== */
.logout-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

.logout-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.logout-modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--milk-tea-pale);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logout-modal-header h5 {
  margin: 0;
  color: var(--text-dark);
  font-weight: 600;
}

.logout-modal-header .close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-medium);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.logout-modal-header .close-btn:hover {
  background: var(--milk-tea-pale);
  color: var(--milk-tea-dark);
}

.logout-modal-body {
  padding: 2rem;
  text-align: center;
}

.logout-icon {
  font-size: 3rem;
  color: #A0522D;
  margin-bottom: 1rem;
}

.logout-modal-body p {
  margin: 0;
  color: var(--text-dark);
  font-size: 1.1rem;
}

.logout-modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--milk-tea-pale);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-cancel {
  background: var(--milk-tea-pale);
  color: var(--text-dark);
}

.btn-cancel:hover {
  background: var(--milk-tea-light);
}

.btn-confirm {
  background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
  color: white;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 69, 19, 0.3);
}

/* ========== Loading 遮罩 ========== */
.logout-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.logout-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--milk-tea-pale);
  border-top-color: var(--milk-tea-medium);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.logout-loading-overlay p {
  margin-top: 1rem;
  color: var(--text-dark);
  font-weight: 600;
}

/* ========== 動畫 ========== */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.nav-item {
  animation: slideIn 0.3s ease-out forwards;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--milk-tea-medium), transparent);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 80%;
}

.nav-link .badge {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  background: linear-gradient(135deg, var(--milk-tea-medium) 0%, var(--milk-tea-dark) 100%);
  color: var(--cream-white);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(139, 111, 71, 0.2);
}

/* ========== 響應式設計 ========== */
@media (max-width: 992px) {
  #sidebarMenu {
    width: 220px;
    min-width: 220px;
  }

  .sidebar-title {
    font-size: 1.1rem;
  }

  .nav-link {
    font-size: 0.9rem;
    padding: 0.75rem 0.875rem;
  }

  .nav-link i {
    font-size: 1rem;
    min-width: 24px;
  }

  .logout-modal {
    max-width: 350px;
  }
}

@media (max-width: 768px) {
  #sidebarMenu {
    width: 70px;
    min-width: 70px;
  }

  .sidebar-header {
    padding: 1rem 0.5rem;
  }

  .sidebar-title {
    font-size: 0;
  }

  .sidebar-title::before {
    content: '☕';
    font-size: 1.5rem;
  }

  .nav-link span {
    display: none;
  }

  .nav-link {
    justify-content: center;
    padding: 0.875rem 0.5rem;
  }

  .nav-link i {
    margin-right: 0;
    font-size: 1.25rem;
  }

  .nav-link:hover {
    transform: scale(1.05);
  }

  .nav-divider {
    margin: 0.5rem 0.75rem;
  }

  .logout-modal {
    max-width: 320px;
  }
}
</style>