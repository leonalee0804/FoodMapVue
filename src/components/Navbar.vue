<template>
    <header>
        <nav class="navbar">
            <a href="/" class="logo">
                <img src="/images/logo5.png" alt="首頁" />
            </a>
            <a href="#">訂位</a>
            <a href="#">客服</a>
            <a href="#">帳號與資料管理</a>
            <a href="http://localhost:5174/login">登入/註冊</a>
            <a href="#" class="cart-link">
                <img src="/images/cart.jpeg" alt="購物車" class="cart-icon" />
            </a>
        </nav>
    </header>
</template>

<script setup lang='ts'>

</script>

<style>
header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background-color: rgba(255, 248, 240, 0.95);
    padding: 10px 30px;
    z-index: 1000;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

/* 導覽列 */
nav {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 180px;
}

nav .logo img {
    max-height: 70px;
    /* 保持原有佔位高度 */
    width: auto;
    object-fit: contain;
    vertical-align: middle;
    transform: scale(1.25);
    transform-origin: left center;

}

nav .logo {
    margin-left: 45px;
}

nav a {
    text-decoration: none;
    font-size: 18px;
    color: #000000;
    font-family: "Yozai", "Microsoft JhengHei", serif;
    font-weight: 400;
    letter-spacing: 0.5px;
    transition: color 0.2s;
    margin-right: 20px;
}

nav a:hover {
    color: #d2691e;
}

/* === 購物車圖示樣式 === */
.cart-link {
    display: inline-flex;
    align-items: center;
    margin-left: auto;
    margin-right: 80px;
}

.cart-icon {
    width: 30px;
    height: 30px;
    object-fit: contain;
    cursor: pointer;
    transition: transform 0.2s;
}

.cart-icon:hover {
    transform: scale(1.1);
}
</style>