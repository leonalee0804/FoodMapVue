<template>
    <section class="activity">
        <h2>優惠活動</h2>

        <div class="coupon" v-for="(p, i) in promotions" :key="i">
            {{ p }}
        </div>
    </section>
</template>

---

<script setup>
import { ref, onMounted } from "vue";


// 目前靜態資料
const promotions = ref([
    "🎟 外帶自取 85 折",
    "🍽 週末限定套餐買一送一",
    "🎓 學生證享 9 折優惠",
]);

// 預留擴充
onMounted(() => {
    console.log("Promotions loaded:", promotions.value);
});
</script>

---

<style scoped>
.activity {
    margin-top: 60px;
    margin-left: 10%;
    /* 控制整體靠左距離 */
    width: 80%;
    max-width: 1000px;
    font-family: "Microsoft JhengHei", "Noto Sans TC", sans-serif;
    text-align: left;
    /* 確保整體左對齊 */
}

.activity h2 {
    margin: 50px 0 25px 30px;
    font-family: "YozaiLight", "Microsoft JhengHei", "Noto Sans TC", sans-serif;
    font-weight: 700;
    font-size: 3rem;
    text-align: left;
    color: #5b4636;
    position: relative;
    display: inline-block;
}

/*底線樣式 */
.activity h2::after {
    content: "";
    display: block;
    width: 400px;
    height: 4px;
    background: linear-gradient(to right, #d2691e, #e8a96b);
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(210, 105, 30, 0.3);
    margin-top: 8px;
}

/* 優惠券樣式 */
.coupon {
    position: relative;
    background: linear-gradient(135deg, #fff8e1, #fff3d1);
    border-left: 8px solid #d2691e;
    border-radius: 12px;
    padding: 20px 25px;
    margin: 15px 0;
    margin-left: 35px;
    width: 65%;
    color: #4b2e12;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 0.5px;
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.08);
    text-align: left;
    transition: all 0.25s ease;
    cursor: pointer;
}

/* 滑過浮起效果 */
.coupon:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* 小圓孔效果（視覺細節） */
.coupon::before,
.coupon::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 16px;
    height: 16px;
    background: #fff;
    border: 2px solid #d2691e;
    border-radius: 50%;
    transform: translateY(-50%);
}

.coupon::before {
    left: -10px;
}

.coupon::after {
    right: -10px;
}
</style>
