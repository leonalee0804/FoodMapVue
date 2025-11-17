<template>
  <div>
    <component :is="currentHeader" />

    <router-view />
    <ChatBot />
    <Footer />
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useUserStore } from "@/stores/user";
import Header from "@/components/Header.vue";
import VendorHeader from "@/components/VendorHeader.vue";
import ChatBot from "@/components/ChatBot.vue";
import Footer from "@/components/Footer.vue";

const userStore = useUserStore();

const currentHeader = computed(() => {
  if (userStore.user?.roleId === 3) return VendorHeader; // 廠商
  return Header; // 其他角色或未登入
});
</script>
