<template>
  <div v-if="menuData.length" class="menu-page">
    <h2 @click="toggleMenu" class="menu-title">
      點我瀏覽店內菜單
      <span class="arrow" :class="{ open: isOpen }">▼</span>
    </h2>

    <transition name="fade">
      <div v-show="isOpen" class="menu-container">
        <div v-for="(item, index) in menuData" :key="index" class="menu-item">
          <div class="menu-name">{{ item.name }}</div>
          <div class="menu-price">NT$ {{ item.price }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import menuJson from "@/assets/menu.json";
import { useRoute } from "vue-router";

const menuData = ref([]);
const isOpen = ref(false); // 預設折疊

const route = useRoute();

onMounted(() => {
  const vendorId = route.params.vendorId;
  menuData.value = menuJson[vendorId] || [];
});

function toggleMenu() {
  isOpen.value = !isOpen.value;
}
</script>

<style scoped>
.menu-page {
  width: 80%;
  margin: 0 auto 30px;
  text-align: center;
}

.menu-title {
  font-size: 1.8rem;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s;
}
.menu-title:hover {
  color: #4fb06e;
}

.arrow {
  font-size: 1rem;
  transition: transform 0.3s;
}
.arrow.open {
  transform: rotate(180deg);
}

.menu-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.menu-item {
  border: 1px solid #ddd;
  padding: 16px;
  border-radius: 8px;
  background: #fff;
  transition: transform 0.2s;
}
.menu-item:hover {
  transform: scale(1.03);
}

.menu-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}
.menu-price {
  font-size: 16px;
  color: #555;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}
</style>
