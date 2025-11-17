<template>
    <div class="carousel" @mouseenter="pauseSlide" @mouseleave="resumeSlide">
        <!-- 幻燈片區 -->
        <div class="slides" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="(slide, i) in slides" :key="i" class="slide">
                <router-link to="/adevent" class="slide-link">
                    <img :src="slide" alt="廣告圖片" class="slide-img" />
                </router-link>
            </div>
        </div>

        <!-- 左右切換 -->
        <button class="prev" @click="prevSlide">&#10094;</button>
        <button class="next" @click="nextSlide">&#10095;</button>

        <div class="dots">
            <span v-for="(s, i) in slides" :key="i" :class="['dot', { active: i === currentSlide }]"
                @click="goToSlide(i)"></span>
        </div>

        <slot></slot>
    </div>

</template>

---

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
    slides: {
        type: Array,
        default: () => [
            "/images/ADmain2.png",
            "/images/brunch2.jpeg",
            "/images/jpn2.jpg",
        ],
    },
    interval: { type: Number, default: 5000 },
});

const currentSlide = ref(0);
let timer = null;

function nextSlide() {
    currentSlide.value = (currentSlide.value + 1) % props.slides.length;
}
function prevSlide() {
    currentSlide.value =
        (currentSlide.value - 1 + props.slides.length) % props.slides.length;
}
function goToSlide(i) {
    currentSlide.value = i;
}

function startAutoSlide() {
    timer = setInterval(nextSlide, props.interval);
}
function pauseSlide() {
    clearInterval(timer);
}
function resumeSlide() {
    startAutoSlide();
}

onMounted(startAutoSlide);
onUnmounted(pauseSlide);
</script>

---

<style scoped>
.carousel {
    position: relative;
    width: 100vw;
    height: 575px;
    margin: 0;
    left: 50%;
    right: 50%;
    transform: translateX(-50%);
    overflow: visible;
    border-radius: 0;
    box-shadow: none;
    background-color: #000;
    z-index: 1;
}

/* 左右漸層遮罩效果 */
.carousel::before,
.carousel::after {
    content: '';
    position: absolute;
    top: 0;
    width: 100px;
    height: 100%;
    z-index: 5;
    pointer-events: none;
}

.carousel::before {
    left: 0;
    background: linear-gradient(to right, rgba(0, 0, 0, 0.3), transparent);
}

.carousel::after {
    right: 0;
    background: linear-gradient(to left, rgba(0, 0, 0, 0.3), transparent);
}

.slides {
    display: flex;
    transition: transform 0.5s ease-in-out;
    width: 100%;
    height: 100%;
}

.slide {
    flex: 0 0 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.slide-link {
    display: block;
    width: 100%;
    height: 100%;
}

.slide-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    background-color: #000;
    transition: opacity 0.3s ease;
    border-radius: 0;
    cursor: pointer;
}

.slide-img:hover {
    opacity: 0.9;
}

/* 左右箭頭 - 優化版 */
.prev,
.next {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    border-radius: 50%;
    font-size: 18px;
    z-index: 10;
    transition: all 0.3s ease;
    opacity: 0.7;
}

.prev {
    left: 10px;
}

.next {
    right: 10px;
}

.prev:hover,
.next:hover {
    background: rgba(0, 0, 0, 0.8);
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
}

/* dots 指示點 - 優化版 */
.dots {
    position: absolute;
    bottom: 15px;
    width: 100%;
    text-align: center;
    z-index: 10;
}

.dot {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin: 0 5px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s ease;
}

.dot:hover {
    transform: scale(1.2);
    background: rgba(255, 255, 255, 0.8);
}

.dot.active {
    background: #d2691e;
    transform: scale(1.3);
}

/* 響應式設計 */
@media (max-width: 768px) {
    .carousel {
        height: 400px;
    }

    .prev,
    .next {
        padding: 8px 12px;
        font-size: 16px;
    }

    .carousel::before,
    .carousel::after {
        width: 50px;
        /* 平板上縮小漸層寬度 */
    }
}

@media (max-width: 480px) {
    .carousel {
        height: 280px;
    }

    .prev,
    .next {
        padding: 6px 10px;
        font-size: 14px;
    }

    .carousel::before,
    .carousel::after {
        width: 30px;
        /* 手機上進一步縮小 */
    }

    .dot {
        width: 10px;
        height: 10px;
        margin: 0 3px;
    }
}
</style>
