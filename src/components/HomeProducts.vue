<template>
    <section class="home-products">
        <h2 class="section-title">
            <slot name="title">精選優惠商品</slot>
        </h2>

        <div v-if="products.length" class="product-list">
            <div v-for="p in products" :key="p.productId" class="product-card">
                <img :src="getImageUrl(p.picUrl)" alt="商品圖片" class="product-img" />
                <h4 class="product-name">{{ p.productName }}</h4>
                <p class="price">原價：$ {{ p.unitPrice }}</p>
                <p v-if="p.specialPrice" class="special">限時特價：$ {{ p.specialPrice }}</p>
                <button class="add-btn" @click="addToCart(p)">加入購物車</button>
            </div>
        </div>

        <p v-else class="no-data">目前沒有商品資料</p>
    </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

const props = defineProps({
    vendorId: { type: Number, default: 11 } // 可切換要展示的店家
});

const products = ref([]);

onMounted(() => {
    getProducts();
});

async function getProducts() {
    try {
        console.log("讀取 vendorId =", props.vendorId);
        const response = await axios.get(`http://localhost:8082/vProduct/${props.vendorId}`);
        products.value = response.data.map(p => ({ ...p, quantity: 1 }));
    } catch (error) {
        console.error("讀取商品失敗:", error);
        Swal.fire("讀取商品失敗", error.message, "error");
    }
}

function getImageUrl(picName) {
    return `http://localhost:8082/Product_Pic/${picName}`;
}

function addToCart(product) {
    Swal.fire(`已加入購物車：${product.productName}`, "", "success");
}
</script>

<style scoped>
.home-products {
    margin: 60px auto;
    max-width: 1200px;
    text-align: left;
    padding: 0 10px;
}

.section-title {
    margin: 50px 0 25px 30px;
    font-family: "YozaiLight", "Microsoft JhengHei", "Noto Sans TC", sans-serif;
    font-weight: 700;
    font-size: 3rem;
    text-align: left;
    color: #5b4636;
    position: relative;
    display: inline-block;
}

.section-title::after {
    content: "";
    display: block;
    width: 400px;
    height: 4px;
    background: linear-gradient(to right, #d2691e, #e8a96b);
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(210, 105, 30, 0.3);
    margin-top: 8px;
}

.product-list {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    scroll-behavior: smooth;
    padding-bottom: 10px;
    align-items: stretch;
}

.product-card {
    flex: 0 0 260px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #fdf8f3;
    border: 1px solid #e4d8c5;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    padding: 15px;
    transition: transform 0.2s;
}


.product-card:hover {
    transform: scale(1.03);
}

.product-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 6px;
    margin-bottom: 10px;
}

.product-name {
    color: #4a2f1b;
    font-weight: 600;
}

.price {
    color: #666;
    margin: 5px 0;
}

.special {
    color: #d43b17;
    font-weight: bold;
}

.add-btn {
    background-color: #d2691e;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 8px;
}

.add-btn:hover {
    background-color: #b85b17;
}

.no-data {
    color: #999;
    font-size: 1rem;
    margin-top: 10px;
}
</style>
