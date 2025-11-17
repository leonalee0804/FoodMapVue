<template>
  <div class="card p-3 mb-4 shadow-sm">
    <div id="role-chart" class="mb-4"></div>
    <div id="status-chart"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { renderAccountCharts } from "@/assets/js/charts.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

onMounted(() => {
  renderAccountCharts("role-chart", "status-chart", API_BASE_URL);
});
</script>
