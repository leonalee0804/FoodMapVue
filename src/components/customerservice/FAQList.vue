<template>
    <div class="faq-list">
        <div v-for="(item, i) in faqs" :key="i" class="faq-item">
            <div class="faq-question" @click="toggle(i)">
                <span>{{ item.Q }}</span>
                <span class="icon">{{ openIndex === i ? '−' : '+' }}</span>
            </div>

            <transition name="fade">
                <div v-if="openIndex === i" class="faq-answer">
                    {{ item.A }}
                </div>
            </transition>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const faqs = ref([])
const openIndex = ref(null)

function toggle(i) {
    openIndex.value = openIndex.value === i ? null : i
}

onMounted(async () => {
    const res = await fetch('/src/assets/faqs.json') // 若放 public 請改成 '/faqs.json'
    faqs.value = await res.json()
})
</script>

<style scoped>
.faq-list {
    max-width: 600px;
    margin: 0 auto;
    font-family: system-ui, sans-serif;
}

.faq-item {

    border: 1px solid #ddd;
    border-radius: 8px;
    margin-bottom: 10px;
    background: #faf5ef;
}

.faq-question {
    width: 600px;
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    font-weight: 600;
}

.faq-answer {
    padding: 12px 16px;
    border-top: 1px solid #eee;
    background: #fafafa;
}

.icon {
    font-size: 18px;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>
