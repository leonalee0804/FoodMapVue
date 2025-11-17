<template>
  <div class="settings-card">
    <form @submit.prevent="submitForm" enctype="multipart/form-data">

      <!-- 頭像 -->
      <div class="mb-3 text-center">
        <img :src="avatarPreview || defaultAvatar"
             width="120"
             height="120"
             class="rounded-circle mb-2"
             style="object-fit: cover;">
        <input type="file"
               class="form-control mt-2"
               accept="image/*"
               @change="previewImage">
        <small class="text-muted d-block mt-2">最大1MB，支援 .PNG, .JPEG</small>
      </div>

      <!-- 姓名 -->
      <div class="mb-3">
        <label class="form-label fw-semibold text-secondary">姓名</label>
        <input type="text" class="form-control" v-model="localMember.userName" placeholder="姓名" />
      </div>

      <!-- 性別 -->
      <label class="form-label fw-semibold text-secondary d-block">性別</label>
      <div class="mb-3 gender-options text-center">
        <div class="radio-input d-inline-flex gap-3">
          <div class="radio-b" v-for="g in ['男','女','其他']" :key="g">
            <input class="radio-b__input"
                   type="radio"
                   :id="'gender-' + g"
                   :value="g"
                   v-model="localMember.gender" />
            <label class="radio-b__label" :for="'gender-' + g">
              <span class="radio-b__custom"></span> {{ g }}
            </label>
          </div>
        </div>
      </div>

      <!-- 生日 -->
      <div class="mb-3">
        <label class="form-label fw-semibold text-secondary">生日</label>
        <input type="date" class="form-control" v-model="localMember.birthdate">
      </div>

      <!-- 電話 -->
      <div class="mb-3">
        <label class="form-label fw-semibold text-secondary">電話</label>
        <input type="tel" class="form-control"
               inputmode="numeric"
               maxlength="10"
               placeholder="0912345678"
               v-model="localMember.phone"
               @input="localMember.phone = localMember.phone.replace(/[^0-9]/g, '')">
      </div>

      <!-- 城市 -->
      <div class="mb-3">
        <label class="form-label fw-semibold text-secondary">城市</label>
        <v-select
          :options="cities"
          label="city"
          v-model="selectedCity"
          placeholder="請選擇城市"
        />
      </div>

      <!-- 區域 -->
      <div class="mb-3">
        <label class="form-label fw-semibold text-secondary">區域</label>
        <v-select
          :options="districts"
          label="name"
          v-model="selectedDistrict"
          placeholder="請選擇區域"
          :disabled="districts.length === 0"
        />
      </div>

      <!-- 表單按鈕 -->
      <div class="form-actions d-flex gap-2">
        <button type="button" class="btn btn-secondary flex-fill" @click="resetForm">Reset</button>
        <button type="submit" class="btn btn-success flex-fill">Update</button>
      </div>

    </form>
  </div>
</template>

<script src="@/composables/member/memberSettings.js"></script>
<style src="@/assets/css/member/memberSettings.css" scoped></style>
