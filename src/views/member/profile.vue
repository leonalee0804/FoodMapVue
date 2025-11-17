<template>
  <div class="container-fluid">
    <div class="d-flex flex-row flex-nowrap">

      <!-- 使用獨立的 Sidebar 組件 -->
      <MemberSidebar @logout="logout" />

      <!-- Main content -->
      <main class="main-content flex-grow-1">

        <div class="row my-4">
          <!-- Left form - 表單在左邊 -->
          <div class="col-lg-7 col-12 mb-4 mb-lg-0">
            <div class="custom-block bg-white">
              <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li class="nav-item" role="presentation">
                  <button class="nav-link active" id="profile-tab" data-bs-toggle="tab"
                    data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane"
                    aria-selected="true">Profile</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="password-tab" data-bs-toggle="tab" data-bs-target="#password-tab-pane"
                    type="button" role="tab" aria-controls="password-tab-pane" aria-selected="false">Password</button>
                </li>
                <li class="nav-item" role="presentation">
                  <button class="nav-link" id="notification-tab" data-bs-toggle="tab"
                    data-bs-target="#notification-tab-pane" type="button" role="tab"
                    aria-controls="notification-tab-pane" aria-selected="false">Notification</button>
                </li>
              </ul>

              <div class="tab-content" id="myTabContent">

                <!-- Profile Tab -->
                <div class="tab-pane fade show active" id="profile-tab-pane" role="tabpanel"
                  aria-labelledby="profile-tab" tabindex="0">
                  <h6 class="mb-4">User Profile</h6>

                  <form @submit.prevent="submitProfile" enctype="multipart/form-data">
                    <input type="hidden" :value="member.memberId" name="memberId" />
                    <input type="hidden" :value="member.user.accountId" name="accountId" />

                    <!-- Avatar -->
                    <div class="mb-3 text-center">
                      <img :src="avatarPreview || avatarUrl" alt="會員頭像" id="avatarPreviewHome" width="120" height="120"
                        class="rounded-circle mb-2" style="object-fit: cover;" />
                      <input type="file" class="form-control mt-2" @change="onAvatarChange" accept="image/*">
                      <small class="text-muted d-block mt-2">最大1MB，支援 .PNG, .JPEG</small>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">姓名</label>
                      <input v-model="member.userName" type="text" class="form-control" required />
                    </div>

                    <div class="mb-3">
                      <label class="form-label d-block">性別</label>
                      <div>
                        <label><input type="radio" value="男" v-model="member.gender"> 男</label>
                        <label class="ms-3"><input type="radio" value="女" v-model="member.gender"> 女</label>
                        <label class="ms-3"><input type="radio" value="其他" v-model="member.gender"> 其他</label>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="form-label">生日</label>
                      <input type="date" class="form-control" v-model="member.birthdate">
                    </div>

                    <div class="mb-3">
                      <label class="form-label">電話</label>
                      <input type="tel" class="form-control" v-model="member.phone" pattern="^09\d{8}$" maxlength="10"
                        placeholder="請輸入手機號碼，例如：0912345678" required />
                    </div>

                    <div class="mb-3">
                      <label class="form-label">縣市</label>
                      <v-select append-to-body label="city" placeholder="請選擇縣市" :options="cities"
                        v-model="selectedCity" />
                    </div>

                    <div class="mb-3">
                      <label class="form-label">區域</label>
                      <v-select append-to-body label="name" placeholder="請選擇區域" :options="districts"
                        v-model="selectedDistrict" :disabled="districts.length === 0" />
                    </div>

                    <div class="d-flex">
                      <button type="reset" class="form-control me-3" @click.prevent="resetProfile">Reset</button>
                      <button type="submit" class="form-control ms-2">Update</button>
                    </div>
                  </form>
                </div>

                <!-- Password Tab -->
                <div class="tab-pane fade" id="password-tab-pane" role="tabpanel" tabindex="0">
                  <h6 class="mb-4">Password</h6>

                  <form @submit.prevent="updatePassword">
                    <input v-model="passwordForm.password" type="password" class="form-control mb-2"
                      placeholder="Current Password" required>
                    <input v-model="passwordForm.newPassword" type="password" class="form-control mb-2"
                      placeholder="New Password" required>
                    <input v-model="passwordForm.confirmPassword" type="password" class="form-control mb-3"
                      placeholder="Confirm Password" required>

                    <div class="d-flex">
                      <button type="reset" class="form-control me-3 flex-grow-1"
                        @click.prevent="resetPasswordForm">Reset</button>
                      <button type="submit" class="form-control ms-2 flex-grow-1">Update Password</button>
                    </div>
                  </form>
                </div>

                <!-- Notification Tab -->
                <div class="tab-pane fade" id="notification-tab-pane" role="tabpanel" tabindex="0">
                  <h6 class="mb-4">Notification</h6>
                  <form @submit.prevent="saveNotification">
                    <div class="form-check form-switch d-flex mb-3 ps-0">
                      <label class="form-check-label">Account activity</label>
                      <input class="form-check-input ms-auto" type="checkbox" v-model="notification.accountActivity">
                    </div>
                    <div class="form-check form-switch d-flex mb-3 ps-0">
                      <label class="form-check-label">Payment updated</label>
                      <input class="form-check-input ms-auto" type="checkbox" v-model="notification.paymentUpdated">
                    </div>
                    <div class="d-flex">
                      <button type="reset" class="form-control me-3 flex-grow-1"
                        @click.prevent="resetNotification">Reset</button>
                      <button type="submit" class="form-control ms-2 flex-grow-1">Save</button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>

          <!-- Right side - 信用卡輪播在右邊 -->
          <div class="col-lg-5 col-12">
            <div class="credit-cards-container">
              <!-- 信用卡輪播 -->
              <div class="card-carousel">
                <transition :name="transitionName" mode="out-in">
                  <div :key="currentCardIndex" class="credit-card-wrapper">
                    <div class="credit-card" :class="currentCard.type">
                      <!-- 卡片背景裝飾 -->
                      <div class="card-decoration"></div>
                      <div class="card-decoration-2"></div>
                      
                      <!-- 卡片品牌標誌 -->
                      <div class="card-brand">
                        <span v-if="currentCard.type === 'visa'" class="brand-logo">VISA</span>
                        <span v-else-if="currentCard.type === 'mastercard'" class="brand-logo">Mastercard</span>
                        <span v-else-if="currentCard.type === 'amex'" class="brand-logo">AMEX</span>
                        <span v-else class="brand-logo">JCB</span>
                      </div>

                      <!-- 晶片圖示 -->
                      <div class="card-chip">
                        <div class="chip-line"></div>
                        <div class="chip-line"></div>
                        <div class="chip-line"></div>
                        <div class="chip-line"></div>
                      </div>

                      <!-- 餘額 -->
                      <div class="card-balance">
                        <small>Available Balance</small>
                        <h2>{{ currentCard.balance }}</h2>
                      </div>

                      <!-- 卡號 -->
                      <div class="card-number">
                        <span v-for="(group, index) in currentCard.number" :key="index">
                          {{ group }}
                        </span>
                      </div>

                      <!-- 卡片資訊 -->
                      <div class="card-info">
                        <div class="card-holder">
                          <small>Card Holder</small>
                          <p>{{ currentCard.holder }}</p>
                        </div>
                        <div class="card-expiry">
                          <small>Valid Thru</small>
                          <p>{{ currentCard.expiry }}</p>
                        </div>
                        <div class="card-cvv">
                          <small>CVV</small>
                          <p>{{ currentCard.cvv }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- 卡片切換指示器 -->
              <div class="card-indicators">
                <button 
                  v-for="(card, index) in creditCards" 
                  :key="index"
                  @click="changeCard(index)"
                  :class="{ active: currentCardIndex === index }"
                  class="indicator-dot"
                >
                  <span class="dot-inner"></span>
                </button>
              </div>

              <!-- 左右切換按鈕 -->
              <div class="card-navigation">
                <button @click="prevCard" class="nav-btn prev-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button @click="nextCard" class="nav-btn next-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>

              <!-- 卡片說明 -->
              <div class="card-note">
                <p>💳 測試信用卡資料 - 僅供開發測試使用</p>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { memberProfile } from '@/composables/member/memberProfile.js';
import MemberSidebar from "@/components/member/memberSidebar.vue";

const {
  member, selectedCity, selectedDistrict, districts, avatarPreview,
  onAvatarChange, submitProfile, resetProfile, loading,
  passwordForm, resetPasswordForm, updatePassword,
  notification, resetNotification, saveNotification,
  cities
} = memberProfile();

// 信用卡假資料
const creditCards = ref([
  {
    type: 'visa',
    balance: 'NTD 1,800',
    number: ['****', '****', '****', '4242'],
    holder: 'Chen, Mei-Ling',
    expiry: '12/28',
    cvv: '***'
  },
  {
    type: 'mastercard',
    balance: 'NTD 750',
    number: ['****', '****', '****', '4444'],
    holder: 'Chen, Mei-Ling',
    expiry: '11/27',
    cvv: '***'
  },
  {
    type: 'amex',
    balance: 'NTD 3,350',
    number: ['****', '****', '****', '005'],
    holder: 'Chen, Mei-Ling',
    expiry: '09/26',
    cvv: '***'
  },
  {
    type: 'jcb',
    balance: 'NTD 1,750',
    number: ['****', '****', '****', '0000'],
    holder: 'Chen, Mei-Ling',
    expiry: '06/29',
    cvv: '***'
  }
]);

// 當前卡片索引
const currentCardIndex = ref(0);
const transitionName = ref('slide-left');

// 當前卡片
const currentCard = computed(() => creditCards.value[currentCardIndex.value]);

// 切換到指定卡片
const changeCard = (index) => {
  if (index > currentCardIndex.value) {
    transitionName.value = 'slide-left';
  } else {
    transitionName.value = 'slide-right';
  }
  currentCardIndex.value = index;
};

// 下一張卡片
const nextCard = () => {
  transitionName.value = 'slide-left';
  currentCardIndex.value = (currentCardIndex.value + 1) % creditCards.value.length;
};

// 上一張卡片
const prevCard = () => {
  transitionName.value = 'slide-right';
  currentCardIndex.value = currentCardIndex.value === 0 
    ? creditCards.value.length - 1 
    : currentCardIndex.value - 1;
};


</script>

<style scoped>
@import '@/assets/css/member/memberProfile.css';

/* 移除所有上方間距 */
.container-fluid {
  padding: 0 !important;
  margin: 0 !important;
}

.row.my-4 {
  margin-top: 0 !important;
  margin-bottom: 1.5rem !important;
}

/* 如果還有間距，可以用這個 */
.d-flex.flex-row.flex-nowrap {
  margin: 0 !important;
}
</style>